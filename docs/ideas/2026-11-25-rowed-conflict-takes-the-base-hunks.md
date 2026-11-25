---
date: 2026-11-25
kind: bug
related: [2026-11-25-update-skill-marker-check-misses-closing-marker.md]
---

# A conflict on a rowed path keeps the project's rowed lines and takes the base's other hunks

Anchor: `.claude/skills/update-from-hatchery/SKILL.md`, step 4, the base-owned case.

Reported by a downstream project after its update to the base of 2026-11-25. Step 4 resolves a
conflict on a path with a departure row by `git checkout HEAD -- <path>`, which takes the project's
whole file. When the row covers only part of the file, the base's other changes to it are dropped,
and step 8 then moves the base line past them, so no later update brings them back.

Seen on three agent files there (the base's report-file rule and the pusher's checked-SHA push would
have gone), and on rowed paths in three other downstream projects updated the same day. Every
writer merged by hand: the base's text plus the project's rowed lines.

Proposed rule for step 4: a rowed path keeps the hunks the row names and takes the base's other
hunks; a whole-file `git checkout HEAD -- <path>` only when the row covers the whole file. It
differs from the related idea in what it changes: that one is the check after a hand-merge, this
one is what makes the hand-merge the stated procedure. The step is ADR 0016's update procedure, so
the record moves with it.

## Open

- A row names a path and a reason, not hunks: how the writer tells the rowed lines from the rest
  (the reason's wording, or the project's own diff against the old base line).
- The rename case of the same step (`git show HEAD:<old> > <new>`) takes the whole file the same way.
