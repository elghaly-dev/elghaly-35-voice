// Iris rules: deterministic message and link checks that run in the browser.
//
// Ported from elghaly-dev/iris-alexa (MIT, same owner) at commit 75479b3:
//   src/scam.ts            the 9 message patterns, unchanged regexes
//   src/links.ts           host normalisation, punycode, lookalike and short-link checks
//   src/reported-hosts.ts  the small reported-host list (exact host match)
//   src/refusals.ts        seed-phrase recognition (12 or 24 BIP-39 words in a row)
// Changes in this port: each rule also returns the text that matched (the evidence),
// every URL in a message is checked (not only the first), "[.]" and "hxxp" are undone
// before parsing, and results map to three statuses. There is no "safe" status.
//
// Nothing here makes a network call. Links are parsed as text and never opened.

import BIP39_WORDS from "./bip39-english.js";

export const STATUS = Object.freeze({
  KNOWN: "known-malicious",
  SUSPICIOUS: "suspicious",
  UNKNOWN: "unknown",
});

export const NOT_A_CLEARANCE = "This is not a clearance.";

// ---------- Message patterns (src/scam.ts) ----------

const SECRET =
  "(?:\\d+\\s*-?\\s*words?\\s+(?:seed\\s+|recovery\\s+)?phrase|seed\\s*phrase|seedphrase|recovery\\s*(?:phrase|words)|mnemonic|secret\\s*(?:phrase|words|recovery\\s*phrase)|backup\\s*phrase|private\\s*key)";
const ASK_VERB =
  "(?:reply\\s+with|enter|confirm|send|share|type|provide|paste|submit|give|input|upload|verify|fill\\s+in|drop|post)";
const SEED_ASK = new RegExp(
  `${ASK_VERB}\\s+(?:(?:me|us)\\s+)?(?:(?:your|the|my|a|an)\\s+)?(?:\\w+\\s+){0,2}?${SECRET}`,
  "gi",
);
const SEED_QUESTION = new RegExp(`what\\s+(?:is|are|was)\\s+(?:your|the)\\s+(?:\\w+\\s+){0,2}?${SECRET}`, "i");
const NEGATED_BEFORE = /(?:never|do\s+not|don't|dont|do\s+never|should\s+not|shouldn't|must\s+not)\s*(?:\w+\s+)?$/i;

/** The text from the first match to the end of the second, when they sit close together. */
function span(text, a, b) {
  const start = Math.min(a.index, b.index);
  const end = Math.max(a.index + a[0].length, b.index + b[0].length);
  return end - start <= 120 ? text.slice(start, end) : `${a[0]} … ${b[0]}`;
}

const first = (text, ...res) => {
  for (const re of res) {
    const m = re.exec(text);
    if (m) return m[0];
  }
  return null;
};

function asksForSeed(text) {
  const re = new RegExp(SEED_ASK.source, "gi");
  let match;
  while ((match = re.exec(text)) !== null) {
    const before = text.slice(Math.max(0, match.index - 24), match.index);
    if (NEGATED_BEFORE.test(before)) continue;
    return match[0];
  }
  return first(text, SEED_QUESTION);
}

function fakeAirdrop(text) {
  const drop = /airdrop/.exec(text);
  const verb = /\b(?:claim|eligible|allocation|selected|participate|chosen|approve|ready|unlocked|expires?)\b/.exec(text);
  if (drop && verb) return span(text, drop, verb);
  return first(
    text,
    /\bclaim\s+(?:your|the|my|this|a)?\s*(?:free\s+)?(?:reward|tokens?|prize|allocation|bonus|sol\b)/,
    /\bfree\s+(?:sol|tokens?|nft|mint)\b.{0,40}\b(?:claim|link|connect|now)\b/,
  );
}

