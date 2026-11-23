# 0025. A wave lead runs one change's review-fix loop

Date: 2026-11-18
Status: promoted to ADR 0025

Revised in place 2026-11-23, after the critic review (`0025-critic-review.md`), the headless probe
(`../../findings/2026-11-23-nested-agent-hook-probe.md`) and the owner's seven decisions of that day. Factual
errors in the body are corrected where they stand, each marked "Corrected 2026-11-23". The option texts and
the drafts under Recommendation are kept as written: they are the record. What was decided is B as revised in
the last section, recorded in `../../hatchery/decisions/0025-wave-lead.md` and its sibling
`../../hatchery/decisions/0025-lead-contract.md`. Option A was built on 2026-11-23 as its own change.

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
- Usage gate (`.claude/agreement/usage-gating.md`, hook spec section 3). Corrected 2026-11-23: the draft
  called what follows "the owner's rule of today". It was the owner's intent for this proposal and was never
  built: the gate at `0e2d52c` refuses a launch or a send from HOLD whoever calls, harness cases UM09 and UM10
  expect that deny, and the agreement says "whoever calls" (critic cases C1 to C4). The intent as drafted: HOLD
  refuses new work from the coordinator, while a launch or send from inside running work passes up to a finish
  line, HOLD + (100 - HOLD) / 2 per meter; a lower deny line wins. The owner's decisions of 2026-11-23 replace
  that default (last section, responses 1 and 2): the finish line is off unless a project sets it, only a
  listed agent type passes HOLD, the weekly line stays at HOLD. Thresholds that stop or spend money are the
  owner's (`major-decisions.md`).
- Nesting is three layers by default (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). Corrected 2026-11-23: the
  draft said a pinned model holds when one subagent launches another. It does not: the Agent call's `model`
  parameter comes before the definition's `model` (sub-agents docs), and the probe saw a definition pinned to
  Haiku run on Sonnet when its launcher passed `model: sonnet`. Base agents today list neither Agent nor
  SendMessage.
- Iterated refinement degrades after a few rounds (finding, B); the right cap is unknown (D, low).
- Docs a lead or reviewer writes outside the tree follow nothing; tracked text follows ADR 0018.

## Options

All three share one convention, which is option A on its own: reports travel as files in a wave
directory `<scratchpad>/waves/<slug>/`, named by role and round (`review-1.md`, `response-1.md`,
`writer-1.md`, `snapshot-1.txt`); never `report`, `summary`, `findings` or `analysis`, which the
finding (C, unverified) says the harness may refuse to subagents. The directory is untracked and
dies with the scratchpad; the commit and its message are the durable record.
Corrected 2026-11-23: the refusal is verified and narrower than the finding said. The harness refuses a
subagent's Write of a `.md` file whose base name starts with one of those four words, in any case
(`report-1.md`, `ANALYSIS.md`); `review-summary.md`, `wave-report.md` and `findings.txt` pass, and so does a
shell redirect (critic's table). The scratchpad path carries the session id, so "dies with the scratchpad"
means the record of a stopped loop is lost at the session's end (response 6).

### A. Relay by path, coordinator still in the loop

The reviewer writes its full report to `review-<n>.md` and returns the path, counts per severity and
the ids of blocking and serious findings. The coordinator resumes the writer with the path
(SendMessage), not a rewritten brief; the writer answers in `response-<n>.md`; the coordinator
launches a fresh reviewer for the re-check, then the runner.
Corrected 2026-11-23: A as built has no re-check. The coordinator reads the response file itself, so nothing
stands between it and the fix; a re-check is B's need, not A's (response 4).

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
  foreground, one after another); nesting depth 2 of 3. Corrected 2026-11-23: foreground launches were
  observed only headless; the docs say an interactive session's subagents start in the background. Serial
  order was the lead's restraint, not a property of the platform (responses 3 and 9).
- Cost: coordinator per change is one brief and one verdict of about fifteen lines, plus reading
  review files only on a stop or a spot check. The lead's own context carries short returns and runs
  on Sonnet, a fifth of Fable; the writer, reviewer and runner cost what they cost today, plus one
  re-check reviewer per round that A also pays. Net: coordinator tokens fall; total tokens rise by
  the lead's own run. The pilot measures both. Corrected 2026-11-23: A does not pay the re-check, so
  B's total rises by the lead's run and by up to two reviewer runs on a fix's delta.
