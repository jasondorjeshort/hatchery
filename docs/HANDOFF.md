# Handoff

Coordinator state. Subagents follow their brief, not this file.
Updated: 2026-11-24 by main session

## Now

- ADR 0025 (the wave lead): build steps 1 to 4 are done. The shakedown's led change landed after two
  defects in the lead's bounds were mended by path; no `finish` is set. Unpushed; `git status -sb` says.
- Carried from 2026-11-18, not re-checked: ADR 0023 sibling checkouts under `../` need a pull.

## Next

1. Push when the user asks. Then step 6 of `docs/hatchery/decisions/0025-wave-lead.md`, item 10: five
   more led changes (`brief` skill, "Led changes"). In the first, stop a lead's child by its id once its
   file exists, and note a lead that ends while its agent runs: P4's open halves (the probe finding).
2. Triage `docs/ideas/` (`triage` skill; it now ends with the first brainstorm offer). Two more
   `carry-back/*` branches sit on `../dystopo-2`'s origin (`handoff-no-process-ids`,
   `test-hooks-cb1-skip`); no landing names them.
3. In `../dystopo-2`'s own session: update from Hatchery, then its row of the migration table in
   `docs/hatchery/decisions/0026-brainstorm-contract.md`, section 5.
4. The ADR 0021 wave, T-a to T-g; fold the 2026-10-21 and 2026-10-19 guard ideas into T-b. T-b, T-e
   and T-f are relayed by path, never led (ADR 0025, item 11).
5. Each sibling in its own session: ADR 0018 back; its 0016 migration; 0020 and 0021; regenesis
   and droplet-management still lack `privacy.identities`.
6. Chore: worktrees `../hatchery-wt/T120`, `T121`, `usage-gate`; `.claude/worktrees/agent-*`.

## Waiting on user

- ADR 0025, step 5: the account of the 2026-11-23 sessions has no 5-hour meter, so P3 is unseen. Yours:
  run step 5 on an account that has one (proposed), or item 9's question (a change run on unmetered).
- ADR 0026, two defaults reversible with a word: at STOP nothing is offered and candidates in hand
  are dropped; the coordinator acts on words written under an `Answer:`.
- `2026-10-16-scheduled-architect-design-pass.md`: yes or no; the HOLD deny's pool sentences
  (ADR 0011) unseen; delete `~/.claude/usage-state.json` once all projects run the new scripts.

## Open findings

- `docs/findings/2026-10-11-bash-heredoc-apostrophes.md`
- `docs/findings/2026-11-23-nested-agent-hook-probe.md` (open: P3, and two halves of P4)
