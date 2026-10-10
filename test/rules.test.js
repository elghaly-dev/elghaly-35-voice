import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkText, checkHost, hostsIn, looksLikeSeedPhrase, refang, defang, STATUS, MESSAGE_RULES } from "../public/iris-rules.js";
import { runFixtures, renderMarkdown } from "../scripts/run-fixtures.mjs";

const BIP12 = "abandon ability able about above absent absorb abstract absurd abuse access accident";

test("nine message rules, same ids as iris-alexa", () => {
  assert.deepEqual(MESSAGE_RULES.map((r) => r.id), [
    "seed_phrase_request", "fake_support_dm", "fake_airdrop", "doubling_giveaway", "unlimited_approval",
    "authority_change", "urgent_verify_wallet_link", "validate_or_sync_wallet", "qr_code_connect",
  ]);
});

test("advice is not a request; a request glued to advice still is", () => {
  assert.equal(checkText("Never share your seed phrase with anyone.").status, STATUS.UNKNOWN);
  const glued = checkText("Never share your seed phrase. Now reply with your seed phrase to verify.");
  assert.equal(glued.status, STATUS.SUSPICIOUS);
  assert.equal(glued.findings[0].rule, "seed_phrase_request");
});

test("findings carry evidence, reason and next steps", () => {
  const r = checkText("Hi, this is Phantom support. Please reply with your 12 word recovery phrase.");
  const f = r.findings.find((x) => x.rule === "seed_phrase_request");
  assert.match(f.evidence, /reply with your 12 word recovery phrase/i);
  assert.ok(f.why.length > 20);
  assert.ok(f.next.length >= 2);
});

test("link checks: reported, punycode, lookalike, brand+lure, short link, official", () => {
  assert.equal(checkHost("phanton.app").status, STATUS.KNOWN);
  assert.equal(checkHost("xn--phntom-4nf.app").reason, "punycode_host");
  assert.equal(checkHost("phantorn.com").reason, "lookalike_domain");
  assert.equal(checkHost("phantom.com.claim-now.xyz").reason, "lookalike_domain");
  assert.equal(checkHost("phantom-airdrop.xyz").reason, "brand_and_lure");
  assert.equal(checkHost("bit.ly").status, STATUS.UNKNOWN);
  const official = checkHost("phantom.com");
  assert.equal(official.status, STATUS.UNKNOWN);
  assert.match(official.why, /not a clearance/i);
});

test("every URL in a message is checked, defanged input included", () => {
  assert.deepEqual(hostsIn("see hxxps://phanton[.]app and https://solana.com/docs"), ["phanton.app", "solana.com"]);
  assert.equal(refang("a[.]b(.)c"), "a.b.c");
  assert.deepEqual(hostsIn("update at https://phаntom.app now"), ["xn--phntom-4nf.app"]);
});

test("hosts are shown defanged, so nothing in a result is a live link", () => {
  const r = checkText("Claim at phantom-claim.xyz");
  assert.deepEqual(r.hosts, ["phantom-claim[.]xyz"]);
  for (const f of r.findings) assert.ok(!/https?:\/\//.test(JSON.stringify(f)));
  assert.equal(defang("a.b.c"), "a[.]b[.]c");
});

test("there is no safe status", () => {
  const statuses = new Set();
  for (const t of ["hello", "https://solana.com", "bit.ly/x", "send me 1 sol", BIP12, ""]) statuses.add(checkText(t).status);
  for (const s of statuses) assert.ok(Object.values(STATUS).includes(s), s);
  assert.ok(!JSON.stringify(checkText("https://solana.com")).toLowerCase().includes('"safe"'));
});

test("a pasted seed phrase is recognised and not analysed", () => {
  assert.equal(looksLikeSeedPhrase(BIP12), true);
  assert.equal(looksLikeSeedPhrase("abandon ability able about above"), false);
  const r = checkText(`my words: ${BIP12}`);
  assert.equal(r.secret, true);
  assert.deepEqual(r.findings, []);
});

test("fixture report in docs/FIXTURES.md is current", () => {
  const current = readFileSync(new URL("../docs/FIXTURES.md", import.meta.url), "utf8");
  assert.equal(current, renderMarkdown(runFixtures()), "run `npm run fixtures` and commit docs/FIXTURES.md");
});

test("fixture sheet shape: 10 scam, 10 normal, 5 uncertain", () => {
  const { summary } = runFixtures();
  assert.equal(summary.scam, 10);
  assert.equal(summary.normal, 10);
  assert.equal(summary.uncertain, 5);
});
