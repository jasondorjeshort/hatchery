---
date: 2026-11-23
kind: bug
related: [2026-11-24-lead-wait-is-moved-to-the-background.md]
---

# `lead.js refused` words a failed call as a gate refusal

Seen in the first shakedown run of ADR 0025 (build step 4). The lead's `Agent` call failed the tool's
own input validation (it carried no `description`), so no hook ran: `permits` and `denies` in
`lead.json` both stayed empty. The lead ran `lead.js refused` as its rules say for "a refused or
failed call". The verdict then read `stopped: refused (5h n/a (hold 50), 7d 48% (hold 97))` and its
`Next:` line began "After the reset or the owner's grant", though both meters were below their lines
and neither a reset nor a grant would have helped. Only the lead's own note said what had failed.

What a fix would decide:

- Whether `refused` should say so when there is no deny newer than the last permit and no meter is
  at a line: for example a detail of `call failed, no deny on record` and a `Next:` line that sends
  the coordinator to the lead's report.
- Whether the lead may pass the tool's error text to the script (an argument to `refused`), so the
  record holds it and not only the lead's last message, which the coordinator is told not to read.

Seen later in the same shakedown: the hook denied the lead's `SendMessage`, and the lead then chained
`refused` and `verdict` in one Bash call, which the hook also denied. `refused` took the newest deny
as its detail, so the verdict read `refused (Bash: command not allowed)` and hid the send's deny,
which was the cause. The detail could be the oldest deny newer than the last permit, or all of them.

Seen on 2026-11-24, the first led change of build step 6: the lead prefixed `cd <repo root> &&` to
`next` and then to `refused`, and the hook denied both, so `refused` never ran. The change stayed
`running` with two Bash denies and no permit, and the verdict's `Next:` line gave the general advice
for a change no lead is turning. A deny of a lead's Bash with no permit on record could itself mark
the change stopped, or `verdict` could say that the newest record is a deny.

The script is one of the lead's own bounds, so the change is relayed by path, never led (ADR 0025,
item 11).
