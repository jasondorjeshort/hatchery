# Handoff

Coordinator state. Subagents follow their brief, not this file.
Updated: 2026-11-23 by main session

## Now

- ADR 0026 is built and `carry-back/triage-brainstorm-and-rest` landed (`b43ff36`); the earlier
  branch is declined (`a8f011a`); pushed to `e5cdd4c`.
- Proposal 0025 (`docs/design/proposals/0025-wave-lead.md`, draft) has its critic's review,
  `docs/design/proposals/0025-critic-review.md`: A can land now, B is not ready to record.
- Carried from 2026-11-18, not re-checked: ADR 0023 sibling checkouts under `../` need a pull.

## Next

1. Architect answers the critic on 0025 (`proposal` skill, step 5) and adds both index lines; the
   review asks for one probe run before any gate text. A's file conventions need no ADR.
2. Triage `docs/ideas/` (`triage` skill; it now ends with the first brainstorm offer). Two more
   `carry-back/*` branches sit on `../dystopo-2`'s origin (`handoff-no-process-ids`,
   `test-hooks-cb1-skip`); no landing names them.
3. In `../dystopo-2`'s own session: update from Hatchery, then its row of the migration table in
   `docs/hatchery/decisions/0026-brainstorm-contract.md`, section 5.
4. The ADR 0021 wave, T-a to T-g; fold the 2026-10-21 and 2026-10-19 guard ideas into T-b.
5. Each sibling in its own session: ADR 0018 back; its 0016 migration; 0020 and 0021; regenesis
   and droplet-management still lack `privacy.identities`.
6. Chore: worktrees `../hatchery-wt/T120`, `T121`, `usage-gate`; `.claude/worktrees/agent-*`.

## Waiting on user

- 0025, the critic's positions for you: a grant lifts the finish line; weekly `finish` = weekly HOLD
  until measured; `finish` opt-in per project; past-HOLD launches only for the lead. Land A, hold B?
- ADR 0026, two defaults reversible with a word: at STOP nothing is offered and candidates in hand
  are dropped; the coordinator acts on words written under an `Answer:`.
- `2026-10-16-scheduled-architect-design-pass.md`: yes or no; the HOLD deny's pool sentences
  (ADR 0011) unseen; delete `~/.claude/usage-state.json` once all projects run the new scripts.

## Open findings

- `docs/findings/2026-10-11-bash-heredoc-apostrophes.md`
- `docs/findings/2026-11-18-agent-to-agent-messaging.md`
