---
date: 2026-11-24
kind: bug
---

# Pool advice may never name an account that has no 5-hour meter

Some accounts have no 5-hour meter (the owner, 2026-11-24): their session usage files carry
`seven_day` and no `five_hour` object, and the gate judges them on the weekly meter alone, which is
right. The pool advice of ADR 0011 is stricter. In `.claude/hooks/usage-gate.js`, `poolAdvice` builds
a reading for each other account and returns none when either percentage is missing
(`five === null || seven === null`), so an account whose listing has no 5-hour figure counts as
having no reading and is never offered as the account with room, however low its weekly meter is.

The script is one of the lead's own bounds, so the change is relayed by path, never led (ADR 0025,
item 11).

## Open

- Not yet checked: what the pool command's `list --json` prints for such an account (an absent
  `usage.fiveHour`, a null `pct`, or a zero). If it prints a number the code is already right.
- Whether a missing 5-hour figure counts as room on that meter (the account is judged on the weekly
  figure alone, as the gate judges the session's own account), and how the advice line words it
  (`5h n/a`).
- Whether the same reading rule belongs in one place for the gate and the pool.
