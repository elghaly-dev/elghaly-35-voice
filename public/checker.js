// "Check this message or link" panel. Everything runs in this page: no network call,
// links are shown as plain defanged text and never opened, and no wallet can connect.

import { checkText, STATUS } from "./iris-rules.js";

const LABEL = {
  [STATUS.KNOWN]: "Known malicious",
  [STATUS.SUSPICIOUS]: "Suspicious",
  [STATUS.UNKNOWN]: "Unknown",
};

const EXAMPLES = [
  "Congrats! Your wallet was selected for the SOL airdrop. Claim your 250 SOL allocation before it expires: phantom-claim-drop.xyz",
  "Hi, this is the Phantom support team. To restore access please reply with your 12 word recovery phrase.",
  "Meeting moved to 3pm, see you at the office.",
];

const UNKNOWN_NEXT = [
  "If it asks you to connect a wallet, sign, pay or share recovery words, stop and open the official app yourself.",
  "If you already signed something, paste the public signature into the Chain read card.",
];

const els = {
  input: document.getElementById("check-input"),
  run: document.getElementById("check-run"),
  example: document.getElementById("check-example"),
  clear: document.getElementById("check-clear"),
  result: document.getElementById("check-result"),
};

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children.flat()) if (c != null) node.append(c instanceof Node ? c : String(c));
  return node;
}

function headline(result) {
  if (result.status === STATUS.UNKNOWN) return "No known pattern matched. That does not make it safe.";
  const top = result.findings[0];
  if (result.status === STATUS.KNOWN) return `${top.title}: this exact address was reported as phishing.`;
  return `Matches a known scam pattern: ${top.title}.`;
}

function render(result) {
  const box = els.result;
  box.hidden = false;
  if (result.secret) {
    box.replaceChildren(
      el("div", { class: "verdict", "data-status": "stop" },
        el("span", { class: "badge" }, "Stop"),
        el("p", { class: "headline" }, "That looks like a wallet's recovery words. The box has been cleared."),
      ),
      el("p", { class: "why" }, "Nothing was sent: this check runs in the page. Never paste recovery words anywhere. If someone asked you for them, that is the scam."),
    );
    return;
  }
  const flagged = result.findings.filter((f) => f.status !== STATUS.UNKNOWN);
  const shown = flagged.length ? flagged : result.findings;
  const parts = [
    el("div", { class: "verdict", "data-status": result.status },
      el("span", { class: "badge" }, LABEL[result.status]),
      el("p", { class: "headline" }, headline(result)),
    ),
    shown.length
      ? el("ul", { class: "findings" }, shown.map((f) =>
          el("li", { class: "finding", "data-status": f.status },
            el("p", { class: "f-title" }, f.title),
            el("p", { class: "f-row" }, el("span", { class: "k" }, "Evidence"), f.evidence),
            el("p", { class: "f-row" }, el("span", { class: "k" }, "Reason"), f.why),
            el("div", { class: "f-row" }, el("span", { class: "k" }, "Next step"), el("ol", {}, f.next.map((n) => el("li", {}, n)))),
          )))
      : null,
    result.status === STATUS.UNKNOWN
      ? el("div", { class: "f-row" }, el("span", { class: "k" }, "Next step"), el("ol", {}, UNKNOWN_NEXT.map((n) => el("li", {}, n))))
      : null,
    el("p", { class: "foot" }, "Iris never says a message is safe. Nothing you pasted left this page. Links are shown as text with [.] and are not opened."),
  ];
  // replaceChildren() turns null into a "null" text node, so drop the empty slots.
  box.replaceChildren(...parts.filter(Boolean));
}

export function runCheck(text) {
  if (typeof text === "string") els.input.value = text;
  const result = checkText(els.input.value);
  if (result.empty) {
    els.result.hidden = true;
    return result;
  }
  if (result.secret) els.input.value = "";
  render(result);
  return result;
}

let exampleIndex = 0;
els.run.addEventListener("click", () => runCheck());
els.example.addEventListener("click", () => {
  runCheck(EXAMPLES[exampleIndex % EXAMPLES.length]);
  exampleIndex += 1;
});
els.clear.addEventListener("click", () => {
  els.input.value = "";
  els.result.hidden = true;
  els.input.focus();
});
