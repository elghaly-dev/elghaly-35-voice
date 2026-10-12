# iris-mobile pull requests — Colosseum verdicts

Repo: https://github.com/Alarm2024/iris-mobile (companion only; main entry is **elghaly-35-voice**).

Checked against `main` at `2294aa20e16734c3d2c54ce3e2b09a3df6aa1967` on 2026-10-12 UTC.

| PR | Title | CI (last run on PR) | Conflicts | Verdict | Action taken |
| --- | --- | --- | --- | --- | --- |
| [#6](https://github.com/Alarm2024/iris-mobile/pull/6) | demo-video: cached devnet demo wallet so the send can be recorded | check + android **SUCCESS** | n/a (merged) | **Needed for optional companion demo video CI** — stable funded devnet wallet for recorded sends | **Already merged** to `main` |
| [#8](https://github.com/Alarm2024/iris-mobile/pull/8) | fix: save demo wallet cache after every successful demo run | check + android **SUCCESS** | **CLEAN**, mergeable | **Not before deadline** — CI reliability only; not on the web judge path | **Left open (draft)**; owner may merge after Colosseum if demo-video workflow flakes |
| [#9](https://github.com/Alarm2024/iris-mobile/pull/9) | README: demo and pitch video links | check + android **SUCCESS** | **CLEAN**, mergeable | **Not before deadline** — README placeholders until owner confirms Unlisted YouTube URLs play | **Left open (draft)** |
| [#11](https://github.com/Alarm2024/iris-mobile/pull/11) | AR safety card with ViroReact (read-only) | check + android **SUCCESS** | **CLEAN**, mergeable | **Not before deadline** — unfinished for Colosseum; separate ReactVision/Ctrl+Space scope; **do not show in Colosseum demo** | **Left open (draft)** |

No iris-mobile PR is required for judges to run the main entry (`iris-desk-voice.onrender.com` + this repo’s `npm test`).
