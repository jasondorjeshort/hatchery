---
date: 2026-11-22
kind: chore
---

# Adopt the brainstorm offer, the recurrence and use entries, and the rest pile

From a sibling project's coordinator (claude-opus-5-5) at its owner's request, 2026-11-22; the
decision is a sibling project's ADR on brainstorms, 2026-11-22. The triage skill's text already
comes as the carry-back `carry-back/triage-brainstorm-and-rest` (steps 4, 9 and 10 and the Bounds);
it replaces `carry-back/triage-brainstorm-step` at 4d00b15, which is not to be landed. What a
carry-back cannot carry, because it is a rule, a README practice or a promised surface, is this:

- **The rule** (an agreement line): after a triage, at a wave close or a release, and on a spark,
  the coordinator offers at most nine numbered lines, about three each near-term, intermediate and
  moonshot, under a header giving the open count at the session's start, the bar's step and
  "held back: N". The owner answers per line: record, record at rest, fold, or no. Nothing is
  written unasked. A grep-level check comes first (the anchor exists, it is not built, a matching
  idea is searched for, one primitive is not split into several features).
- **The Source line** in `docs/ideas/README.md`: the first body line after the title of an offered
  idea names the source, the generating model and the recorder, the public trigger, "offered and
  accepted by the owner; not sanity-checked", and `Moonshot.` when one. No new frontmatter key.
- **Recurrence as an update**: a `Came up again: <date>, <source> (<model>), <context>.` entry on
  the existing file with an optional `New:`, counted once per distinct session or source; an echo
  in the session of a triage that read the file keeps its `New:` and does not count.
- **`Use:` lines**: the uses of one primitive go on the primitive's file, not files of their own.
- **The bar as guidance**: one step per doubling of the open count (under 20: an anchor; then no
  existing file says it; not a use of a named primitive; its lever; the open idea it outranks; from
  320, asked for or recurred). It never refuses; an idea below it becomes an entry or is held back.
- **The rest prefix**: `Waits: at rest — "<quoted words>" (the owner, <date>)`, written only from
  the owner's own words or the option they picked; never a default. Resting ideas count as open.
- **The landing rule**: a pass removes what it built and keeps the file while any unbuilt `Use:` or
  `New:` line remains.
- **The rest review** every third wave close (recorded in the wave record) or on request: the
  resting ideas only, sorted by distinct recurrences, one line each; the owner decides keep, wake
  or delete. It replaces the README's "no agent runs that sitting", which never happened there.
- **The docs rule on Waits**: "only the owner writes `Waits:`" becomes "only the owner decides a
  `Waits:`; an agent writes one only from the owner's quoted words".

Also, as an addition to the promised CLI of `.claude/hooks/queue-list.js` (ADR 0013, ADR 0017): a
`--recurring` flag listing files by their count of `Came up again:` entries. The sibling deferred
it; no skill depends on it until the base line carries it.

Deferred there and worth a decision here: a fourth block `Rests:` instead of the prefix. An older
`queue-list.js` would list a file ending in `Rests:` as untriaged, so it needs a Hatchery ADR.

## Open

- Whether the bar's table lives in the README or in a reference file the README names.
- Whether the rest review's cadence (every third wave close) suits projects without waves.
