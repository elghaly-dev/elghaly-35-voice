# Demo video checklist — Colosseum (elghaly-35-voice)

Use this for **two Unlisted YouTube uploads**: pitch (~3 min) and technical demo (~3 min). Scripts: `docs/PITCH.md`, `docs/DEMO-COLOSSEUM.md`, `DEMO.md` (60s voice desk optional B-roll).

**Public byline:** Wyndham Heaven / elghaly

---

## Pitch video storyboard

Cover in order (clear story beats editing):

1. **Problem** — scam messages arrive before the wallet warns.  
2. **Customer** — self-custody users and friends they forward messages to.  
3. **One task end-to-end (“aha”)** — paste synthetic fake airdrop → Suspicious → evidence + next step (from `docs/DEMO-COLOSSEUM.md`).  
4. **Why Solana / on-chain** — scams target Solana users; companion repos explain transactions and devnet sends, but the judged product is no-wallet triage.  
5. **Business and distribution** — open MIT core; embeddable rules; education and wallet partners.  
6. **Team** — Wyndham Heaven, elghaly, solo.

Read numbers only from `docs/FIXTURES.md` and the README — do not invent traction.

---

## Technical demo storyboard

1. **Core features** — paste checker, three statuses, defanged links, seed paste guard, text mode, optional voice desk with mic notice.  
2. **Stack** — browser rules port from iris-alexa; Node server for static UI + voice token; AssemblyAI only when voice is enabled.  
3. **Priorities** — judge path without wallet connect; honest unknown verdict; fixture sheet in CI.  
4. **On-chain reasoning** — main entry stays off-chain; mention companion Android (devnet, user-signed) and MCP `explain_transaction` as optional, not required for judges.

---

## Never on screen

- Real API keys, seed phrases, private keys, or keyed RPC URLs.  
- Any wallet address, transaction signature, phone number, or real chat thread.  
- Any **city, country, street**, or team location (form-only).  
- Real mainnet sends — use **devnet** or **dry-run** only in companion clips.  
- Voice picker labels that include country names (avoid opening that menu on screen).

---

## Simulated / labeled

- **Voice desk:** if AssemblyAI is configured, say that speech goes to AssemblyAI after the on-page notice.  
- **Companion iris-alexa `/sim`:** label **“simulated assistant — not Alexa hardware”** if shown.  
- **Companion Android demo:** **devnet** badge visible; **simulated** only if using fakewallet in CI recording — label on screen.  
- **Text mode:** show the “text mode · fixed rules, nothing sent” line when using it.

---

## Production checklist

- [ ] Open https://iris-desk-voice.onrender.com **one minute** before recording (Render free cold start).  
- [ ] Do Not Disturb on; synthetic messages in Notes (see `docs/DEMO-COLOSSEUM.md`).  
- [ ] Header shows **Server: OK** before checker demo.  
- [ ] Upload **Unlisted** (not Private) — judges must open without login.  
- [ ] Paste final URLs into `SUBMISSION.md` and the Colosseum form.  
- [ ] Respect form **character limits** — trim business section if needed.  
- [ ] Re-watch once for accidental clipboard leak or notification.

---

## Optional B-roll (not required)

- 60s voice desk: `DEMO.md` (headphones; refuse seed phrase verbally).  
- Companion Android: unlisted links already on iris-mobile pitch/demo (optional).  

Do not fold unfinished features into either video (e.g. AR safety card from iris-mobile PR #11).