function urgentVerifyWallet(text) {
  const verify = /verify (?:your |my |the )?(?:wallet|ownership|account)/.exec(text);
  if (verify && !/\bnever\b.{0,20}verify/.test(text)) return verify[0];
  const suspend = /has not (?:yet )?been verified/.exec(text);
  if (suspend && /suspend/.test(text)) return suspend[0];
  return first(
    text,
    /authorize (?:your |my |the )?wallet/,
    /wallet verification|confirm your wallet|unverified (?:wallets?|accounts?)/,
    /urgent.{0,48}(?:link|verify|wallet)/,
    /click (?:here|this link|the (?:link|button) below).{0,48}(?:verify|wallet)/,
  );
}

function validateOrSync(text) {
  const verb =
    /\b(?:validate|validation|re-?validate|sync|synchronize|synchroni[sz]ation|re-?sync|rectify|rectificat\w*|re-?activate|reconnect(?:ing)?|re-?connect(?:ing)?)\b.{0,48}\bwallet/.exec(text);
  const threat =
    /\b(?:deactivat\w*|suspend\w*|lock(?:ed)?|restrict\w*|disabl\w*|expir\w*|terminat\w*|lose (?:your )?(?:funds|assets|access)|within \d+\s*(?:hours?|hrs|days?)|\d+\s*hours?|immediately|node error|below|link|website|dapp)\b/.exec(text);
  if (verb && threat) return span(text, verb, threat);
  return first(text, /\b(?:rectificat\w*|reconnect(?:ing)?|re-?connect(?:ing)?)\b.{0,48}\bwallet/);
}

function qrCode(text) {
  return first(
    text,
    /\bscan\s+(?:this|the|that|my|our)\s+(?:\w+\s+)?qr\b/,
    /\bqr code\b.{0,40}\b(?:wallet|phantom|solflare|backpack|connect|claim|verify|receive|sign)/,
  );
}

function thirdPartyConnectTails(text) {
  const tails = [];
  const re = /\bconnect\s+(?:your|the)\s+(?:\w+\s+)?wallet\b/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const before = text.slice(Math.max(0, match.index - 24), match.index);
    if (NEGATED_BEFORE.test(before)) continue;
    tails.push({ head: match[0], tail: text.slice(match.index + match[0].length, match.index + match[0].length + 40) });
  }
  return tails;
}

function doublingGiveaway(text) {
  return first(
    text,
    /\bdouble\s+(?:your|the|my|all)\s+(?:sol|crypto|coins?|tokens?|money|funds|deposit|holdings|investment)\b/,
    /\b(?:send|deposit|transfer)\b.{0,60}\bsol\b.{0,90}\b(?:receive|get|sent?\s+back|back|return(?:ed)?|double|2x|twice|instantly)\b/,
    /\b(?:2x|3x|10x|twice|double)\b.{0,30}\b(?:back|return|payout|instantly|to your wallet)\b/,
    /\bgiveaway\b.{0,60}\b(?:send|deposit|wallet address|to participate)\b/,
    /\bstaking pool\b.{0,60}\b(?:double|2x|\d{2,4}\s*%\s*(?:daily|weekly|apy|return))/,
  );
}

const CONNECT_TO_PROCEED =
  /^\s*.{0,30}?\b(?:to|and|so)\s+(?:we\s+can\s+|you\s+can\s+|i\s+can\s+)?(?:proceed|continue|fix|restore|resolve|recover|unlock|verify|claim|receive|complete|confirm|rectify|sync|validate|migrate|get)\b/;
const CONNECT_HERE = /^\s*(?:here|below|now|via|at|using|on|through|with)\b/;

function whatWalletAsk(text) {
  return /\b(?:what|which)\s+wallet\s+(?:are|do)\s+you\s+(?:use|using|have|on)\b|\bwhat wallet are you\b/.exec(text);
}

