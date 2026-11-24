# Handoff

Coordinator state. Subagents follow their brief, not this file.
Updated: 2026-11-24 by main session

## Now

- ADR 0025 (the wave lead): build steps 1 to 4 and 6 are done; six led changes landed. The pilot
  finding says K1 fails on every reading, and item 11's rule for that is "withdrawn". Not acted on.
- Carried from 2026-11-18, not re-checked: ADR 0023 sibling checkouts under `../` need a pull.

## Next

1. Push when the user asks. Then what the owner decides on the lead (Waiting on user): a withdrawal
   is item 12 of `docs/hatchery/decisions/0025-wave-lead.md`, relayed by path, never led.
2. Triage `docs/ideas/` (the `lead.js` ideas fall away if the lead is withdrawn). Unlanded on
   `../dystopo-2`'s origin: `carry-back/handoff-no-process-ids`, `carry-back/test-hooks-cb1-skip`.
3. In `../dystopo-2`'s own session: update from Hatchery, then its row of the migration table in
   `docs/hatchery/decisions/0026-brainstorm-contract.md`, section 5.
4. The ADR 0021 wave, T-a to T-g; fold the 2026-10-21 and 2026-10-19 guard ideas into T-b.
5. Each sibling in its own session: ADR 0018 back; its 0016 migration; 0020 and 0021; regenesis
   and droplet-management still lack `privacy.identities`.
6. Chore: worktrees `../hatchery-wt/T120`, `T121`, `usage-gate`; `.claude/worktrees/agent-*`.

## Waiting on user

- The lead: withdraw it as item 11 prescribes, or keep it against the rule (then say on what test).
  The numbers and their caveats: `docs/findings/2026-11-24-wave-lead-pilot.md`.
- ADR 0025, step 5 (only if the lead stays): the account of these sessions has no 5-hour meter, so
  P3 is unseen; run step 5 on an account that has one, or take item 9's question.
- ADR 0026, two defaults reversible with a word: at STOP nothing is offered and candidates in hand
  are dropped; the coordinator acts on words written under an `Answer:`.
- `2026-10-16-scheduled-architect-design-pass.md`: yes or no; the HOLD deny's pool sentences
  (ADR 0011) unseen; delete `~/.claude/usage-state.json` once all projects run the new scripts.

## Open findings

- `docs/findings/2026-10-11-bash-heredoc-apostrophes.md`
- `docs/findings/2026-11-23-nested-agent-hook-probe.md` (open: P3)
- `docs/findings/2026-11-24-wave-lead-pilot.md` (open: the owner's decision on the lead)
