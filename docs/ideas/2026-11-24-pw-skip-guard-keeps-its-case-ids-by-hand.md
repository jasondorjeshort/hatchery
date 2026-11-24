---
date: 2026-11-24
kind: chore
---

# The SKIP guard of harness group `PW` keeps its case ids in a hand-kept list

Left as minor by the check of the change that lets the post-edit hook run `.cmd` and `.bat`
formatters (2026-11-24, finding 2-1). In `.claude/hooks/test-hooks.js` the group's cases run on
Windows only; off Windows a guard prints one SKIP line when the selection names a `PW` case, and it
tests the selection against `PW_IDS`, a list of the ids written out by hand above the case table. A
case added to the table and not to the list would, off Windows, print no SKIP line under
`--only <its id>` and end with "selects no case" (exit 2).

A fix builds the list from the table, or from a count kept beside it, so the two cannot drift.
