---
date: 2026-11-24
kind: bug
related: [2026-11-23-lead-refused-cannot-tell-a-failed-call-from-a-gate-refusal.md]
---

# The harness moves a lead's `wait` to the background, and a lead with nothing to run strays

Seen on 2026-11-24 in build step 6 of ADR 0025 (Claude Code 2.1.331, interactive, Windows). A lead
runs `node .claude/hooks/lead.js wait <d>` with a Bash timeout of 600000. When the command ran past
about three minutes the harness moved it to the background and returned the Bash call without its
output. Leads that ended their turn were resumed when the command finished and went on. One lead ran
`cat` on the background task's output file and one ran `sleep 1; echo ...`; the lead's hook denied
both, and each change stopped as `refused` (the second with its writer still at work, though the
verdict's `Next:` line says a refused call started nothing).

`.claude/agents/wave-lead.md` now tells the lead to end its turn, run nothing, and run `wait` again
when resumed. That rests on an agent following a sentence.

The script is one of the lead's own bounds, so the change is relayed by path, never led (ADR 0025,
item 11).

## Open

- Whether `lead.js wait` should return before the harness backgrounds it (print `waiting` after two
  minutes or so, the lead runs it again), so the loop never leaves the foreground. The cost is a
  lead turn every two minutes of a long step; measure it against the turns a resumed lead takes.
- The exact time after which the harness backgrounds a Bash call, and whether a setting moves it:
  not looked up.
- `Next:` after a refusal should not say "a refused call started nothing" when a permit newer than
  the last finished step is on record.
