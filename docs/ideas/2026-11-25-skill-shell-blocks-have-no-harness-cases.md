---
date: 2026-11-25
kind: chore
---

# The shell blocks a skill tells an agent to paste have no harness cases

Anchor: `.claude/skills/triage/SKILL.md` step 2, `.claude/skills/update-from-hatchery/SKILL.md`
step 8, and `.claude/hooks/test-hooks.js`, which reads neither.

A follow-up from the reviews of ADRs 0028 and 0029 (2026-11-25). Both blocks were written, applied
verbatim and passed the harness, and each review then found a defect only a fixture shows: a file
name read as a pattern deleted an idea that was never filed, and a line of the sibling list reached
`git clone` as an option and ran a command. The fixtures, the stub for `git log` and the two
real-commit scripts that proved the fixes were built in a scratchpad and went with it.

A fix: a harness group that extracts each block from its skill by a marker line, runs it against a
scratch tree with real commits, and compares the printed lines. The extraction keeps the case and
the skill from drifting, as the pusher's cap line is kept equal to its constant today.

## Open

- Which blocks earn a case: those that delete, clone or write outside the tree, or every block.
- The update block needs a tree with a base line; the harness's scratch repositories have none.
