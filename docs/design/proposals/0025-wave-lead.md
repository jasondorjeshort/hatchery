# 0025. A wave lead runs one change's review-fix loop

Date: 2026-11-18
Status: draft

## Question

How much of the coordinator's relay work can move to a cheaper agent without losing the one-review
rule or letting the plan cap cut work off? Today every change costs the coordinator a brief to the
writer, the writer's report, a brief to the reviewer, the reviewer's report, a fix brief per round
(a rewrite of the findings), each fix report, a runner brief and its report. Each enters the most
expensive context in the session and is re-read on every later turn. The owner's goal: fewer
coordinator tokens per landed change, and in-flight work that finishes before the cap instead of
being stopped mid-wave. In ten years the answer should still be a small, fixed loop whose record is
files, with the judgment calls (scope, overrides, what humans see) left with the coordinator.

Inputs: `docs/findings/2026-11-18-agent-to-agent-messaging.md` (sections B to D),
`docs/ideas/2026-11-18-agents-message-each-other-directly.md`, the gate as built after `0e2d52c`.

## Constraints that matter here

- Delegation (`.claude/agreement/delegation.md`): the coordinator decides and briefs; agents execute.
- One review per change (`.claude/agreement/one-review.md`); the coordinator reads reports, never
  rewrites them, and alone overrides a finding. Rewriting reports is ruled out (finding, B).
- Agent teams and free peer messaging are ruled out (finding, B and C): teammates lose skills and
  pinned definitions; peers erode independence.
- Writes stay with one writer at a time per work tree. Commits from the `runner`, pushes from a fresh
  `pusher` with the user's request quoted (`.claude/agreement/git.md`); a lead pushes nothing.
- Usage gate (`.claude/agreement/usage-gating.md`, hook spec section 3): the owner's rule of today is
  that HOLD refuses new work from the coordinator, while a launch or send from inside running work
  passes up to a finish line, HOLD + (100 - HOLD) / 2 per meter; a lower deny line wins. Thresholds
  that stop or spend money are the owner's (`major-decisions.md`).
- Nesting is three layers by default (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). A pinned model holds
  when one subagent launches another. Base agents today list neither Agent nor SendMessage.
- Iterated refinement degrades after a few rounds (finding, B); the right cap is unknown (D, low).
- Docs a lead or reviewer writes outside the tree follow nothing; tracked text follows ADR 0018.

## Options

All three share one convention, which is option A on its own: reports travel as files in a wave
directory `<scratchpad>/waves/<slug>/`, named by role and round (`review-1.md`, `response-1.md`,
`writer-1.md`, `snapshot-1.txt`); never `report`, `summary`, `findings` or `analysis`, which the
finding (C, unverified) says the harness may refuse to subagents. The directory is untracked and
dies with the scratchpad; the commit and its message are the durable record.

### A. Relay by path, coordinator still in the loop

The reviewer writes its full report to `review-<n>.md` and returns the path, counts per severity and
the ids of blocking and serious findings. The coordinator resumes the writer with the path
(SendMessage), not a rewritten brief; the writer answers in `response-<n>.md`; the coordinator
launches a fresh reviewer for the re-check, then the runner.

- Meets: one-review unchanged in substance; no new agent; no gate change; no rewriting.
- Cost: the coordinator still takes about 4 + 3 per round turns per change; what shrinks is the size
  of each (a path and counts, not a report). The finding rates this high confidence.
- Risks: coordinator context still grows linearly with rounds and changes. At HOLD every in-flight
  loop stops at its next step, because every step is a coordinator launch.
- Exit cost: none; it is prose in the reviewer and writer definitions and the `brief` skill.
- Moving parts: the wave directory; Write on the reviewer (it has none today; a Bash heredoc breaks
  on apostrophes, `docs/findings/2026-10-11-bash-heredoc-apostrophes.md`).

### B. Wave lead subagent (as the owner scoped it)

A new `wave-lead` agent, briefed once per change. It launches the writer (`coder` or `tester`, as the
brief names), snapshots the tree, launches a reviewer that writes `review-1.md`, resumes the writer
with that path for at most two fix rounds, launches a fresh reviewer per round for the re-check,
launches the runner to commit, and returns one verdict (format below). It reads paths, counts and ids;
it never edits the tree, never rewrites a finding, never pushes.

