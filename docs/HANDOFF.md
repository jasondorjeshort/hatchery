# Handoff

Coordinator state. Subagents follow their brief, not this file.
Updated: 2026-11-25 by main session

## Now

- The wave lead is withdrawn (ADR 0027, on the owner's word after the pilot failed K1): its agent,
  hook entries, sentences, `lead.js` and the gate's finish line are gone; the three policy keys stay,
  read by nothing. A reviewed change is relayed by path again (`brief` skill). Pushed at `00fcf05`.
- Unpushed: the four moot `lead.js` ideas dropped on the owner's word, their two lasting facts kept
  (`docs/hatchery/reference/claude-code-on-windows.md`, the `commit` skill, the runner and pusher).
- Carried from 2026-11-18, not re-checked: ADR 0023 sibling checkouts under `../` need a pull.

## Next

1. Close `docs/findings/2026-11-23-nested-agent-hook-probe.md`: promote its platform facts to a
   reference entry under `docs/hatchery/reference/` (`finding` skill, Resolve). Then push on request.
2. Triage `docs/ideas/` (`triage` skill). Unlanded on `../dystopo-2`'s origin:
   `carry-back/handoff-no-process-ids`, `carry-back/test-hooks-cb1-skip`.
3. In `../dystopo-2`'s own session: update from Hatchery, then its row of the migration table in
   `docs/hatchery/decisions/0026-brainstorm-contract.md`, section 5.
4. The ADR 0021 wave, T-a to T-g; fold the 2026-10-21 and 2026-10-19 guard ideas into T-b.
5. Each sibling in its own session: ADR 0018 back; its 0016 migration; 0020 and 0021; regenesis
   and droplet-management still lack `privacy.identities`. ADR 0027's table says what an update takes.
6. Chore: worktrees `../hatchery-wt/T120`, `T121`, `usage-gate`; `.claude/worktrees/agent-*`.

## Waiting on user

- ADR 0026, two defaults reversible with a word: at STOP nothing is offered and candidates in hand
  are dropped; the coordinator acts on words written under an `Answer:`.
- `2026-10-16-scheduled-architect-design-pass.md`: yes or no; the HOLD deny's pool sentences
  (ADR 0011) unseen; delete `~/.claude/usage-state.json` once all projects run the new scripts.

## Open findings

- `docs/findings/2026-10-11-bash-heredoc-apostrophes.md`
- `docs/findings/2026-11-23-nested-agent-hook-probe.md` (open: its facts await a reference entry)
