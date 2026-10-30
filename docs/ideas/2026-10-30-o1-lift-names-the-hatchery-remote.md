---
date: 2026-10-30
kind: chore
---

# O1's failure lift sends a decanted project toward the wrong fix

In a decanted clone, harness case O1 (`.claude/hooks/test-hooks.js`, group O) fails with `FAIL O1
ownership: <paths> matches no list in .claude/hooks/ownership.json; lift: classify it`. The cause
can be that the clone has no `hatchery` remote: decant step 2 adds it, and a fresh clone carries
only `origin`. O1, A1 and CB1 skip where a `hatchery` remote exists, because they check Hatchery's
own tree (`docs/hatchery/decisions/0016-ownership-map.md`). Adding the remote turned the suite green.

The lift "classify it" sends an agent toward editing the base-owned `.claude/hooks/ownership.json`
with project paths. That is a departure, and it would not work: updates read the map from the base
commit.

## Anchors

- The O1 FAIL line, `.claude/hooks/test-hooks.js` line 2525: the `contract('O1', 'FAIL', ...)` call
  whose text ends `matches no list in .claude/hooks/ownership.json; lift: classify it`, and its
  sentence under "Harness group `O`" in `docs/hatchery/decisions/0016-ownership-map.md`
  (`FAIL O1 ownership: <path> matches no list in .claude/hooks/ownership.json; lift: classify it`).
  Suggested lift: `lift: in Hatchery classify it; in a decanted project git remote add hatchery <url>, decant step 2`.
- A1 (`lift: ADR amendment (architect)`, line 2535) and CB1 (`lift: privacy.identities (owner) or ADR
  amendment (architect)`, line 3122) are skipped under the same remote test, so each could name the
  remote likewise.
- A warning at decant time or session start when a decanted project (one with a `Hatchery base:`
  line) has no `hatchery` remote. Candidate homes: the `decant` skill's step 11, "Verify"
  (`.claude/skills/decant/SKILL.md`), or the harness's O1 line itself. Left for Hatchery's triage.