- Risks: a Sonnet lead mis-routes or loops (MAST: unaware of termination 12.4%, step repetition
  15.7%); mitigated by a fixed loop, a round cap, a verdict that lists every launch, and stop rules
  that return to the coordinator. Scope creep past HOLD: a running lead could start work its brief
  did not name, which the gate cannot tell from wave work. The coordinator cannot message a running
  lead at HOLD (hook spec, known limit); TaskStop still works.
- Exit cost: delete one agent file, revert the one-review paragraph and the gate's caller rule
  (or set `finish` to `hold`, below); no data migrates. Corrected 2026-11-23: understated. A policy key
  is a promised surface (ADR 0013): once shipped it stays, and removing it later is an incompatible change;
  reverting the loader under a project that set the key is the malformed-policy case of objection 1.
- Moving parts: `wave-lead.md`; Agent and SendMessage in one definition; Write on the reviewer; the
  gate's caller rule and finish line; a `brief` skill section for a lead brief. Corrected 2026-11-23: also
  four agreement files, the hook spec, harness cases, the status line, ADR 0006's key table and three more
  agent definitions; as revised, a script with its own hook entries as well (response 13).

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
  phases has to be an agent. Each run may need the owner's opt-in. Corrected 2026-11-23: a run now pauses
  at the plan cap and continues after it (workflows docs), which softens this risk on the session meter;
  `Workflow` is withheld from every subagent, so only the coordinator could start one.
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
Corrected 2026-11-23: the fallback is wrong as written, and "no hook change is needed" does not hold. The
critic ran it (cases F2, F4, F5): a payload with no `session_id` and no `cwd` matches no session grant and no
project grant, so the gate denies even while the owner's grant is in force ("An override exists for session
..., not this one"); and when the environment carries no session id the gate finds no file and allows at
5h 99. A phase gate would need the real `session_id` and `cwd` handed to it, or a gate entry point that takes
them. It is not built: C is not the recommendation, and the probe for hooks inside workflow agents was not
run (the finding's Next).

## Recommendation

B, built on A's file conventions, with the owner's gate rule. A alone keeps the coordinator in every
round; C cannot resume the writer and rests on an unknown that also decides whether `git-guard`
protects it. C stays the candidate for repeatable sweeps once the probe answers.

Build order, each step useful alone: (1) A's conventions in the reviewer, coder and tester
definitions and the `brief` skill; (2) the gate change with its harness cases; (3) `wave-lead.md` and
the agreement text; (4) the pilot. Step 1 needs no ADR; steps 2 and 3 land with ADR 0025.

Revised 2026-11-23. The recommendation stands as B on A's conventions, with B rebuilt on the critic's
objections: the loop moves from the lead's prompt into a script (`lead.js`) whose one permitted step a hook
enforces; the commit comes before the review; the record lives in an ignored directory of the work tree; the
finish line is an additive key, off by default, for a listed agent type only; the pilot can fail. Step 1 was
built on 2026-11-23. The five subsections that follow (the verdict, the gate change, the implied text, the
pilot, the surfaces) are the draft's and are superseded by ADR 0025 and its sibling wherever a response
below says so; their factual errors are corrected in place.

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

Corrected 2026-11-23, three points in this subsection. The caller rule as drafted (any `agent_id`) and the
derived default are replaced (responses 1 and 2), so UM09 and UM10 do not flip: under a policy that sets no
finish every caller is denied as today. "The known limit ... ends below the finish line" was wrong on two
counts: a child's report reaches its launcher in the Agent tool's result or by a hand-back call, neither of
which the gate's matcher sees, so there was nothing to end; and the limit as written concerns a `SendMessage`
reply, which stays gated for every type off the list. And 98.5 was never a usable line: the meters report
whole numbers, so it acts as 99.

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
  Corrected 2026-11-23: this migration breaks the project that follows it. A key written before the update
  is read by the project's old `policy.js` as `unknown key usage.finish`; the file is then malformed, the
  gate falls back to the base defaults and `git-guard` denies every git command, so the update itself cannot
  be committed (critic's test). The last sentence is true and beside the point: the older loader reads the
  project's own file. As decided, there is nothing to migrate: `finish` defaults to the meter's `hold`
  ("Off by default", the owner, 2026-11-23), so an existing `hold` means what it meant, and a project writes
  the key only after the update that brings the loader (response 1; the ADR's Migration table).
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
  `agent_id`: a one-line narrowing of the caller rule. (Fired 2026-11-23: "Only the wave lead", the owner;
  response 2. The second bullet did not fire: `agent_id` is present at depth 2 and absent in the main session.)

## Claims to verify

Results as of 2026-11-23 follow each claim (the critic's table; the headless probe, Claude Code 2.1.330).

1. A subagent's PreToolUse payload carries `agent_id` and `agent_type` at every depth, the main
   session's (including `claude --agent`) carries no `agent_id`. Hooks reference; harness UM09
   assumes it; the finding (E) observed the parent's `session_id`.
   Result: observed at depth 1 and 2, each the calling agent's own, and absent in the main session, with
   `session_id` the main session's at every depth. A fork and `--agent` were not tried.
2. A subagent's `tools:` may list Agent and SendMessage; default depth three. Sub-agents docs.
   Result: holds (docs; the probe's lead launched and sent).
3. SendMessage to a finished subagent's id resumes it with its context and its result returns to
   the sender. Tools reference (the finding notes the docs disagree on targets).
   Result: half right. The context is kept (observed). The result does not return as a tool result:
   SendMessage returns at once and the reply is a notification on the session queue, which reached the lead
   only while the lead was still working and otherwise went to the main conversation (headless). Interactive
   behaviour is unobserved.
4. A subagent definition's pinned model holds when another subagent launches it. Sub-agents docs.
   Corrected 2026-11-23: fails as stated. The call's `model` parameter wins (docs; observed: a definition
   pinned to Haiku billed as Sonnet). The pin holds only when the launcher passes no `model`.
5. Whether `Agent(<type>, ...)` in a subagent's `tools:` restricts which types it may launch; if not,
   the lead's limit is prose only.
   Corrected 2026-11-23: it does not. The docs say the type list is ignored in a subagent definition, and
   the probe's lead, given `Agent(probe-writer)`, launched another type with no refusal.
6. Subagents of one session share its scratchpad directory, so wave-directory paths resolve for all.
   Result: holds at depth 1 (observed); the path is per session.
7. Workflow scripts have no filesystem or shell, and `agent()` cannot resume an earlier agent.
   Workflow-authoring reference.
   Result: holds (docs).
8. Hooks inside workflow agents: unknown; the probe above.
   Result: still unknown; not run, and nothing decided here depends on it.

## Critic's objections and responses

Review: `0025-critic-review.md` (critic on Fable 5.2), two blocking, eight serious, five minor. Fifteen
objections; six accepted, nine accepted with a change, none rejected. Evidence added since the review: the
headless probe (`../../findings/2026-11-23-nested-agent-hook-probe.md`). The owner's decisions, given in
answer to multiple-choice questions, settle seven points and are not reopened. Whether a grant lifts the
finish line with HOLD: "Yes, per meter" (the owner, 2026-11-23). The weekly finish line: "At HOLD, 97, until
measured" (the owner, 2026-11-23). Other projects: "Off by default" (the owner, 2026-11-23). Who may launch
past HOLD: "Only the wave lead" (the owner, 2026-11-23). Hatchery's 5-hour finish line: "75, halfway" (the
owner, 2026-11-23). The order of work: "A now, B after its fixes" (the owner, 2026-11-23). The probe: "An
agent, headless" (the owner, 2026-11-23). Names used below: `<d>` is a change's lead directory; sections are
those of the ADR's sibling, `../../hatchery/decisions/0025-lead-contract.md`.

1. Blocking: the migration denies git in the sibling that follows it, and the default changes what `hold`
   means for everyone who does nothing. Response: right on both counts, and tested. The derived default is
   gone: "Off by default" (the owner, 2026-11-23). `finish` is a per-meter key whose `null` means the meter's
   `hold`, so a project that edits nothing sees no change and a lead there is refused at HOLD in today's
   words, byte for byte (cases UF04 to UF06, UF09 and PS3 hold that). Hatchery sets its own value: "75,
   halfway" (the owner, 2026-11-23) on the 5-hour meter, nothing on the weekly one. There is no shared
   `usage.finish`: one number for two meters would put a weekly line where the owner has said there is none.
   The order is stated in the ADR's Migration table: the update first, a key only after it. The
   compatibility check that ADR 0013 and ADR 0026 item 12 tie to the next schema change lands with this one:
   `policy.js --schema`, a recorded `policy.schema.json`, harness group `PS` (sibling, section 2), whose
   failure line names its lift. Resolution: accepted.
2. Blocking: the exemption is keyed on any `agent_id`, a field nobody here has observed. Response: right.
   "Only the wave lead" (the owner, 2026-11-23): `usage.finishAgents`, base value `["wave-lead"]`, judged
   on `agent_type`, with a non-empty `agent_id` only as the is-a-subagent test. `"any"` is not a value the
   key takes, so the pre-mortem's drift needs a list edit per type, visible in a diff. The probe has since
   observed both fields at depth 1 and 2 and neither in the main session. A fork, a teammate and `--agent`
   were not tried and do not matter under this rule: without an `agent_id`, or with a type off the list, the
   caller is the coordinator. One step further than the critic asked: the hook that bounds a lead binds
   every type on the same list, and the gate gives a finish line only in a tree where that hook is installed
   and loads (it asks `lead.js` itself). So a listed type passes HOLD only where it is bound; in a tree whose
   `.claude/settings.json` lacks the hand-merged entries, or whose `lead.js` cannot load, every caller is
   refused at HOLD as today (corrected after the ADR's review, finding 1-6: the first wording claimed the
   bound without the gate checking for it). Resolution: accepted.
3. Serious: every limit on the lead is prose, at the points the docs say a definition cannot enforce.
   Response: right, and the probe confirmed claims 4 and 5 against the draft. The design offered is taken:
   the state machine is a script, `.claude/hooks/lead.js`, whose `step(dir)` derives the one permitted step
   from the files of `<d>` and the repository; the same function runs in a PreToolUse hook for the lead's
   calls, which refuses an `Agent` call with a `model`, a type or a prompt other than the step's, and a
   second attempt at a step; harness group `WL` exercises every rule on fixture directories with no agent
   launched, and the CLI is the debug interface the draft lacked. Changed in four places. The audit of
   `Launches:` against the transcript's meta files is replaced by the hook's own permit log, which the
   verdict prints: the meta files are an internal format, and a log written by the check that permitted the
   launch cannot disagree with it. The lead loses Read, Glob, Grep and Skill and keeps `Bash, Agent,
   SendMessage`, with Bash held by the hook to the script's four commands, so the shell write the critic
   tested is refused and the lead cannot read a review it might paraphrase. The lead does not read counts or
   ids from what a reviewer returns: the script parses four fixed header lines of the review file and the
   response's one line per id. The writer's agent id is recorded from the Agent call's PostToolUse payload,
   not reported by the lead. `maxTurns: 100` is set. The hook refuses a lead's call on any exception of its
   own and exits at once for everyone else; a script that cannot load is non-blocking, as the gate is, and
   the gate then gives no finish line (response 2); that is stated in the fail-mode table. Resolution:
   accepted with change.
4. Serious: "the same review finishing" renames a second and third review, against a baseline that has none.
   Response: right; the phrase is withdrawn and the body corrected ("that A also pays" was wrong). The text
   now says what is added and why: a led change gets the same one review, and each fix round is then checked
   by a fresh reviewer that reads only what the fix changed. The check is an addition. It stands in for the
   coordinator's reading of the fix, which a lead cannot do, and it is justified only there: a fix the
   coordinator relays itself gets none by rule, since the coordinator reads the response file. "One review,
   not three" stays true of the first reading; the check reads a different diff. On ADR 0021's lanes: a lead
   is for a change that gets a review, which is the full lane, and the Question's cost claim is scoped to
   those; a light-lane change has no loop to run. The last check is not that lane's verifier: the verifier
   reads the whole range for a merge verdict and a wave with no fix round has no check at all, so it stays a
   separate launch by the coordinator once ADR 0021 is built. Resolution: accepted with change (the cost is
   stated as an addition, not argued away).
5. Serious: the re-check reviewer is handed the writer's account. Response: right, and the evidence is the
   finding's own. Taken further than offered: the check's prompt never names the response file and its
   instructions say not to read one. It is given two shas and the earlier review, reads `git diff <a> <b>`
   first, then the earlier blocking and serious findings, and lists those still open under their old ids
   plus new defects in the diff. "Only then may open the response" is dropped: the check has no use for it,
   since a decline stops the change before any check runs. A verdict of rethink, at the first review or at a
   check, is a stop. Resolution: accepted with change.
6. Serious: the record of a stopped wave lives in a per-session temporary directory. Response: right. The
   record moves to `<repo>/.lead/<slug>/`, an ignored directory in the work tree, with `lead.json` holding
   the state, the round, the commits, the writer's agent id with the session it belongs to, and every
   permit. A change stopped for days resumes at the first missing output, under a new lead or with the
   coordinator turning the same command by hand; the script issues the fix to the recorded writer only when
   that agent belongs to the current session, and to a fresh writer otherwise, so the fresh-writer case is a
   named path with a harness case and not an accident. A fix that produces no response is never re-issued
   by the script on its own: it stops, and the coordinator's `resume` decides, since nothing shows whether
   the first writer is still at work (the ADR's review, finding 1-5). Changed in two places. The ignore line is checked,
   not assumed: `lead.js init` refuses when `git check-ignore` fails and prints the line to add, because
   `.gitignore` is project-owned and an update cannot bring it. And the directory is not deleted on landing:
   the coordinator closes it (`lead.js close`) after filing what ADR 0026 item 9 still files, the minor
   findings left and the writer's notes, which the verdict lists by id and path. Relay by hand (A) keeps its
   scratchpad directory, any name, unless the coordinator starts it with `lead.js init`. Resolution: accepted
   with change.
7. Serious: stopping before the commit leaves a dirty tree at five points and covers one. Response: right,
   including the snapshot test; snapshots are gone. Today's order is kept: the writer drafts the message
   (`message.txt`) and lists its files, the runner commits from a brief the script writes, the reviewer reads
   the unpushed commit and its message, a fix is amended in, and the verdict names a sha per commit. A stop
   reached at a review, a response or a check leaves a clean tree and unpushed commits. Changed in three
   places. Some stops still leave a dirty tree, and the verdict says so and names the paths (corrected after
   the ADR's review, finding 1-1: the first wording said every stop after the first commit was clean). A
   writer that reports itself blocked before any commit is one. The others are a stop at a commit step or
   during a fix: a refused runner launch, no output, the coordinator's stop. There the change's own files
   sit uncommitted; no WIP commit takes them, and the change's own commit step does, run by a lead's runner
   on `resume` or by the coordinator from the brief the script wrote. A fix is a follow-up commit when the reviewed commit is no longer
   HEAD or has been pushed, which happens when the coordinator's handoff commit lands on top (response 12);
   the script picks the form and writes the brief either way. And since the push is now the only gate, it
   is checked: the pusher refuses while `lead.js status` reports a change that is running, stopped, or
   waiting for the owner's review. The script also compares `git status` after each commit and after each
   review, so an unlisted file or a path a reviewer wrote stops the change. Resolution: accepted with change.
8. Serious: the pilot cannot decide, and it runs on the wave that rewrites its own bounds. Response: right
   on each point. Redesigned as offered, with two changes. All six pilot changes run on B, and A's cost is
   computed from the same runs, so every change is its own pair. The A-equivalent is not "the returns the
   lead received, priced in the coordinator's context", because with reports by path those returns are a
   few lines: what a relay costs is turns, each re-reading the coordinator's context. So `A` is twice the
   lead's permit count times the mean cost of a coordinator turn in that span, against `B`, the
   coordinator's measured cost for the change, and `L`, the lead's own. The thresholds and the withdrawal
   rule are fixed in the ADR (item 11, K1 to K4): no "wide gap", no extension, and three of the four
   criteria withdraw B outright. The finish line is exercised once on purpose in step 5, with `hold` and
   `finish` lowered for one run on the owner's word. On where it runs: not "land 0021 first". The pilot
   excludes any change that edits the lead's own bounds (`lead.js`, `usage-gate.js`, `policy.js`,
   `git-guard.js`, `.claude/settings.json`, `wave-lead.md`), which sends ADR 0021's T-b, T-e and T-f through
   A and leaves T-c, T-d and queue work to the pilot; waiting for the whole of 0021 would hold B behind a
   wave it does not need. Resolution: accepted with change.
9. Serious: B rests on platform behaviour nobody has observed. Response: right when written. The probe ran
   the same day ("An agent, headless", the owner, 2026-11-23) and settled what a headless run can: the ids by
   depth, the model override, the inert type list, a resume that keeps context, and where its reply goes.
   The last result changed the design: the lead's loop no longer depends on a return. After every call it
   runs `lead.js wait <d>`, which polls for the step's file, so it does not matter whether a launch runs in
   the foreground or the background, or whether a resumed writer's reply arrives as a tool result, a
   notification, or in the main conversation. The lead's final text does not matter: the coordinator reads
   `lead.js verdict <d>`. Hooks inside workflow agents do not matter: nothing here runs in a workflow. Four
   behaviours remain that only an interactive session can show, and each is a named precondition (ADR, item
   9), observed in the shakedown of step 4 before anything leans on it: P1, a lead's calls reach the hook
   with its type, a send's payload matches the step, and each step's file appears; P2, the PostToolUse
   payload carries the launched agent's id; P3, the 5-hour reading rises while the coordinator is idle, on
   which the step that sets Hatchery's finish line waits; P4, whether the agents a lead launched go on after
   it ends or is stopped, and whether the coordinator can see and stop them. If P3 fails no finish is set
   and the owner is asked whether a change started below HOLD may run on unmetered. On P4 the first wording
   here said stopping a lead was "made not to matter"; that was not shown (the ADR's review, finding 1-2).
   `lead.js stop` stops only the lead's next call. Until P4 is observed nothing rests on it: no step is
   re-issued within the hour unless the coordinator says its agent is not running, and the coordinator
   commits none of an open change's paths. Resolution:
   accepted with change (the probe was run before the ADR; what it could not reach is a precondition of a
   named step, not an assumption).
10. Serious: the lead writes the writer's and reviewer's briefs. Response: right; briefing is the
    coordinator's named work. The coordinator writes `brief-writer.md` and `brief-reviewer.md` into `<d>`;
    `next` stops with `brief missing` without both. The lead's prompts are six one-line templates holding
    paths (sibling, section 4), the formats each role must produce are in a `steps.md` the script writes,
    and the hook compares each prompt the lead sends with the template. The lead's own brief is one line
    naming `<d>`. The `brief` skill's section is specified in the sibling, section 7. Resolution: accepted.
11. Minor: "wave" collides with the wave-close triggers. Response: right. The agent keeps its name, which
    the owner's decision and the finding use; the unit it runs is called a change everywhere: the verdict
    begins `Change <slug>:`, the script is `lead.js`, the directory `.lead/`. `delegation.md` defines the
    term: a wave is the batch of changes launched together, and a lead runs one change of it. A led change
    landing is therefore not a wave close and fires none of those triggers; ADR 0026's deferred wave skill
    is not triggered either, since this adds a `brief` section and no skill. Resolution: accepted with
    change (the term is defined and the unit renamed; the agent is not).
12. Minor: the wrap-up commit waits for the verdict, against ADR 0022. Response: right. The handoff is
    committed first, by pathspec, and a collision on the index lock is retried once after ten seconds; the
    `commit` and `handoff` skills and `git.md` take that text (sibling, section 7). While a led change is
    open the coordinator commits only what it wrote, the handoff and queue files; the change's own
    uncommitted files go through its commit step, never a WIP commit (corrected after the ADR's review,
    findings 1-1, 1-2 and 1-7: the first wording let a WIP commit follow `lead.js stop`, which stops no
    agent already running). A handoff commit landing on top of a led commit is why a fix may be a follow-up
    commit (response 7). ADR 0022's sentence stands. Resolution: accepted.
13. Minor: B's exit cost and moving parts are understated. Response: right; both lines are corrected in
    the body. The ADR says the keys are promised from now on and stay, inert at `null`, if the lead is
    withdrawn, and lists what a withdrawal removes. Resolution: accepted.
14. Minor: the workflow fallback is wrong as written. Response: right; corrected in place with the cases
    that showed it, and with the softened risk for C. Nothing is built from it. Resolution: accepted.
15. Minor: small corrections. Response, point by point. The naming rule is stated as observed: a prefix
    match on a `.md` base name, in any case. The reviewer's Write: A confined it by prose, and a reviewer
    has Bash, so prose was always the bound on its shell; for a led change a mechanical check is added
    without a new hook, since the script stops the change when `git status` shows a path dirtied during a
    review. The reviewer's sentence is widened to allow the review file in `.lead/`. The stale "known limit"
    claim is corrected in the body. The agent ids are in `lead.json` and on the verdict's `Writer:` line.
    The lead's prompt says the verdict is its hand-back where the session has one, and the coordinator reads
    the verdict from the script in any case. Resolution: accepted with change (detection for the reviewer's
    Write on the led path, prose elsewhere).

Left to the owner by this revision, none of them an open objection: the status line shows ` finish <n>`
beside a meter that sets one (wording the owner sees; a default, reversible with a word); the step 5
exercise lowers two thresholds for one run and waits for the owner's word; and the question P3 would raise
if it fails.
