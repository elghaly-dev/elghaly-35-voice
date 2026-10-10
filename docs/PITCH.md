# Pitch script (2 to 3 minutes)

**One line:** Iris helps people understand suspicious wallet messages and decide what to
do next, without connecting a wallet.

Read at a calm pace, about 140 words a minute. The spoken text below is about 385
words, which runs close to 2 minutes 45 seconds. Every number in it comes from this
repo; nothing is estimated.

---

## 0:00 to 0:25: the problem

> You get a message: your wallet was selected for an airdrop, claim it before it
> expires. Or a "support agent" writes first and asks for your recovery words. Or a link
> looks almost like your wallet's site.
>
> Wallets warn you when you are about to sign. These messages work a step earlier,
> when you decide whether to click, connect or reply. Most people have nobody to ask.

## 0:25 to 1:05: what Iris does

> Iris is that step. You paste the message or the link into one box. Iris answers with
> a status, the reason, the evidence and the next step.
>
> There are three statuses: known malicious, suspicious and unknown. Iris never says
> "safe". An unknown result says: no known pattern matched, and that does not make it
> safe.
>
> The check runs in your browser. Nothing you paste is sent, links are never opened,
> and there is no wallet to connect. Paste recovery words, and Iris says stop and
> clears the box.

## 1:05 to 1:35: how it decides

> The rules are fixed and public: nine message patterns, such as fake airdrops and fake
> support, plus link checks for reported hosts, punycode and lookalike names. The
> evidence line shows which words or which host matched.
>
> We test it on a sheet of 25 synthetic messages. It caught all 10 scams. It flagged 1
> of the 10 normal messages: a friend asking to borrow SOL for dinner looks like a
> doubling giveaway. That false alarm stays in the sheet, on purpose.

## 1:35 to 2:05: when things fail

> Iris also has a voice desk. Before the mic turns on, the page says your speech goes
> to AssemblyAI and that you should never speak a seed phrase. If voice fails, Iris says
> which step failed and switches to text mode, which sends nothing.

## 2:05 to 2:40: who it is for, and what is next

> We think the people who need this are those new to holding their own keys, and the
> people they ask: a friend, a community moderator, a support desk. A moderator can send
> one link instead of writing the same warning again. That is a hypothesis. We have not
> run a user study yet, and we are not claiming users.
>
> Next: grow the rule set from messages people choose to report, and bring the checker
> to the six languages the Iris page already speaks.
>
> Iris helps people understand suspicious wallet messages and decide what to do next,
> without connecting a wallet. It is open source under MIT.

---

## Notes for the speaker

- Do not name a person, a city or a chat app. The byline is **elghaly**.
- Do not add numbers that are not in `docs/FIXTURES.md` or the code.
- If asked about prior art: wallet warnings and transaction simulators act at the moment
  of signing. Iris acts on the message, before any wallet is opened. It is a first look,
  not a replacement for those tools.
- If asked about privacy: text and the checker stay in the page. Voice audio goes to
  AssemblyAI, and the page says so before the mic turns on.