- Meets: delegation (the lead is a delegate; scope, overrides and queue entries stay with the
  coordinator); one-review (amended below); one writer at a time (the lead launches agents in the
  foreground, one after another); nesting depth 2 of 3.
- Cost: coordinator per change is one brief and one verdict of about fifteen lines, plus reading
  review files only on a stop or a spot check. The lead's own context carries short returns and runs
  on Sonnet, a fifth of Fable; the writer, reviewer and runner cost what they cost today, plus one
  re-check reviewer per round that A also pays. Net: coordinator tokens fall; total tokens rise by
  the lead's own run. The pilot measures both.
- Risks: a Sonnet lead mis-routes or loops (MAST: unaware of termination 12.4%, step repetition
  15.7%); mitigated by a fixed loop, a round cap, a verdict that lists every launch, and stop rules
  that return to the coordinator. Scope creep past HOLD: a running lead could start work its brief
  did not name, which the gate cannot tell from wave work. The coordinator cannot message a running
  lead at HOLD (hook spec, known limit); TaskStop still works.
- Exit cost: delete one agent file, revert the one-review paragraph and the gate's caller rule
  (or set `finish` to `hold`, below); no data migrates.
- Moving parts: `wave-lead.md`; Agent and SendMessage in one definition; Write on the reviewer; the
  gate's caller rule and finish line; a `brief` skill section for a lead brief.

### C. A workflow script per wave

A Workflow script runs writer, reviewer, fix rounds and runner as `agent()` calls with
`agentType`, control flow in code; the coordinator gets the script's return value.