function whatWalletIsScamSignal(text) {
  const ask = whatWalletAsk(text);
  if (!ask) return null;
  const companion =
    /\b(?:reconnect|re-?connect|sync|synchroni|rectif|validat|dapp)/.test(text) ||
    /\[link\]/.test(text) ||
    /\buse\s+[a-z][a-z0-9_-]{2,}\b/.test(text) ||
    /\bsupport\b/.test(text);
  return companion ? ask[0] : null;
}

function fakeSupport(text) {
  const direct = first(
    text,
    /fake support/,
    /(?:i am|this is|i'm|we are|we're)\s+(?:from\s+|with\s+|the\s+|a\s+|an\s+|part of\s+|on\s+)?(?:(?!need|looking|seeking|asking|here|new|after)\w+\s+)?(?:official\s+)?(?:support|customer service|help desk|technical team|tech team|moderator|admin team)\b/,
    /(?:support|help desk|customer service|admin|representative|agent|moderator|dev team).{0,40}(?:dm|dm'd|dmed|direct message|telegram|whatsapp|discord|texted|messaged|reached out|contacted)/,
    /(?:dm|dmed|telegram|whatsapp|discord|messaged|texted).{0,40}(?:support|help desk|customer service|moderator|admin)/,
  );
  if (direct) return direct;
  const wallet = whatWalletIsScamSignal(text);
  if (wallet) return wallet;
  if (/\bdapp\b/.test(text)) {
    const m = /\bconnect\b.{0,40}\bwallet\b|\bwallet\b.{0,40}\bconnect\b|\breconnect/.exec(text);
    if (m) return m[0];
  }
  for (const { head, tail } of thirdPartyConnectTails(text)) {
    if (CONNECT_TO_PROCEED.test(tail) || CONNECT_HERE.test(tail)) return (head + tail).trim();
  }
  const ticket = /\b(?:open a ticket|raise a ticket|ticket)\b.{0,40}\b(?:wallet|funds|recover|restore)\b/.exec(text);
  if (ticket && /\b(?:dm|link|form|below|here)\b/.test(text)) return ticket[0];
  return first(text, /\bshare (?:your )?screen\b.{0,40}\b(?:wallet|fix|support|help)\b/);
}

function unlimitedApproval(text) {
  return first(
    text,
    /\b(?:unlimited|infinite|maximum|max|unrestricted)\b.{0,30}\b(?:approval|approve|allowance|spend(?:ing)?\s+limit|spend(?:ing)?\s+cap|access|permission|delegate)/,
    /\b(?:approval|approve|allowance|spend(?:ing)?\s+limit|access|delegate)\b.{0,30}\b(?:unlimited|infinite|maximum|max|unrestricted|for all your tokens)\b/,
  );
}

function authorityChange(text) {
  return first(
    text,
    /setauthority|set\s*authority|authority\s+change|change\s+(?:the\s+|its\s+|your\s+|my\s+)?(?:owner|authority|mint authority|freeze authority)|transfer\s+authority|new\s+authority|freeze\s+authority|owner\s+authority|system\s+assign\b|assign(?:s|ed|ing)?\s+(?:your|the|my)\s+account|assign\s+instruction|reassign(?:s|ed)?\s+(?:your|the)\s+(?:account|wallet)/,
  );
}

const OPEN_APP = "Open the official app yourself from the icon you installed. Do not use a link from the message.";

export const MESSAGE_RULES = [
  {
    id: "seed_phrase_request",
    title: "Asks for your seed phrase",
    find: asksForSeed,
    why: "Someone is asking for the wallet's seed phrase or recovery words. Those words are the wallet. A real app, exchange or support desk never needs them.",
    next: [
      "Do not type, photograph or send the words.",
      "Delete the chat.",
      "If you already sent them, move what is left to a new wallet you create yourself on a device you trust, and never reuse the exposed words.",
    ],
  },
  {
    id: "fake_support_dm",
    title: "Fake support",
    find: fakeSupport,
    why: "A third party that claims to be support, asks which wallet you use, or tells you to connect a wallet to fix something is a common theft path. Real support does not open a private chat to fix a wallet.",
    next: ["Do not reply, and do not move funds because the message said to.", "Close the chat. Do not share your screen.", OPEN_APP],
  },
  {
    id: "fake_airdrop",
    title: "Fake airdrop or claim",
    find: fakeAirdrop,
    why: "Unsolicited airdrop and claim messages are a fixed scam pattern. The claim page is how the approval or the seed request arrives.",
    next: [
      "Do not open the claim link and do not connect a wallet to it.",
      "Ignore a token that appeared by itself.",
      "If you already signed, paste the public signature into the Chain read card, then follow the Phone check.",
    ],
  },
  {
    id: "doubling_giveaway",
    title: "Send and get double back",
    find: doublingGiveaway,
    why: "Send X and receive 2X back is a fixed theft pattern. Nothing comes back.",
    next: [
      "Do not send SOL or any token to the address.",
      "Block the account and report the post.",
      "If you already sent, do not answer a recovery offer: those are the second step of the same scam.",
    ],
  },
  {
    id: "unlimited_approval",
    title: "Unlimited approval",
    find: unlimitedApproval,
    why: "An unlimited or maximum approval lets another program move that token later, without asking you again.",
    next: [
      "Do not approve an unlimited amount for a program you did not open yourself.",
      "If it is already signed, revoke that approval inside the wallet you installed yourself.",
      "Paste the public signature into the Chain read card to see what was signed.",
    ],
  },
  {
    id: "authority_change",
    title: "Authority change",
    find: authorityChange,
    why: "An authority change (SetAuthority, or an Assign that reassigns your account) hands control of an account to someone else.",
    next: [
      "Do not sign a SetAuthority or Assign you did not mean to make.",
      "If it already landed, treat that account as out of your control.",
      "Move what you still control to a new wallet created on a device you trust.",
    ],
  },
  {
    id: "urgent_verify_wallet_link",
    title: "Urgent \"verify your wallet\"",
    find: urgentVerifyWallet,
    why: "An urgent link that says to verify the wallet is a fixed scam pattern. Verification is the prompt that asks you to connect, approve or type the seed.",
    next: ["Do not open the link.", "Do not connect a wallet and do not enter recovery words.", "Check the account by opening the official app yourself."],
  },
  {
    id: "validate_or_sync_wallet",
    title: "\"Validate or sync your wallet\"",
    find: validateOrSync,
    why: "A notice that the wallet must be validated, synced or rectified before it is deactivated is a fixed scam pattern. Wallets do not deactivate.",
    next: [
      "Do not open the link and do not connect a wallet to it.",
      "Open the wallet app yourself. If it shows your balance, nothing needed syncing.",
      "Never type recovery words into a page that says sync or validate.",
    ],
  },
  {
    id: "qr_code_connect",
    title: "QR code to scan with a wallet",
    find: qrCode,
    why: "A QR code you scan with the wallet app opens a connection or a signing request. Scanning one from a stranger is the same as connecting to their site.",
    next: [
      "Do not scan the code with any wallet.",
      "If you already scanned it, open the wallet yourself and remove the connected site.",
      "Send funds by pasting an address you verified, not by scanning a code someone posted.",
    ],
  },
];

// ---------- Links (src/links.ts, src/reported-hosts.ts) ----------

export const OFFICIAL_DOMAINS = {
  phantom: ["phantom.com", "phantom.app"],
  solflare: ["solflare.com"],
  backpack: ["backpack.app"],
  jupiter: ["jup.ag"],
  raydium: ["raydium.io"],
  orca: ["orca.so"],
  kamino: ["kamino.com"],
  jito: ["jito.network"],
  marinade: ["marinade.finance"],
  drift: ["drift.trade"],
  sanctum: ["sanctum.so"],
  tensor: ["tensor.trade"],
  magiceden: ["magiceden.us"],
  pump: ["pump.fun"],
  save: ["save.finance"],
  solana: ["solana.com"],
  ledger: ["ledger.com"],
  tangem: ["tangem.com"],
  trezor: ["trezor.io"],
  metamask: ["metamask.io"],
};

const SHARED_HOSTING = new Set(["pages.dev", "vercel.app", "netlify.app", "github.io", "web.app", "firebaseapp.com", "workers.dev"]);
const SPELLING_BRANDS = ["phantom", "solflare", "backpack", "jupiter", "raydium", "metamask", "tangem", "trezor", "ledger"];
const BRAND_MARKERS = {
  phantom: /phantom|phant0m|fantom/,
  solflare: /solflare|s0lflare|solfare/,
  backpack: /backpack|backpak/,
  jupiter: /jupiter|jupiterag|^jup$|^jupag$/,
  raydium: /raydium|rayd1um|radyium/,
  metamask: /metamask|metamaskio/,
  ledger: /ledger/,
  tangem: /tangem/,
  trezor: /trezor/,
  solana: /solana|s0lana|salana/,
  orca: /^orca$/,
  kamino: /kamino/,
  jito: /^jito$/,
  marinade: /marinade/,
  drift: /^drift$/,
  sanctum: /sanctum/,
  tensor: /tensor/,
  magiceden: /magiceden|magic-eden/,
  pump: /^pump$/,
  save: /^save$/,
};
const SHORT_LINK_HOSTS = new Set([
  "bit.ly", "bitly.com", "t.co", "tinyurl.com", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "shorturl.at",
  "t.ly", "ow.ly", "buff.ly", "rebrand.ly", "lnkd.in", "s.id", "tiny.cc", "bl.ink", "short.io", "qrco.de",
]);
const LURE_WORD = /(?:claim|airdrop|drop|sync|rectif\w*|repair|auth|reward|verify)/i;
const URL_IN_TEXT =
  /(?:https?:\/\/|www\.)[^\s<>"'()]+|\b(?:[a-z0-9-]+\.)+(?:[a-z]{2,24}|xn--[a-z0-9-]+)(?:\/[^\s<>"'()]*)?/gi;

// Defanged on purpose; "[.]" is turned back into "." only for lookup.
export const REPORTED_HOSTS = [
  { defanged: "phanton[.]app", source: "Check Point Research", date: "2021-11-04" },
  { defanged: "phantonn[.]app", source: "Check Point Research", date: "2021-11-04" },
  { defanged: "tickets-ledger[.]com", source: "SEAL weekly", date: "2026-09-29" },
  { defanged: "keys-tangem[.]com", source: "SEAL weekly", date: "2026-09-29" },
  { defanged: "signature[.]land", source: "SlowMist", date: "2025-06-02" },
  { defanged: "s[.]auths-repair[.]online", source: "Know Your Crook", date: "2022-04-04" },
  { defanged: "phanton[.]pro", source: "PCrisk", date: null },
  { defanged: "phanstart[.]live", source: "PCrisk", date: null },
  { defanged: "soldrop[.]w3claim[.]xyz", source: "PCrisk", date: null },
  { defanged: "soldrop[.]solvault[.]ws", source: "PCrisk", date: null },
  { defanged: "sol[.]dot-io[.]cc", source: "PCrisk", date: null },
  { defanged: "token-skr[.]org", source: "PCrisk", date: null },
  { defanged: "skr[.]solplanet[.]cc", source: "PCrisk", date: null },
  { defanged: "hubsync-dev[.]pages[.]dev", source: "PCrisk", date: null },
  { defanged: "blockchainsynced[.]pages[.]dev", source: "PCrisk", date: null },
];
const REPORTED = new Map(REPORTED_HOSTS.map((e) => [e.defanged.replaceAll("[.]", ".").toLowerCase(), e]));

/** Show a host without making it a live link anywhere it is pasted. */
export const defang = (host) => host.replaceAll(".", "[.]");

function parseHostname(raw) {
  const trimmed = raw.replace(/[.,;:!?]+$/g, "").trim();
  if (!trimmed) return null;
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    let host = new URL(withScheme).hostname.toLowerCase();
    if (host.endsWith(".")) host = host.slice(0, -1);
    return host || null;
  } catch {
    return null;
  }
}

/** Undo common defanging so "phanton[.]app" and "hxxps://" are checked like normal links. */
export function refang(text) {
  return text.replace(/\[\.\]|\(\.\)|\{\.\}/g, ".").replace(/\bhxxp(s?):\/\//gi, "http$1://");
}

/** Every distinct host found in the text, in order. Unicode hosts come back as xn--. */
export function hostsIn(text) {
  const out = [];
  const clean = refang(text);
  // A single token may be a Unicode domain the ASCII finder would chop.
  if (!/\s/.test(clean.trim())) {
    const whole = parseHostname(clean.trim());
    if (whole && whole.includes(".")) return [whole];
  }
  for (const m of clean.matchAll(URL_IN_TEXT)) {
    const host = parseHostname(m[0]);
    if (host && host.includes(".") && !out.includes(host)) out.push(host);
  }
  // Unicode lookalike hosts without a scheme ("phаntom.app" with a Cyrillic letter).
  for (const m of clean.matchAll(/(?:https?:\/\/)?((?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,24})/gu)) {
    if (/^[\x00-\x7f]*$/.test(m[1])) continue;
    const host = parseHostname(m[1]);
    if (host && !out.includes(host)) out.push(host);
  }
  return out;
}

const labels = (host) => host.split(".").filter(Boolean);

function isOfficialHost(host) {
  if (SHARED_HOSTING.has(host)) return null;
  for (const [brand, domains] of Object.entries(OFFICIAL_DOMAINS)) {
    for (const d of domains) if (host === d || host.endsWith(`.${d}`)) return brand;
  }
  return null;
}

function embeddedOfficialDomain(host) {
  for (const [brand, domains] of Object.entries(OFFICIAL_DOMAINS)) {
    for (const d of domains) {
      if (host === d || host.endsWith(`.${d}`)) continue;
      if (host.includes(`${d}.`)) return { brand, domain: d };
    }
  }
  return null;
}

function brandInHost(host) {
  for (const label of labels(host)) {
    for (const piece of [label, ...label.split(/[-_]/)]) {
      for (const [brand, marker] of Object.entries(BRAND_MARKERS)) {
        const m = marker.exec(piece);
        if (m) return { brand, piece: m[0] };
      }
    }
  }
  return null;
}

function lureInHost(host) {
  for (const label of labels(host)) {
    for (const piece of label.split(/[-_]/)) {
      if (piece && LURE_WORD.test(piece)) return piece;
    }
  }
  return null;
}

export function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  const cur = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

function misspelledBrand(host) {
  if (isOfficialHost(host)) return null;
  const pieces = [];
  for (const label of labels(host)) pieces.push(label, ...label.split(/[-_]/).filter(Boolean));
  for (const piece of pieces) {
    if (piece.length < 4) continue;
    for (const brand of SPELLING_BRANDS) {
      if (piece === brand || Math.abs(piece.length - brand.length) > 2) continue;
      if (editDistance(piece, brand) <= 2) return { brand, piece };
    }
  }
  return null;
}

const officialOf = (brand) => (OFFICIAL_DOMAINS[brand] ?? [])[0];
const nice = (brand) => brand.charAt(0).toUpperCase() + brand.slice(1);
const DO_NOT_CONNECT = "Do not connect a wallet to it and do not enter recovery words.";

/** One host → one finding with status, reason, evidence and next steps. */
export function checkHost(host) {
  const shown = defang(host);
  const typeOfficial = (brand) => `If you need ${brand}, type ${officialOf(brand) ?? "the official address"} yourself or open the app you installed.`;

  if (labels(host).some((l) => l.startsWith("xn--"))) {
    return {
      kind: "link", host: shown, status: STATUS.SUSPICIOUS, reason: "punycode_host", title: "Hidden lookalike letters (punycode)",
      evidence: `${shown}: a label starts with xn--`,
      why: "The host uses punycode (xn--), which is how a lookalike domain hides a swapped letter. Official wallets and apps do not use punycode domains.",
      next: ["Do not open the link.", DO_NOT_CONNECT, OPEN_APP],
    };
  }
  if (SHORT_LINK_HOSTS.has(host) || SHORT_LINK_HOSTS.has(labels(host).slice(-2).join("."))) {
    return {
      kind: "link", host: shown, status: STATUS.UNKNOWN, reason: "short_link", title: "Short link",
      evidence: `${shown} is a link shortener`,
      why: "A short link hides where it goes, so Iris can't check it.",
      next: ["Do not open the short link.", "Ask the sender for the full address, or open the official app yourself."],
    };
  }
  const reported = REPORTED.get(host);
  if (reported) {
    return {
      kind: "link", host: shown, status: STATUS.KNOWN, reason: "reported_host", title: "Reported phishing host",
      evidence: `${shown} reported by ${reported.source}${reported.date ? ` (${reported.date})` : ""}`,
      why: "This exact host was reported as phishing. That is a past report, not a fresh scan.",
      next: ["Do not open the link.", DO_NOT_CONNECT, OPEN_APP],
    };
  }
  const official = isOfficialHost(host);
  if (official) {
    return {
      kind: "link", host: shown, status: STATUS.UNKNOWN, reason: "official_domain", title: `Official ${nice(official)} domain`,
      evidence: `${shown} is ${officialOf(official)} or a subdomain of it`,
      why: `This is the official ${official} domain. That says who runs the page, not that a prompt on it is safe to sign. ${NOT_A_CLEARANCE}`,
      next: ["Check the address bar yourself, letter by letter.", "Do not connect or sign because a message sent you here."],
    };
  }
  const misspelled = misspelledBrand(host);
  if (misspelled) {
    return {
      kind: "link", host: shown, status: STATUS.SUSPICIOUS, reason: "lookalike_domain", title: `Lookalike of ${nice(misspelled.brand)}`,
      evidence: `"${misspelled.piece}" in ${shown} is close to "${misspelled.brand}", but the host is not ${officialOf(misspelled.brand)}`,
      why: `The host looks like a misspelling of ${misspelled.brand} and is not an official ${misspelled.brand} domain.`,
      next: ["Do not open the link.", DO_NOT_CONNECT, typeOfficial(misspelled.brand)],
    };
  }
  const embedded = embeddedOfficialDomain(host);
  if (embedded) {
    return {
      kind: "link", host: shown, status: STATUS.SUSPICIOUS, reason: "lookalike_domain", title: `Lookalike of ${nice(embedded.brand)}`,
      evidence: `${shown} contains ${defang(embedded.domain)} inside a different host`,
      why: `The host puts ${embedded.brand}'s official domain inside someone else's domain.`,
      next: ["Do not open the link.", DO_NOT_CONNECT, typeOfficial(embedded.brand)],
    };
  }
  const brand = brandInHost(host);
  const lure = lureInHost(host);
  if (brand && lure) {
    return {
      kind: "link", host: shown, status: STATUS.SUSPICIOUS, reason: "brand_and_lure", title: `${nice(brand.brand)} name plus a lure word`,
      evidence: `${shown} has "${brand.piece}" and "${lure}" but is not ${officialOf(brand.brand)}`,
      why: `The host carries the ${brand.brand} name and a lure word, but it is not an official ${brand.brand} domain.`,
      next: ["Do not open the link.", DO_NOT_CONNECT, typeOfficial(brand.brand)],
    };
  }
  if (brand) {
    return {
      kind: "link", host: shown, status: STATUS.SUSPICIOUS, reason: "lookalike_domain", title: `Uses the ${nice(brand.brand)} name`,
      evidence: `${shown} has "${brand.piece}" but is not ${officialOf(brand.brand)}`,
      why: `The host carries the ${brand.brand} name but is not an official ${brand.brand} domain.`,
      next: ["Do not open the link.", DO_NOT_CONNECT, typeOfficial(brand.brand)],
    };
  }
  if (lure) {
    return {
      kind: "link", host: shown, status: STATUS.SUSPICIOUS, reason: "lure_words_in_host", title: "Lure word in the address",
      evidence: `"${lure}" in ${shown}`,
      why: "Claim, airdrop, sync, verify and similar words in a host name are common on drainer pages. Iris can't tell who runs this one.",
      next: ["Do not open the link from a message.", "Open the official app yourself instead."],
    };
  }
  return {
    kind: "link", host: shown, status: STATUS.UNKNOWN, reason: "no_known_pattern", title: "No known pattern",
    evidence: `${shown}: no reported host, lookalike, punycode, short-link, brand or lure-word match`,
    why: `No known pattern matched this address. ${NOT_A_CLEARANCE}`,
    next: ["A clean check is not permission to connect a wallet.", "If a message sent you this link, open the official app yourself instead."],
  };
}

// ---------- Seed phrase (src/refusals.ts) ----------

const BIP39 = new Set(BIP39_WORDS);

export function looksLikeSeedPhrase(raw) {
  const words = String(raw).toLowerCase().split(/[^a-z]+/).filter(Boolean);
  for (const width of [12, 24]) {
    for (let i = 0; i + width <= words.length; i++) {
      if (words.slice(i, i + width).every((w) => BIP39.has(w))) return true;
    }
  }
  return false;
}

// ---------- Whole check ----------

const RANK = { [STATUS.UNKNOWN]: 0, [STATUS.SUSPICIOUS]: 1, [STATUS.KNOWN]: 2 };

function evidenceFrom(original, lower, snippet) {
  const at = lower.indexOf(snippet);
  const raw = at >= 0 && original.length === lower.length ? original.slice(at, at + snippet.length) : snippet;
  return raw.length > 140 ? `${raw.slice(0, 137)}…` : raw;
}

/**
 * Check a pasted message or link. Returns:
 *   { status: "known-malicious" | "suspicious" | "unknown", secret, findings, hosts }
 * Never "safe": "unknown" means no known pattern matched.
 */
export function checkText(input) {
  const original = String(input ?? "").slice(0, 5000);
  if (!original.trim()) return { status: STATUS.UNKNOWN, secret: false, findings: [], hosts: [], empty: true };

  if (looksLikeSeedPhrase(original)) {
    // Do not analyse or echo the words. The page clears the box.
    return { status: STATUS.UNKNOWN, secret: true, findings: [], hosts: [] };
  }

  const text = refang(original);
  const lower = text.toLowerCase();
  const findings = [];
  for (const rule of MESSAGE_RULES) {
    const hit = rule.find(lower);
    if (hit) {
      findings.push({
        kind: "message", rule: rule.id, status: STATUS.SUSPICIOUS, title: rule.title,
        evidence: `“${evidenceFrom(text, lower, hit)}”`, why: rule.why, next: rule.next,
      });
    }
  }
  const hosts = hostsIn(original);
  for (const host of hosts) findings.push(checkHost(host));

  const status = findings.reduce((s, f) => (RANK[f.status] > RANK[s] ? f.status : s), STATUS.UNKNOWN);
  findings.sort((a, b) => RANK[b.status] - RANK[a.status]);
  return { status, secret: false, findings, hosts: hosts.map(defang) };
}
