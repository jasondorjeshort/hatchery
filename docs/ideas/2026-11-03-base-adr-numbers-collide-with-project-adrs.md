---
date: 2026-11-03
kind: bug
related: [2026-10-31-propagate-out-one-base-change-to-chosen-siblings.md]
---

# Base ADR numbers collide with a project's own ADRs once a project passes 0020

ADR 0008 has a decanted project number its own decisions from 0020, and the base has since
written 0020 to 0023. Base-owned text cites a bare "ADR 0023" (`.claude/rules/docs.md`,
`.claude/agents/pusher.md`, `.claude/agents/reviewer.md`, `.claude/hooks/post-edit.js`,
`.claude/hooks/policy.js`, the hook specs), and in two siblings that number is a project ADR of
their own. Three coders on 2026-11-03 wrote "Hatchery ADR 0023" in the lines they edited by hand
and took the base-owned lines verbatim, so a sibling tree now cites the same number both ways.

## Open

- Convention: base-owned text says "Hatchery ADR NNNN" (or "base ADR NNNN") wherever it names a
  decision under `docs/hatchery/decisions/`, so the citation survives the copy; or the base moves
  its own numbering out of the range projects use (ADR 0008 is the record to amend).
- Reach: a grep for `ADR 00(2[0-9])` in base-owned living files, fixed once, then the convention in
  `.claude/rules/docs.md` and the `adr` skill.
