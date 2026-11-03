# Handoff

Coordinator state. Subagents follow their brief, not this file.
Updated: 2026-11-03 by main session

## Now

- ADR 0023 (`ca1cca4`, the 300-line cap is a threshold with a `[length: <reason>]` marker) is pushed
  in Hatchery and carried into six siblings from side clones under `<scratchpad>/propagate-0023/`:
  broodforge `a6e703c`, inertia `9dadd64`, ERIS `82cd754` (full updates, base line moved);
  droplet-management `5efb3af`, regenesis `4308dc17`, dystopo `52c6302f` (partial takes). Every
  sibling checkout under `../` needs a fast-forward pull; the clones can be deleted.
- Dystopia took its own shape on 2026-11-03 (`458f0d229`: guideline, 500 for a card, no marker);
  not propagated to, by the owner's word. Whether it aligns with the marker is its session's call.
- Regenesis has ten top-level `docs/design/*.md` over 300, unmarked, passing under its pusher
  departure; the owner decides trim, mark or exempt there.
- Filed today: `2026-11-03-base-adr-numbers-collide-with-project-adrs.md`; third-run notes in the
  propagate-out idea. ADR 0021's T-a to T-g not started.

## Next

1. Triage `docs/ideas/` (`triage` skill): the ADR-number collision, the two untriaged guard ideas,
   propagate-out (three runs of notes; the skill can be written), the ADR 0012 scan.
2. The ADR 0021 wave, from a Hatchery-rooted session, T-a to T-g; fold the 2026-10-21 and
   2026-10-19 guard ideas into T-b.
3. T-g's migration row for Dystopo runs in Dystopo's session after T-a to T-f.
4. Each sibling in its own session: ADR 0018 back; its 0016 migration; 0020 and 0021; regenesis
   and droplet-management still lack `privacy.identities` (their scans flag the owner's email).
5. Chore: worktrees `../hatchery-wt/T120`, `T121`, `usage-gate`; `.claude/worktrees/agent-*`.

## Waiting on user

- `2026-10-16-scheduled-architect-design-pass.md`: yes or no; the HOLD deny's pool sentences
  (ADR 0011) unseen; delete `~/.claude/usage-state.json` once all projects run the new scripts.
- ADR 0013 stays `proposed`, not re-asked (decided 2026-10-21).

## Open findings

- `docs/findings/2026-10-11-bash-heredoc-apostrophes.md` (list: `queue-list.js findings --status open`)
