# Colosseum demo video script (under 3 minutes)

Shows a fake airdrop, pasting it, the warning, the next step, one unknown case and the
text fallback. Recordable on a phone with the screen recorder. Target length is 2:40.

## Before you record

- Open the app once, a minute before you record. On Render's free plan the first load
  after idle can take 30 to 60 seconds.
- In the phone's notes app, write this synthetic message:

  > Congrats! Your wallet was selected for the SOL airdrop. Claim your 250 SOL
  > allocation before it expires: phantom-claim-drop.xyz

- Also write this one, for the unknown case:

  > Check out this article bit.ly/3abcXYZ

- Turn on Do Not Disturb so no real notification lands in the recording.
- No real wallet, address, name or chat app on screen.

## Shot list and voiceover

| Time | Shot (what is on screen) | Voiceover |
| --- | --- | --- |
| 0:00–0:12 | The page loads. The **Check this message or link** panel is at the top, and the header shows **Server: OK** and the Voice check. | "This is Iris. It helps people understand suspicious wallet messages and decide what to do next, without connecting a wallet." |
| 0:12–0:30 | The notes app with the fake airdrop message. Select it and copy it. | "Here is a message like the ones people get every day: you were selected for an airdrop, claim before it expires, and a link." |
| 0:30–0:45 | Back on the page, paste into the box and tap **Check**. | "I paste it into Iris. The check runs in this page. Nothing is sent, and the link is not opened." |
| 0:45–1:10 | The **Suspicious** result: the headline "Matches a known scam pattern: Fake airdrop or claim", then the evidence "selected for the SOL airdrop", then the reason. | "Suspicious. Iris shows the words that matched and why: unsolicited airdrop messages are a fixed scam pattern, and the claim page is where the approval or the seed request arrives." |
| 1:10–1:25 | Scroll to the **Next step** list, then to the link finding `phantom-claim-drop[.]xyz has "phantom" and "claim" but is not phantom.com`. | "Then the next step: do not open the claim link, do not connect a wallet, ignore a token that appeared by itself. The link has a brand name plus a lure word, and it is not the real site. It is shown as text, so it cannot be tapped." |
| 1:25–1:50 | Tap **Clear**, paste the short-link message, tap **Check**. The **Unknown** result appears: "No known pattern matched. That does not make it safe." | "Now an unknown case: a short link. Iris cannot see where it goes, so it says unknown, and that unknown is not the same as safe. The next step: if it asks you to connect, sign, pay or share recovery words, stop and open the official app yourself." |
| 1:50–2:05 | Scroll to the voice desk. Tap **Connect & talk**. The notice appears: "Your speech is sent to AssemblyAI for transcription. Never speak a seed phrase or private key." | "Iris also has a voice desk. Before the mic turns on, it tells you where your voice goes." |
| 2:05–2:30 | Tap **Type instead**. Type: `I clicked a link and signed something, what do I do now?` and send. The answer appears, marked "text mode · fixed rules, nothing sent", and the **Chain read** card is highlighted. | "If you would rather type, or the voice service is down, text mode answers from fixed rules in the page and sends nothing. Here it points me to the chain read, to see what I signed." |
| 2:30–2:40 | Back to the top of the page. | "Iris never says safe. It shows the evidence and the next step, and no wallet ever connects. It is open source under MIT." |

## If voice is not set up on the server you record from

The header reads **Voice: not set up here**. Tapping **Connect & talk** opens text mode
with the reason. Record that instead of the 1:50–2:05 shot, and say: "When voice is
not available, Iris says why and switches to text."

## Do not show

- A real seed phrase, private key, wallet address or transaction.
- A real person's name, a city, or a chat app's name.
- Any claim of users, partners or results that are not in `docs/FIXTURES.md`.
