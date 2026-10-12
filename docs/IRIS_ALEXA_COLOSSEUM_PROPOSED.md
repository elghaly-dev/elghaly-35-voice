# Iris Desk Voice — Colosseum Solana World’s Fair

> **Owner sync:** Proposed replacement for `docs/COLOSSEUM.md` in [elghaly-dev/iris-alexa](https://github.com/elghaly-dev/iris-alexa). The cloud agent could not push that repo; open a small PR there with this file’s body (minus this callout), or cherry-pick local commit `91b6acc` on branch `cursor/colosseum-md-pins-4f26`.

**Track:** Solana / Crypto World’s Fair  
**Main entry (judged product):** **Iris Desk Voice** web app — https://github.com/elghaly-dev/elghaly-35-voice  
Iris helps people understand suspicious wallet messages and decide what to do next, without connecting a wallet.

**This repo (`iris-alexa`) is a companion only.** It is not the Colosseum GitHub link in the form. The main entry is `elghaly-35-voice`. Judges can run this repo locally for read-only MCP safety tools and a **simulated** assistant page at `/sim`.

**Public person:** Wyndham Heaven · **Company:** elghaly · **Org:** https://github.com/elghaly-dev

## Pinned commits (full SHA)

| Piece | Repo | Pin at `main` (2026-10-12 UTC) |
| --- | --- | --- |
| Main entry — web app | https://github.com/elghaly-dev/elghaly-35-voice | `d19a93f1f22b9be5729b9c1c6f17ea5b0741c468` |
| Companion — Android wallet voice | https://github.com/Alarm2024/iris-mobile | `2294aa20e16734c3d2c54ce3e2b09a3df6aa1967` |
| Companion — MCP + simulated page (this repo) | https://github.com/elghaly-dev/iris-alexa | `dbeaa07481713e587160dabf75c380e5ca8dcd0b` |
| Rules ported into the web checker | same as `iris-alexa` | `75479b395ce4525130245ce8a7ee8ea120807a82` |

Prior work (AssemblyAI voice desk, Android MVP, MCP server from September) is documented in each repo’s README and changelog. **Only work called out under “Built in the contest window” below is new for Colosseum.**

## Repos

| Piece | Repo | Notes |
| --- | --- | --- |
| **Iris Desk Voice web app (main entry)** | https://github.com/elghaly-dev/elghaly-35-voice | Paste a message or link, get a status, the evidence and the next step. Runs in the browser; no wallet connect. Voice desk with a text mode. App: https://iris-desk-voice.onrender.com |
| Android voice app (companion) | https://github.com/Alarm2024/iris-mobile | APK **[v0.1.0](https://github.com/Alarm2024/iris-mobile/releases/tag/v0.1.0)**; devnet by default; every send shown on a card and signed in Phantom or Solflare; never holds a key |
| Safety triage over MCP (companion, this repo) | https://github.com/elghaly-dev/iris-alexa | Read-only: link check, transaction explain, scam patterns, cleanup steps. No wallet, no keys |
| Web triage page (companion) | https://iris-35.elghaly.dev | Read-only; public RPC; no wallet connect, no keys |

## What judges should open

1. **App:** https://iris-desk-voice.onrender.com (Render free plan: the first load after idle can take 30 to 60 seconds; `/api/health` shows the server state)  
2. **Main repo:** https://github.com/elghaly-dev/elghaly-35-voice — pitch in `docs/PITCH.md`, demo in `docs/DEMO-COLOSSEUM.md`, what is new since 2026-10-10 in `CHANGELOG.md`  
3. **Companion, Android:** https://github.com/Alarm2024/iris-mobile and its v0.1.0 APK  
4. **Companion, MCP (this repo):** run locally (below), then open **`/sim`** — **simulated** assistant UI, not a real Alexa+ device  

## Run and test (this companion repo)

From a fresh clone at the pinned commit above:

```bash
git clone https://github.com/elghaly-dev/iris-alexa.git
cd iris-alexa
git checkout dbeaa07481713e587160dabf75c380e5ca8dcd0b
npm ci
npm test
npm run typecheck
npm start
```

Then in a browser on the same machine:

- **Simulated assistant (not real Alexa+):** http://127.0.0.1:3000/sim — text box always works; hold-to-talk uses the browser Web Speech API when available  
- **MCP endpoint:** http://127.0.0.1:3000/mcp  
- **Health:** http://127.0.0.1:3000/health  

Optional: `bash scripts/smoke.sh` (starts the server and exercises `/mcp` with MCP Inspector).

## Simulated Alexa+ (honest label)

- **`/sim`** is a **simulated** stand-in for an MCP host. It posts the same JSON-RPC a host would send to `/mcp`. It does **not** run on a physical Alexa+ device and makes no claim about Amazon registration.  
- **`sim/route.js`** maps spoken or typed utterances to one tool call with fixed rules and **no model** — also **simulated** routing, not Alexa NLU.  
- Browser speech on `/sim` is **simulated** voice input (Web Speech API), not Alexa wake word or Amazon voice processing.  
- Real Alexa+ hackathon narrative (separate track) lives in `docs/DEVPOST.md`; Colosseum judges should treat **elghaly-35-voice** as the product under review.

## Built in the contest window (this repo, from 2026-10-10)

Work merged on `main` after the Colosseum build window started:

- **Colosseum docs:** `docs/COLOSSEUM.md` aligned with **elghaly-35-voice** as main entry ([#12](https://github.com/elghaly-dev/iris-alexa/pull/12)).  
- **MCP hardening for submission:** privacy and terms pages (`/privacy`, `/terms`); structured tool `outputSchema` cards; spoken follow-ups on **`/sim`** (“what now?”, “say that again”, “stop”); `npm run conformance` against Streamable HTTP rules ([#13](https://github.com/elghaly-dev/iris-alexa/pull/13)).  
- **Spec alignment:** MCP 2025-11-25 fixes ([#11](https://github.com/elghaly-dev/iris-alexa/pull/11)).  

The web app’s contest-window work (paste checker, judge path, pitch scripts) is listed in **elghaly-35-voice** `CHANGELOG.md`, not here.

## Honest scope

**Iris Desk Voice (web app, main entry)**  
- Three statuses: known malicious, suspicious, unknown. It never says "safe".  
- The check runs in the page: nothing pasted is sent, links are shown as text and never opened, and no wallet connects. Pasted recovery words get "Stop" and the box is cleared.  
- Tested on 25 synthetic messages: 10 of 10 scams detected, 1 false positive out of 10 normal messages (see `docs/FIXTURES.md` in that repo). No user study yet.  
- Voice audio goes to AssemblyAI, and the page says so before the mic turns on. Text mode sends nothing.  

**iris-mobile (companion)**  
- Android voice app for a Solana wallet: devnet by default, every send shown on a card and signed in the wallet app (Mobile Wallet Adapter). Never handles private keys.  

**iris-alexa (companion, this repo)**  
- Read-only MCP + **`/sim` simulated** stand-in for an MCP host. Does **not** claim to run on a real Alexa+ device.  
- No Amazon / Alexa logos or sounds.  
- Seed phrases are refused by the server; tooling is read-only and safety-oriented.  

## Media

- **Main entry pitch and demo:** record from `docs/PITCH.md` (about 2:45) and `docs/DEMO-COLOSSEUM.md` (about 2:40) in **elghaly-35-voice**, upload **Unlisted** on YouTube, and paste the links in the Colosseum form.  
- **Companion (iris-mobile) videos (optional):** demo https://youtu.be/fj_CTDCyNsc · pitch https://youtu.be/8mVTWrI32zQ · screen recording asset https://github.com/Alarm2024/iris-mobile/releases/tag/demo-video  

Copies of the companion videos are under `docs/media/` in this repo (`iris-demo.mp4`, `iris-pitch.mp4`; scripts in `demo-script.md`, `pitch-script.md`).

## Link check (2026-10-12)

These URLs were checked with HTTP GET from a clean environment and returned **200** (YouTube may redirect once):

- https://iris-desk-voice.onrender.com/api/health  
- https://github.com/elghaly-dev/elghaly-35-voice  
- https://github.com/elghaly-dev/iris-alexa  
- https://github.com/Alarm2024/iris-mobile  
- https://github.com/Alarm2024/iris-mobile/releases/tag/v0.1.0  
- https://github.com/Alarm2024/iris-mobile/releases/tag/demo-video  
- https://iris-35.elghaly.dev  
- https://iris-desk-voice.onrender.com/demo.mp4  
- https://youtu.be/fj_CTDCyNsc · https://youtu.be/8mVTWrI32zQ  

## Checklist before submit (deadline Tue Oct 13, 06:59 UTC / 09:59 Cairo)

- [ ] Main repo in the Colosseum form: **elghaly-35-voice**, with the app URL  
- [ ] New pitch and demo for the **web app** recorded, **Unlisted**, links pasted  
- [ ] Open `/api/health` a minute before judging so the free instance is awake  
- [ ] Optional: iris-mobile and iris-alexa linked as companions, not as the main repo  
- [ ] Public times in **UTC only** on any post or event text  

## Related docs in-repo

- `docs/DEVPOST.md` — Alexa+ / Devpost narrative for iris-alexa  
- `docs/FRICTION_LOG.md` — build friction notes  
