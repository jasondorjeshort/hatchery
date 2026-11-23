# Handoff

Coordinator state. Subagents follow their brief, not this file.
Updated: 2026-11-23 by main session

## Now

- ADR 0025 (the wave lead): build steps 1 to 3 are built and reviewed; its hook is registered; no
  `finish` is set, so nobody passes HOLD. Unpushed when written; `git status -sb` says.
- Carried from 2026-11-18, not re-checked: ADR 0023 sibling checkouts under `../` need a pull.

## Next

1. Push when the user asks. Then step 4 of `docs/hatchery/decisions/0025-wave-lead.md`, item 10: the
   shakedown, one small led change and one lead stopped mid-step, in a session started after the
   hook was registered (`brief` skill, "Led changes"); a tester records P1 to P4 before `close`.
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

- ADR 0025: the go-ahead for step 4; later, step 5 sets `fiveHour.finish` 75 and lowers `hold` and
  `finish` for one run, on your word then; if P3 fails, may a led change run on unmetered.
- ADR 0026, two defaults reversible with a word: at STOP nothing is offered and candidates in hand
  are dropped; the coordinator acts on words written under an `Answer:`.
- `2026-10-16-scheduled-architect-design-pass.md`: yes or no; the HOLD deny's pool sentences
  (ADR 0011) unseen; delete `~/.claude/usage-state.json` once all projects run the new scripts.

## Open findings

- `docs/findings/2026-10-11-bash-heredoc-apostrophes.md`
- `docs/findings/2026-11-23-nested-agent-hook-probe.md` (open until build step 4)
