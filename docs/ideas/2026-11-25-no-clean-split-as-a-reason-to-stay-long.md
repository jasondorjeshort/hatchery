---
date: 2026-11-25
kind: question
---

# "No clean split" as a third reason for a doc to stay over 300 lines

Anchor: `.claude/rules/docs.md`, "Size thresholds and caps", and ADR 0023 item 1
(`docs/hatchery/decisions/0023-length-threshold-not-cap.md`).

The base gives two cases where staying long is right: the doc is one procedure read start to
finish, or its length is the exact commands and checks a pass needs. A downstream project's owner
added a third on 2026-11-14: the threshold is a guideline, and after the cuts the rule asks for, a
doc with no clean split may stay long with `[length: <reason>]`; the reviewer tests that reason
against a clean split the doc has.

That project keeps it as departures in the docs rule, `.claude/agents/reviewer.md` and
`.claude/skills/proposal/SKILL.md` ("cap" to "check"). At its update to the base of 2026-11-25 it
gave the rest up to the base's two-reason wording until the base decides: the post-edit warning in
`.claude/hooks/post-edit.js` and its harness string, `.claude/skills/adopt-hatchery/SKILL.md` and
its ADR template, and the post-edit message row of `docs/hatchery/decisions/0002-hook-specs.md`.

It is a rule and a decision, so it comes as an idea and not as a carry-back branch (ADR 0019). Taking
it means amending ADR 0023 and every place that quotes the two cases, the list above included.

## Open

- Whether "no clean split" is a reason a reviewer can test, or the one every long doc will claim:
  ADR 0023 chose two cases a reader can check against the text.
