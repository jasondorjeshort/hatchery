# 0025 critic review: a wave lead runs one change's review-fix loop

Date: 2026-11-23
Reviewer: critic (Claude Fable 5.2)
Proposal: `0025-wave-lead.md`, draft as committed in 9cd6a59; gate as built at 0e2d52c

Verdict: **A is right and can land now. B is not ready to record.** Two blocking objections (the
migration line denies every git command in the sibling that follows it; the past-HOLD exemption is
keyed on any `agent_id` while nothing mechanical bounds what a lead launches), eight serious, five
minor. Claim 4 fails as stated, claim 5 resolves against the proposal, claims 1, 3 and 8 stay
unobserved. Every blocking and serious item has a fix that keeps the owner's scope.

## What was checked, and how

Docs read 2026-11-23 at Claude Code 2.1.330 (`claude --version`): `hooks.md`, `sub-agents.md`,
`tools-reference.md`, `workflows.md`, `permission-modes.md`, `interactive-mode.md`, `statusline.md`,
all under https://code.claude.com/docs/en/, and the bundled `workflow-authoring` reference.

| Claim | Result | Evidence |
|---|---|---|
| 1. `agent_id`, `agent_type` at every depth; none for the main session | docs hold for a subagent; depth 2, a fork and `--agent` unobserved | hooks.md, Common input fields: `agent_id` is "Unique identifier for the subagent or in-process teammate the hook fires in"; Hook locations: tool events inside a subagent "carry the `agent_id` and `agent_type`". Nesting is not addressed. No hook here has ever read `agent_id` from a real payload; `git-guard.js` line 910 reads `agent_type` only |
| 2. `tools:` may list Agent and SendMessage; depth three | holds | sub-agents.md: "up to three layers below the main conversation"; a background subagent keeps `SendMessage`; `Workflow` is removed from every subagent |
| 3. SendMessage resumes a finished subagent; result returns to the sender | holds in the docs "in an interactive session"; unobserved | sub-agents.md, Resume subagents: "the resumed agent then reports back to the subagent that resumed it ... That subagent waits for the result before finishing its own work"; the resumed run is "in the background" |
| 4. A pinned model holds when a subagent launches it | **fails as stated** | sub-agents.md, model order: "1. The per-invocation `model` parameter ... 2. The `model` field in the subagent's definition". A lead that passes `model` on its Agent call overrides the reviewer's pin |
| 5. `Agent(<type>)` restricts a subagent's launches | **no: prose only** | sub-agents.md: "In a subagent definition ... any type list inside the parentheses is ignored" |
| 6. Subagents share the session scratchpad | holds at depth 1 (observed: this critic's scratchpad is the session's); the path is per session | `docs/hatchery/reference/claude-code-on-windows.md` line 92; the payload carries `scratchpad_dir` |
| 7. Workflow scripts: no filesystem or shell; `agent()` cannot resume | holds | workflows.md, Behavior and limits; the authoring reference lists every `agent()` option, none resumes; `resumeFromRunId` replays a run |
| 8. Hooks inside workflow agents | still unknown | workflows.md promises "the same permission checks and sandboxing", not hooks; the probe stands |
| Finding C: report-named files refused to subagents | **verified, and narrower** | Write refused `findings.md`, `report.md`, `report-1.md`, `ANALYSIS.md` ("Subagents should return findings as text, not write report files"); allowed `review-1.md`, `response-1.md`, `writer-1.md`, `review-summary.md`, `wave-report.md`, `findings.txt`; a Bash redirect to `summary.md` passed |
| "The owner's rule of today" (Constraints) | **not built** | cases C1 to C4 below; UM09 and UM10 expect the deny; `usage-gating.md` still says "whoever calls" |

Run in `<scratchpad>/critic-0025/` (hooks fed payloads; nothing written in the repository, no
agent launched, no commit made, so no script is left for a runner):

