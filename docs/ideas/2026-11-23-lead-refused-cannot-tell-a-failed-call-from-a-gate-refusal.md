---
date: 2026-11-23
kind: bug
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

The script is one of the lead's own bounds, so the change is relayed by path, never led (ADR 0025,
item 11).
