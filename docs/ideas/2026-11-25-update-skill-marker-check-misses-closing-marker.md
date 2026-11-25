---
date: 2026-11-25
kind: bug
related: [2026-11-25-rowed-conflict-takes-the-base-hunks.md]
---

# The update skill's marker check misses a lone closing marker

Anchor: `.claude/skills/update-from-hatchery/SKILL.md`, the last sentence of step 4.

Step 4 ends with `git grep -n "^<<<<<<<" -- .claude docs/hatchery LICENSE LICENSES`, which finds
only opening markers. Reported by a downstream project after its update to the base of 2026-11-25:
a hand-merge of an agent file left a lone `>>>>>>> theirs` line, the check printed nothing, and the
review found it.

The check should grep all three kinds:
`git grep -nE '^(<<<<<<<|>>>>>>>|=======$)' -- .claude docs/hatchery LICENSE LICENSES`. On the base's
own tree that command prints nothing today (run 2026-11-25), so it would not start with a false hit.

It differs from the related idea in scope: this is the check that catches a bad hand-merge; that
one is about step 4 sending a rowed path to a hand-merge in the first place. The more of step 4 that
is merged by hand, the more this check carries.

## Open

- A Markdown heading underlined with exactly seven `=` would match the third pattern; none exists
  in the checked paths, and the skill would say what to do with such a hit.