- `gate-cases.js`: the gate as built denies an `agent_id` caller at 5h 55, at 7d 98 and 99, and a
  resume by id (C1 to C4). The workflow fallback payload (no `session_id`, no `cwd`) is denied even
  with the owner's session grant or a project grant in force ("An override exists for session s1,
  not this one"), and is allowed at 5h 99 when the environment has no session id (F2, F4, F5).
- `guard-cases.js`: for a `wave-lead` caller `git-guard` denies commit and push and allows
  `git add -A`, `git stash`, `git apply`, `git checkout HEAD~1 -- <file>`, a shell write into the
  tree and `node -e` running git. A nested `runner` commits; a reviewer or critic does not, in any
  repository, since the guard keys on `agent_type`, not on where the command runs.
- Snapshots: in a scratch repository a new file rewritten between two `git status --porcelain`
  plus `git diff` snapshots leaves them byte-identical (`cmp`).
- Policy: with today's `policy.js` a file carrying `usage.finish` is `unknown key usage.finish`;
  `git-guard` then answers "Every git command is denied until it is fixed".
- Meters: all 36 files in `~/.claude/usage-state/` hold whole numbers. This session's file holds
  `seven_day` only. With the coordinator idle for 13 minutes (its transcript's last turn) and this
  critic working, `updatedAt` advanced every minute and `apiMs` grew faster than the clock; `7d`
  did not move, so whether a subagent's responses refresh `rate_limits` is not shown either way.
- Transcripts: `subagents/agent-*.meta.json` records `agentType`, `model`, `spawnDepth` and
  `requestShape` ("background" for a depth-1 launch in this session).

Unverified, each settled by one run in a throwaway directory with a logging PreToolUse hook: (a)
`agent_id` at depth 2, in a fork, and its absence in the main session; (b) a resumed writer's
result reaching the lead in auto mode, where `SubagentHandback` carries reports
(tools-reference.md) and is described as used once; (c) whether a lead can launch in the
foreground at all: sub-agents.md says an interactive session's subagents start in the background
while fork mode is on, and that a spawner "waits for their results before it finishes", which is
not serial launching; (d) whether TaskStop on a lead stops the writer it launched; (e) the meter
question above (log the usage file once a minute through one lead run); (f) claim 8.

## Refusals and their lifts

| Mechanism | Who lifts it, from where, mid-session | Does the refusal say so |
|---|---|---|
| Finish-line deny | The owner's grant, written by the coordinator in the main session and read at the next call (if the owner says a grant lifts it); otherwise the window's reset | No. "let the running agent return and report" names no lift, no reset time, and the text is silent on an explicit `finish` (objection 9) |
| Deny line | Nobody, by design; the project's owner edits `usage.deny`, read at each call | No; unchanged by 0025 and recorded in ADR 0006 |
| A refused launch is a stop | Nothing lifts it for that lead. A new lead is a coordinator launch, itself refused at HOLD, and cannot resume the old writer: no file records the writer's id | The verdict gives `refused at <line>`, not what to do next |
| Round cap | The coordinator, by "a new wave", which the proposal does not define on a tree that already has three reviews | `Rounds: 2 of 2` only |
| Stop before the commit | The coordinator overrides a finding; the user reviews what humans see | No path back: a lead resumed on the same directory reads the same declined finding and stops again. The coordinator must brief the runner itself, which is unsaid |
| Stale data under `whenStale: deny`, a classifier block at spawn, the concurrency limit | The status line; the owner | The lead treats each as a stop, and the verdict has only a `Gate:` line to put it on |

## The two owner questions

Does the grant lift the finish line? My position: yes, per meter, for a derived and an explicit
`finish` alike. A grant lets the coordinator launch at 80; a lead refused at 75 would be stricter
than its own coordinator, who can then relay the same steps by hand, so the refusal would have a
route around it and no purpose. `deny` is already the line no grant lifts (ADR 0006). Two things
the owner should know before saying yes: under a grant nothing protects the last agent from the
plan cap unless a `deny` is set, and under ADR 0021 item 7 (`usage.mode: "warn"`, unbuilt) the
coordinator writes that grant itself, so the finish line then stops only an unattended lead.

Does the weekly meter need a minimum margin? My position: yes, and the halfway rule should not
apply to it by default. Readings are whole numbers here, so 98.5 acts as 99: inside work launches
at 97 and 98 and the last agent has one point. The account this session runs on reports no
five-hour window, so the weekly line is the only one in force for it. A session-cap hit is now a
pause (interactive-mode.md: Claude Code "waits in the open session and continues the task"), while
a weekly hit is not ("a weekly limit can reset days out"), and the weekly meter is shared with
every other session on the account. Until the pilot has the largest single-agent weekly delta,
`sevenDay.finish` should equal the weekly HOLD; after it, the owner sets it explicitly or lowers
the HOLD. The proposal's own paragraph reaches the same arithmetic and then proposes no floor.

## ADR 0026, and two older records the draft does not mention

- ADR 0026 item 12 and its Deferred list name "the next change to the policy schema" as the
  trigger for the policy-schema compatibility check; ADR 0013 says it lands with that change. 0025
  is that change and is silent. The `adr` skill (since 0026) wants a Migration table, one row per
  tree; 0025 has one sentence (objection 1).
- "Wave" now names two things. The `brainstorm` skill and `handoff` step 5 fire "at a wave close",
  and ADR 0021 item 6 audits "at wave close"; 0025's verdict says `Wave <slug>: landed` for one
  change (objection 11). 0026's deferred "cadence in a base wave skill" is not triggered: 0025
  adds a `brief` section, not a wave skill; it should say so.
- ADR 0026 item 9 keeps review follow-ups and seen defects filed "as before". A lead files
  nothing, and `Minor left:` ids point into a scratchpad (objection 6). Nothing else conflicts:
  the lead writes no idea file and no `Waits:`.
- ADR 0022: "The handoff and commit come first, so a session that dies while waiting loses
  nothing." 0025 makes the wrap-up commit wait for the verdict (objection 12).
- ADR 0021 (accepted, unbuilt, and the pilot's own wave): objections 4 and 8.

## Objections

1. **Blocking. The migration denies git in the sibling that follows it, and the default changes
   what `hold` means for everyone who does nothing.** "Sets `finish` ... before taking the update"
   puts an unknown key in front of the old `policy.js`: tested, the gate falls back to base
   defaults and the guard denies every git command, so the update cannot be committed. The sibling
   told to do this is the hard-gate one. Resolve: make it an addition. `finish` defaults to the
   meter's `hold` (no change of meaning, no migration, free under ADR 0013), and Hatchery's own
   `policy.json` sets the owner's values. If the derived default stays, the ADR needs the table,
   the order (update first, key second, in one sitting) and the schema compatibility check.
2. **Blocking. The exemption is keyed on any `agent_id`, a field nobody here has observed.** It
   covers every present and future caller with the Agent tool: a built-in `general-purpose` agent
   (all tools, launchable by the lead since claim 5 fails), a fork of the coordinator (fork mode is
   on by default; a fork keeps the coordinator's context and tools), an in-process teammate, a
   workflow agent if hooks fire there. The proposal concedes the gate "cannot tell" wave work from
   new work and lists the narrowing as an owner preference. It is the safe default and costs one
   line: a policy list of inside-work agent types, base value `["wave-lead"]`, judged on
   `agent_type`, which `git-guard` already relies on; `agent_id` only as the is-a-subagent check.
3. **Serious. Every limit on the lead is prose, at the points the docs say a definition cannot
   enforce.** Type list ignored (claim 5): it can launch `architect` or `pusher`. Model pin
   overridable (claim 4): a Sonnet lead passing `model: sonnet` to the reviewer produces the weak
   reviewer `model-routing.md` warns of. Bash edits the tree (tested). Ordering: launches and the
   resumed writer run in the background, so "one writer at a time" is the lead's restraint. The
   cap and the `Launches:` line are self-reported by the model whose miscount they exist to catch.
   No `maxTurns`. And the lead has no debug interface (`debug-interface.md`): nothing exercises
   "resume at the first missing file" or the cap without spending a real wave. Resolve: put the
   state machine in a script (`wave.js next <dir>` prints the one permitted step, harness cases on
   fixture directories); a PreToolUse check for `agent_type: wave-lead` that denies an Agent call
   with a `model`, a type outside the four, or a launch `wave.js` does not name; audit `Launches:`
   against `subagents/agent-*.meta.json`. This is C's determinism without losing the resume.
4. **Serious. "The same review finishing" renames a second and third review, against a baseline
   that has none.** Today a fix is "amended into" the commit and nobody re-reads it; `one-review.md`
   says "One review, not three". B adds up to two Opus readings and leaves that sentence standing.
   The re-check is defensible only as the replacement for the coordinator's reading of the fix, so
   say that, and say what A needs (there the coordinator can read the response itself, so A may
   need none, which makes "that A also pays" wrong). ADR 0021 already splits the rule: the light
   lane has no review before `main`, the full lane has a review and a fresh verifier. State
   whether the last re-check is that verifier, and scope the Question's cost claim to full-lane
   changes.
5. **Serious. The re-check reviewer is handed the writer's account.** The finding's own evidence
   (conformity, evaluators favouring familiar text) applies to a same-model reviewer reading
   `review-1.md` and `<id> fixed` before the diff. It does not need the response: a decline stops
   the wave and goes to the coordinator anyway. Resolve: the re-check gets the earlier finding ids
   and the delta, judges each, and only then may open the response; `rethink` as a first verdict
   is a stop, which the stop list lacks.
6. **Serious. The record of a stopped wave lives in a per-session temporary directory.** The
   scratchpad path carries the session id; a tracked handoff may write only `<scratchpad>`, which
   the next session resolves to its own empty directory. A weekly stop means days and perhaps
   another account. The writer's id is in no file, so a new lead cannot resume it and the fix
   round runs on a fresh writer, the defect the proposal holds against C. Minor findings and
   writer notes die there unread. Resolve: an ignored directory in the work tree (one lead per
   tree already), a state file with agent ids and round, deleted on landing; the coordinator files
   what ADR 0026 item 9 says is still filed.
7. **Serious. Stopping before the commit leaves a dirty tree at five points and covers one.** A
   refusal at the re-check leaves an unreviewed fix; at the resume, known blocking defects; only
   "refused at the runner" has a rule, and there the coordinator commits a tree it has not read.
   The snapshots cannot show a fix to a new file (tested), and the commit message, "the durable
   record", is written after the review by the one agent that read nothing, with no Write tool for
   a message file. Today's order avoids all of it: the runner commits first, the reviewer reads the
   unpushed commit and its message, the fix is folded in, the push is the gate. Resolve: keep that
   order; the verdict names a sha per round; the writer drafts the message; a stop leaves a clean
   tree and an unpushed commit.
8. **Serious. The pilot cannot decide, and it runs on the wave that rewrites its own bounds.**
   Three changes per arm, assigned by parity, differing in size by an order of magnitude (T-b
   rewrites the guard, T-a is an operator entry): a 40% gap is inside the spread. "Decide only when
   the gap is wide" is undefined and contradicts "misses target 1 or 2: A alone", so no outcome
   withdraws B. Target 3 cannot fail in six changes at 41% weekly usage; the finish line would be
   adopted never having fired. T-b, T-e and T-f change `git-guard.js`, the gate, the role defaults
   and the four agreement files 0025 has just amended. Resolve: run all six on B and compute A's
   coordinator cost from the same runs (the returns the lead received, priced in the coordinator's
   context), which pairs every change; fix the thresholds and the withdrawal rule in the ADR;
   exercise the finish line once on purpose under a lowered `hold`; pilot on a wave that does not
   edit the hooks, or land 0021 first.
9. **Serious. B rests on platform behaviour nobody has observed.** Items (a) to (e) above. The
   proposal budgets a probe for C and none for its own recommendation. If `rate_limits` do not
   refresh while the coordinator is idle, the finish line never fires during a lead's run, and
   that is the only time it matters. Resolve: one probe run before the ADR's gate section.
10. **Serious. The lead writes the writer's and reviewer's briefs.** "Launch the writer ... with
    the brief" leaves a Sonnet model deriving two briefs from one; briefing is the coordinator's
    named work (`delegation.md`), and the rule against paraphrase covers findings only. The
    lead-brief section is the unwritten half of the design. Resolve: the coordinator writes the
    writer and reviewer briefs as files; the lead's prompts are fixed templates holding paths.
11. **Minor. "Wave" collides** with the wave-close triggers above. Rename the agent and the
    verdict's first word, or define the term in `delegation.md`.
12. **Minor. The wrap-up commit waits for the verdict**, against ADR 0022. An index-lock collision
    is a retryable error. Commit the handoff first, by pathspec; the WIP commit can wait.
13. **Minor. B's exit cost and moving parts are understated.** A promised key is permanent:
    removing `finish` later is an incompatible change, and reverting the code under a sibling that
    set it is the malformed-policy case of objection 1. The line omits four agreement files, the
    hook spec, the harness cases, the status line, ADR 0006's table and three agent definitions.
14. **Minor. The workflow fallback is wrong as written.** Grants do not apply to its payload and it
    fails open without an environment session id (tested), so "no hook change is needed" does not
    hold. Workflow runs now pause at the cap and continue (workflows.md), which softens one of C's
    listed risks on the session meter. Correct in place; C is not recommended either way.
15. **Minor. Small corrections.** The reviewer's Write is needed and the naming rule is real (a
    prefix match on `.md`; state it as such), but Write also lets a reviewer edit the tree: say so
    or confine it. "A nested subagent's reply to its launcher stays gated" is moot where reports
    travel by `SubagentHandback`, which the gate's matcher never sees. The verdict needs the agent
    ids. The lead's prompt should say the verdict is its handback, not its last text.

## Pre-mortem

Ten years on, HOLD means nothing. The exemption for "inside work" was written for one agent and
keyed on a field every subagent carries; each later agent that gained the Agent tool, each harness
feature that runs as a subagent, and every project that copied the lead moved more launches inside,
until the only caller the owner's number still stopped was the coordinator, which had learned to
start a lead at 49. The loop itself lived in a prompt run by whatever `sonnet` resolved to that
year, with no harness case, so each model change shifted its behaviour unseen, and the weekly
band of one point cut agents off exactly as before. Two lines should have caught it: "Caller:
inside work when the payload's `agent_id` is a non-empty string", and the mitigation list "a fixed
loop, a round cap, a verdict that lists every launch, and stop rules", four mitigations, none of
them executable.

## Recommendation

Land step 1 (A's file conventions) now; it needs no ADR and the finding rates it high confidence.
Record B only after: `finish` becomes an additive key that Hatchery opts into (1); the caller rule
is a policy list of agent types (2); the loop's state machine and the lead's launch limits are
code with harness cases (3); the commit precedes the review and the wave directory is durable (6,
7); the one-review text says honestly that a verification pass is added and how it meets ADR 0021's
lanes (4, 5); one probe run has shown `agent_id` at depth 2, the resumed writer's return and the
meter refreshing under an idle coordinator (9); and the pilot is redesigned so that it can fail
(8). With those, B is the right shape: the owner's scoping is sound, and C cannot resume a writer.
Without them it relaxes a spend line for a caller class nobody has bounded. Confidence: high on
objections 1, 3, 6 and 7 (tested or quoted); medium on 2 and 9, which one run could shrink; medium
that the pilot as drafted would have adopted B whatever happened.
