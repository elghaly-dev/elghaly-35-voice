# Colosseum form — paste-ready text

**Deadline:** Tue 13 Oct 2026, **06:59 UTC** (09:59 Cairo). Have everything ready by **06:00 Cairo** (03:00 UTC). Wyndham Heaven submits in the form.

**Main GitHub repo (one link in the form):** https://github.com/elghaly-dev/elghaly-35-voice  
**App URL:** https://iris-desk-voice.onrender.com

Do **not** paste team location, street address, city, or country in any public field below. Fill location only in the form’s private team field.

---

## Project name

Iris Desk Voice

## One-liner

Iris helps people understand suspicious wallet messages and decide what to do next, without connecting a wallet.

## Problem

Wallet scams start in messages and links before anyone opens a wallet: fake airdrops, fake support, lookalike sites, and pressure to “verify” or share recovery words. Wallets warn at sign time; most people have no one to ask at the message step.

## Solution

Paste a message or link into Iris on the web. Iris returns a status (known malicious, suspicious, or unknown), the reason, the evidence that matched, and concrete next steps. The check runs entirely in the browser: nothing is sent, links are defanged and never opened, and no wallet connects. If you paste recovery words, Iris stops and clears the box. Optional voice desk explains the Iris safety tools and highlights the right card; text mode uses the same fixed rules and sends nothing.

## How it uses Solana

Iris is built for Solana wallet users and the scams that target them (fake airdrops, authority changes, fake support). Companion repos (not required to judge the main entry) include an Android devnet wallet voice app (Mobile Wallet Adapter, user-signed transfers only) and a read-only MCP server that explains public Solana transactions and runs the same scam and link rules. The **judged Colosseum product** is the web triage desk; on-chain actions stay in the user’s wallet on devnet in the companion app only.

## What we built in the contest window (from 2026-10-10)

In **elghaly-35-voice** (main entry):

- “Check this message or link” panel with in-browser rules, BIP-39 paste guard, and fixture sheet (`docs/FIXTURES.md`: 10/10 synthetic scams caught, 1/10 false positive on normal lines).
- Reliable judge path: server-rendered cards, separate Server vs Voice checks, mic privacy notice, connection step list, text mode fallback, server starts without a voice API key.
- Colosseum pitch and demo scripts (`docs/PITCH.md`, `docs/DEMO-COLOSSEUM.md`) and README led with the Colosseum entry.

In **iris-alexa** (companion): Colosseum doc sync, `/privacy` and `/terms`, structured MCP tool cards, `/sim` follow-ups, conformance tests — see pinned commit in `docs/COLOSSEUM.md` there.

In **iris-mobile** (companion): MIT LICENSE on main; demo-video CI and cached devnet demo wallet merged for optional Android demo assets — not part of the web judge path.

## Prior work disclosure

Before 2026-10-10 this stack included: AssemblyAI voice desk and link cards (LabLab AssemblyAI hackathon, September 2026); Android voice wallet MVP (early October 2026); MCP read-only server and simulated `/sim` page (from September 2026). Colosseum scoring should consider only the contest-window items above; prior repos and demos are context, not claimed as new.

## Team

Wyndham Heaven — founder, product, engineering (elghaly). Solo builder for this submission.

## Business plan and go-to-market

**Customer:** Self-custody wallet users and the people they ask for help when a message looks wrong.

**Model:** Open-source core (MIT); future revenue from optional hosted voice desk, team dashboards, and integrations for wallets and support teams — not from holding keys or routing transactions.

**Go-to-market:** Ship the free web checker; partner with wallet apps and educators for embeddable rules; companion Android and MCP for voice-first and assistant channels. Distribution through security-minded communities, Solana ecosystem events, and content that teaches the message step before the sign step.

**Traction:** Synthetic fixture evaluation documented in-repo; public demo at Render; companion APK v0.1.0 on GitHub releases. No paid users claimed.

## Links (Unlisted video URLs — owner replaces `PASTE_*` before submit)

| Field | URL |
| --- | --- |
| Live app | https://iris-desk-voice.onrender.com |
| Pitch video (Unlisted) | PASTE_PITCH_YOUTUBE_UNLISTED |
| Demo / technical video (Unlisted) | PASTE_DEMO_YOUTUBE_UNLISTED |
| Optional companion Android demo | https://youtu.be/fj_CTDCyNsc |
| Optional companion Android pitch | https://youtu.be/8mVTWrI32zQ |

---

## Mapping to judging criteria (no weights assumed)

**Rules — six criteria**

1. **Functionality and code quality:** In-browser checker + fixture tests + CI; judge path documented in `DEMO.md` and `docs/DEMO-COLOSSEUM.md`; companions tested with `npm test` / Android CI.  
2. **Impact, market size, ecosystem:** Every Solana user sees scam messages; tool works without wallet connect.  
3. **Novelty:** Message-step triage with evidence lines and no “safe” verdict; voice desk optional.  
4. **UX and blockchain value:** Clear statuses and next steps; defanged links; devnet-only companion for signed transfers.  
5. **Open source and composability:** MIT; rules aligned with iris-alexa; MCP tools reusable.  
6. **Business plan and team:** Above; solo founder with prior voice and wallet prototypes.

**FAQ — seven factors**

1. **Founder–market fit:** Built Iris safety tooling across web, mobile, and MCP.  
2. **Insight:** Scams win before the wallet modal; triage must work without connect.  
3. **Product and execution:** Shippable web app, documented judge path, fixture metrics.  
4. **Market size:** Large self-custody user base; cross-chain message patterns similar.  
5. **Communication:** Pitch and demo scripts; this submission doc.  
6. **Viability:** Open core; services layer; no custody.  
7. **Traction:** Honest fixture and release links only.

---

## Owner numbered submit click list (before 09:59 Cairo)

1. Open https://iris-desk-voice.onrender.com/api/health — confirm `"ok":true`.  
2. Open the app once; wait through cold start if needed.  
3. Run locally: `npm ci && npm test` on **elghaly-35-voice** at `d19a93f1f22b9be5729b9c1c6f17ea5b0741c468` (optional sanity check).  
4. Record **pitch** from `docs/PITCH.md` and **demo** from `docs/DEMO-COLOSSEUM.md`; upload both as **Unlisted** YouTube; paste URLs into this file’s `PASTE_*` slots and the form.  
5. Review `VIDEO_CHECKLIST.md` — no keys, seeds, addresses, cities, or countries on screen; label simulated parts.  
6. In the Colosseum form, set **GitHub** to https://github.com/elghaly-dev/elghaly-35-voice only.  
7. Paste fields from this file (name, one-liner, problem, solution, Solana, built in window, prior work, team, business, links).  
8. Fill **team location** only in the form’s dedicated field (not in public text).  
9. Mention companions only if the form has optional links: Alarm2024/iris-mobile, elghaly-dev/iris-alexa.  
10. Submit before **06:59 UTC** (09:59 Cairo).