- Meets: deterministic loop and cap (code, not a model's restraint); no lead tokens for routing.
- Cost: cheapest routing. But `agent()` starts a fresh agent each call and the script API has no
  SendMessage, so a fix round cannot resume the writer: each round's writer re-reads the change.
- Risks, unresolved: whether PreToolUse hooks fire for agents inside a workflow at all. If they do
  not, `git-guard` is blind there as well as the usage gate, and any phase that writes or commits is
  unsafe. The gate sees only the Workflow launch. A workflow pauses at the plan limit, not at a
  project threshold (finding, A). A script has no filesystem or shell, so a gate check between
  phases has to be an agent. Each run may need the owner's opt-in.
- Exit cost: low; scripts are files.
- Moving parts: the Workflow tool in the coordinator's routine; scripts under a path to be chosen;
  a phase-gate agent per phase (fallback below).
- Fit: strong for repeatable read-mostly shapes (sibling propagation, the propagate-out idea), weak
  for a review-fix loop that depends on the writer's context.

### The workflow hook check (cheap; for whoever runs it, not this pass)

Run in a throwaway directory `<scratchpad>/hookprobe/`, never in a repository. Its
`.claude/settings.json` registers one PreToolUse hook, matcher `.*`, running a ten-line Node script
that appends `{hook_event_name, tool_name, session_id, agent_id, agent_type}` as one JSON line to
`probe.log` and exits 0 (allows). One interactive session there, with the owner's opt-in to a
workflow, runs a one-phase script: one `agent()` on Haiku, effort low, told to run the Bash command
`echo probe` and return `done`. Cost: one Haiku agent, a few thousand tokens. Read `probe.log`:

- A Bash line carrying an `agent_id`: hooks fire inside workflow agents; `git-guard` holds there.
  An Agent line for the spawn is not expected (`agent()` is not a model tool call).
- Only the Workflow line: hooks do not fire inside; C is limited to read-only work, and the gate
  must be checked between phases (fallback).
- Repeat with `agentType` set to a definition the probe directory carries, to see whether its pinned
  model and tools hold. Before running anything, read the hooks and workflows pages of the Claude
  Code docs; a documented answer makes the probe unnecessary.

Fallback, if workflow agents bypass the gate: each script opens every phase with a phase-gate agent
(Haiku, effort low, schema `{allow: boolean, reason: string}`) that runs
`echo '{"tool_name":"Agent","agent_id":"workflow"}' | node .claude/hooks/usage-gate.js` and
returns `allow: false` with the deny text when stdout is non-empty. With no `session_id` in that
input the gate reads `CLAUDE_CODE_SESSION_ID` (observed equal to the parent's), so it judges the
session's own file, as inside work. No hook change is needed; the script returns early on a deny.

## Recommendation

B, built on A's file conventions, with the owner's gate rule. A alone keeps the coordinator in every
round; C cannot resume the writer and rests on an unknown that also decides whether `git-guard`
protects it. C stays the candidate for repeatable sweeps once the probe answers.

Build order, each step useful alone: (1) A's conventions in the reviewer, coder and tester
definitions and the `brief` skill; (2) the gate change with its harness cases; (3) `wave-lead.md` and
the agreement text; (4) the pilot. Step 1 needs no ADR; steps 2 and 3 land with ADR 0025.

### The verdict (the lead's whole final message)

```
Wave <slug>: landed | stopped: <reason>
Commit: <sha> (unpushed) | none
Rounds: <n> of <cap>
Review: <path> [<path> ...]   Responses: <path> [...] | none
Open: <id> <severity> <declined|unfixed> [, ...] | none
Minor left: <id> [, ...] | none
Writer notes: <path> | none
Launches: <type> x<n> [, ...]
Gate: below HOLD | past HOLD on <meter> at <pct>% | refused at <line>
Tree: clean | dirty: <paths>
```

Stop reasons: an open or declined blocking or serious finding after the last round; the writer
reports needing scope the brief does not give (a dependency, an interface it must not change); a
writer's failing tests; a gate refusal; an agent error; the wave touching what humans see (the brief
says so, and the lead stops before the commit for the user's review). A stop before the commit leaves
the tree as it is; the coordinator decides. A new lead briefed with the same wave directory resumes
at the first missing file, in the order writer, snapshot, review, response, re-check, commit.

### Gate change (`usage-gate.js`, hook spec section 3)

- Caller: inside work when the payload's `agent_id` is a non-empty string; otherwise the coordinator.
- Per meter: `finish = hold + (100 - hold) / 2` unless `usage.fiveHour.finish`, `usage.sevenDay.finish`
  or a shared `usage.finish` sets it (percent, null for derived; less than its `hold` is malformed).
  Inside work's ceiling per meter is the lower of `finish` and `deny`. Base today: 5h 50 to 75,
  7d 97 to 98.5.
- Coordinator: unchanged. Inside work: allowed when the coordinator would be allowed (below HOLD, or
  HOLD lifted by a grant or `usage.overrideEnv`: a lifted HOLD lifts the finish line derived from it),
  or when every tripped meter is below its ceiling, with a stderr note `past HOLD (<detail>); inside
  work until <meter> <finish>%`. At or above a ceiling: deny, `<meter> at or above its finish line
  <finish>%: let the running agent return and report.` A deny line is never lifted.
- Staleness, `harmlessSend`, the pool (only on the coordinator's HOLD deny) unchanged. The known
  limit "a nested subagent's reply to its launcher stays gated" ends below the finish line.
- Harness: UM09 and UM10 flip to allow at 5h 55; new cases at 5h 75 (deny), a deny line of 70 under a
  finish of 75 (deny at 70), 7d 98 and 98.5, an explicit `finish`, `finish` below `hold` (malformed),
  `agent_id` empty or non-string (coordinator), a grant lifting HOLD (inside work allowed above
  finish), the worse meter winning across 5h and 7d. Status line: `(hold 50 finish 75)`, text only.
- ADR 0021 item 7 (`usage.mode`, not yet built) composes: a coordinator's own session grant under
  `"warn"` is a grant like any other.

The weekly margin. Between 97 and 98.5 an in-flight lead may launch; between 98.5 and 100 its last
agent must finish, because the gate stops launches, not running agents. A margin smaller than one
agent's weekly cost means the plan cap cuts that agent off. No floor is proposed now: a floor would
move the finish line toward 100, which is the cut-off it exists to prevent, and raising the margin
means lowering the weekly HOLD, the owner's money call. The pilot records the largest single-agent
and whole-wave weekly delta; if the largest agent exceeds `100 - finish`, the owner chooses between a
lower weekly HOLD and an explicit `sevenDay.finish`.

### Text the change implies (proposed, not edited)

`.claude/agreement/delegation.md`, appended: "A change that needs a writer, a review and a commit may
go to a `wave-lead` instead: one brief (`brief` skill), one verdict back. The lead launches only the
agents of that change, never widens its scope, files nothing in the queues and overrides no finding;
those stay the coordinator's. One lead per work tree at a time."

`.claude/agreement/one-review.md`, the coordinator's draft adopted with five changes (reasons after):
"A wave lead routes fixes in the coordinator's place, within limits. The reviewer writes its report to
the file the brief names and the lead's verdict names that file, so the coordinator reads the report
itself, never a paraphrase. In a fix round the writer gets the report file and answers each blocking
or serious finding in a response file, fixed or declined with a reason; a fresh reviewer then checks
those findings against the fix and reads only what the fix changed: the same review finishing, not a
second one. At most two fix rounds; a brief may lower that, never raise it. A declined blocking or
serious finding, or one still open after the last round, stops the wave before the commit and goes to
the coordinator, who alone overrides a finding."
Reasons: (1) the decline is written, so the coordinator reads it too; (2) a re-check confined to the
listed findings misses a defect the fix introduced, while reading only the fix's delta keeps it from
becoming a second full review ("a reviewer asked to find problems will always find something");
(3) serious is included because the reviewer's serious-by-rule items (an unbriefed dependency, a
changed promised surface) must not be committed past by a lead; (4) "before the commit" says where
the stop falls; (5) the cap may go down for a small change, and going up is a new wave.

`.claude/agreement/usage-gating.md`: "from HOLD, whoever calls" becomes "from HOLD when the
coordinator calls; a call from inside running work (`agent_id` in the payload) passes until the
meter's finish line, halfway from HOLD to 100, or a lower deny line (ADR 0025)". Both HOLD rows add:
"an in-flight wave lead keeps launching its own wave's agents up to the finish line; the wrap-up
commit waits for its verdict or a TaskStop" (two commits at once collide on the index lock). A wave
refused at the runner leaves a reviewed, uncommitted tree; the coordinator's wrap-up commit, allowed
at any level, may commit it under the wave's message.

`.claude/agreement/model-routing.md`, a row: `| Running one change's writer, review, fix rounds and
commit from one brief | wave-lead | Sonnet 5.5 | A fixed loop routed by file path; the judgment stays
with the reviewer and the coordinator. |`

`.claude/agents/wave-lead.md` (new):

```
---
name: wave-lead
description: Runs one change from a single brief: writer, review, at most two fix rounds, commit; returns one verdict. Use when a change needs the review-fix loop and the coordinator should not relay it.
model: sonnet
tools: Read, Glob, Grep, Bash, Agent, SendMessage, Skill
---
You run one change. Read CLAUDE.md, then the brief: the change, the writer type, the wave directory,
the round cap (two unless lower), whether the change touches what humans see.
Loop: launch the writer in the foreground with the brief and its report path; save `git status
--porcelain` and `git diff` to snapshot-<n>.txt; launch a reviewer on the change with review-<n>.md;
if it lists blocking or serious ids, resume the writer (SendMessage to its id) with the review path
and response-<n>.md, snapshot again, launch a fresh reviewer for the re-check with the earlier review,
the response and both snapshots; repeat up to the cap; then load the `commit` skill and launch the
runner. Return the verdict in the brief's format and nothing else.
Rules: never edit the tree (Bash only for git status, git diff and writing snapshots); never rewrite,
summarise or grade a finding: pass paths and ids; never launch an agent for anything outside the
change; never push; never write in docs/ideas, docs/findings or docs/operator. Stop and return on any
stop reason in the brief. A refused launch is a stop, not a retry.
```

`.claude/agents/reviewer.md`: tools gain Write; the "no Write tool" line goes; a rule: "When the brief
names a review file, write the full report there, number findings `<round>-<n>`, and return only the
path, the count per severity, the ids of blocking and serious findings and the verdict line. In a
re-check, confirm or reopen each named finding and report new defects only in what the fix changed."
`coder.md` and `tester.md`: "When the brief names a report file, write the full report there and
return the path and three lines. In a fix round, answer each blocking and serious finding in the
response file: `<id> fixed` or `<id> declined: <reason>`; a finding that needs scope the brief does
not give is declined with that reason." The `brief` skill gains a lead-brief section; ADR 0002's hook
spec section 3 takes the gate text above.

### Pilot and measure

Where: Hatchery's own ADR 0021 wave, T-a to T-f (hook code with real review-fix loops; T-g is a
sibling's). Alternate: odd tasks by A, even by B, one wave at a time, Opus or Fable coordinator as
the day allows, recorded per wave. Measure per landed change, from the session transcripts' per-turn
`usage` (input, cache write, cache read, output), price-weighted by model, numbers only into a finding:

1. Coordinator tokens per landed change (target: B at least 40% below A).
2. All-agent tokens per landed change (B at most 15% above A; the lead must not just move the cost).
3. Waves cut off by the plan cap (target zero); waves refused at a finish line, and where.
4. Fixes the lead's loop closed that the coordinator, reading every review and response file after
   the pilot, would have declined or deferred (target at most one in the pilot).
5. Rounds used per wave and wall-clock, to calibrate the cap; the largest single-agent and whole-wave
   weekly delta, for the margin question.

Six changes is a small sample; the targets decide adoption only when the gap is wide, otherwise the
pilot extends to the next build-phase wave.

### Promised surfaces (ADR 0012, ADR 0013)

- Policy file row: new keys `usage.finish`, `usage.fiveHour.finish`, `usage.sevenDay.finish` are an
  addition, but the default changes what an existing `hold` means for a subagent's call (it no longer
  stops inside work). That is a changed meaning, so it is incompatible and needs ADR 0025 with a
  migration: a project that wants HOLD to stop everyone, inside work included, sets
  `"finish": <its hold>` per meter before taking the update (a hard-gate sibling under `usage.mode:
  "block"` likely wants this; its owner decides). A project's older `policy.js` never reads a newer
  project's file, since each project carries its own hooks.
- Grant files, usage cache, base line, idea grammar, handoff paths: unchanged.
- Hook seams: unchanged; the fallback pipes the hook's normal stdin, Claude Code's contract, not ours.
- Not promised and changing: deny wording, status line text, agent and skill prose, the new agent.

## What would change this recommendation

- The probe shows hooks fire inside workflow agents and a script can resume an agent: C for loops too.
- Subagent payloads lack `agent_id` at depth 2, or carry it for the main session: the caller rule
  needs another signal, and B runs without the finish line (A's stop-at-HOLD behaviour).
- The pilot misses target 1 or 2, or target 4 fails twice: A alone, with the lead withdrawn.
- A Sonnet lead loops or skips a stop in any pilot wave: the lead moves to Opus or the loop to C.
- The owner prefers the finish-line exception keyed on `agent_type: wave-lead` rather than any
  `agent_id`: a one-line narrowing of the caller rule.

## Claims to verify

1. A subagent's PreToolUse payload carries `agent_id` and `agent_type` at every depth, the main
   session's (including `claude --agent`) carries no `agent_id`. Hooks reference; harness UM09
   assumes it; the finding (E) observed the parent's `session_id`.
2. A subagent's `tools:` may list Agent and SendMessage; default depth three. Sub-agents docs.
3. SendMessage to a finished subagent's id resumes it with its context and its result returns to
   the sender. Tools reference (the finding notes the docs disagree on targets).
4. A subagent definition's pinned model holds when another subagent launches it. Sub-agents docs.
5. Whether `Agent(<type>, ...)` in a subagent's `tools:` restricts which types it may launch; if not,
   the lead's limit is prose only.
6. Subagents of one session share its scratchpad directory, so wave-directory paths resolve for all.
7. Workflow scripts have no filesystem or shell, and `agent()` cannot resume an earlier agent.
   Workflow-authoring reference.
8. Hooks inside workflow agents: unknown; the probe above.

## Critic's objections and responses

(none yet)
