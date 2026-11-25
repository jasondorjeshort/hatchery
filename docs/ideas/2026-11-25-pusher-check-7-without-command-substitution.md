---
date: 2026-11-25
kind: chore
related: [2026-11-18-pusher-follows-a-nested-repos-own-rules.md]
---

# Pusher check 7 without command substitution, and its scope on another repository

Anchor: `.claude/agents/pusher.md`, check 7, and `PUSHER_CAP_LINE` in `.claude/hooks/test-hooks.js`.

Two changes a downstream project made to check 7 and keeps as departures on both files:

- Its commands carry no command substitution. Both of the base's lines open with `l=$(mktemp)`, and
  the handoff total also counts with `$(wc -l < "$f")`. That project reports that a command holding
  `$( )` or backticks can wait on an approval prompt, and that an unattended session sat six hours on
  one (2026-11-04). Its version names the list file by parameter expansion
  (`${TMPDIR:-/tmp}/pusher-cap-list.$$`), runs the cap check only when the list was written (`&&`),
  and takes the handoff total as one pipe into `wc -l`. The harness constant follows the agent
  file; the case that compares the two keeps them equal.
- Its scope. A push of another repository from a brief skips check 7 and says so; that repository's
  own pre-push rules apply.

The second differs from the related idea in its answer to the same mismatch: there the pusher runs
every check inside the nested repository under that repository's rules; here it skips this one
check. One design pass should settle both.

The base's `--claude-check` line already replaced that project's import loop at its update to the
base of 2026-11-25, so only the two lines above remain different.

## Open

- Whether the stall is the substitution itself or the permission rule that matches the line: the
  report gives the symptom, not the mechanism, and the fix should be tested against the prompt.
- Whether both lines belong in `.claude/hooks/policy.js` behind a flag, as `--claude-check` is,
  which would take the shell out of check 7.
