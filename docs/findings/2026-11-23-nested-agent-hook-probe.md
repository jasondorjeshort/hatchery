---
date: 2026-11-23
status: open
area: claude-code / subagents, hooks (proposal 0025)
---

# Headless: agent_id at every depth, foreground nested launches, a pin overridden, Agent(type) inert, and a resume that reports to whoever is still running; interactive shakedown: P1, P2, P4 hold, P3 not observed and moot (ADR 0027)

## Question

Proposal 0025 (wave lead) rests on platform behaviour its critic review
(`docs/design/proposals/0025-critic-review.md`, claims table and "Unverified") found only in the
docs: (a) `agent_id` and `agent_type` in hook payloads at depth 1 and 2, absent in the main
session; (b) a lead resuming its writer with SendMessage, context kept, the result reaching the
lead; (c) whether a lead's launches run in the foreground; (d) claim 4, a lead passing `model`
over a subagent's pinned model; (e) claim 5, `Agent(<type>)` in a subagent's `tools:`.

## What was tried

Claude Code 2.1.330 on Windows. Directory `<scratchpad>/hookprobe/`, not a git repository:

- `.claude/settings.json`: PreToolUse (matcher `.*`), PostToolUse (matcher
  `Agent|SendMessage|SubagentHandback|TaskOutput`), SubagentStart and SubagentStop, each running
  `node .claude/hooks/log.js`, which appends one JSON line to `probe.log` (time, event, tool,
  session and agent ids, `agent_type`, top-level keys, from `tool_input` only `subagent_type`,
  `model`, `run_in_background`, `to`, `command`; heads of `tool_response` and
  `last_assistant_message`) and exits 0.
- `.claude/agents/`: `probe-lead` (haiku; Read, Bash, Agent, SendMessage), `probe-writer` (haiku;
  Read, Write, Bash), `probe-pinned` (haiku; Bash). Each with a small `maxTurns`.
- Run: `claude -p "<prompt>" --model haiku --permission-mode dontAsk --allowedTools Agent
  SendMessage Read Write "Bash(echo *)" --max-turns 12 --max-budget-usd 1 --output-format json`.
  The inherited `CLAUDE*` variables were left in place: the child started, took its own session
  id, and nothing needed clearing.
- Run 1 (session `460ccf`): main runs `echo main`, launches the lead and waits. The lead runs
  `echo lead`, launches the writer (told a code word, runs `echo writer-1`, writes one file),
  waits, then SendMessage to the writer's id: run `echo writer-2` and give the code word; waits.
  Then `probe-pinned` with `model: sonnet` (not reached: the lead ended its turn first, so claim 4 rests on run 2).
- Run 2 (session `5e1811`): `probe-lead`'s tools changed to `Read, Bash, Agent(probe-writer),
  SendMessage`. Same writer and SendMessage, but the lead goes straight on to launch
  `probe-pinned` with `model: sonnet`, then `echo lead-check`.
- Also read: `subagents/agent-*.meta.json` and the transcripts under
  `~/.claude/projects/<probe-dir slug>/`.

### Step 4 of ADR 0025: the shakedown

Claude Code 2.1.331, an interactive session on Windows, in this repository. The session started before
the two `lead.js --hook` entries were added to `.claude/settings.json`; they were live in it without a
restart (a `wave-lead` told to run `echo lead-hook-probe` was refused by the lead guard). The led
change: slug `companion-quotes`, writer `tester`, cap 2, landing as `d522185` and `f34c9a4`. Source:
the coordinator's tool results, the lead's untracked state file and the leads' transcripts. Four runs:
1 rejected before any hook (below); 2 launched `writer`, `commit-1`, `review-1` and was stopped with
`TaskStop` about 20 seconds after the `review-1` permit; 3 denied by its own hook (below); 4, after
`resume --now`, `fix-1` by message, `commit-2` (a follow-up: `c9831b3` sat on the first), `review-2`,
verdict push, landed.

## Result

Log lines, trimmed (ids to six characters; `-` is a field absent from the payload):

```
run 1
16:09:43.335 PreToolUse  Bash   agent_id=-       type=-            command="echo main"
16:09:46.301 PreToolUse  Agent  agent_id=-       subagent_type=probe-lead run_in_background=false
16:09:46.451 SubagentStart      agent_id=a49321  type=probe-lead
16:09:47.403 PreToolUse  Bash   agent_id=a49321  type=probe-lead   command="echo lead"
16:09:49.270 PreToolUse  Agent  agent_id=a49321  type=probe-lead   subagent_type=probe-writer run_in_background=false
16:09:49.398 SubagentStart      agent_id=aaf296  type=probe-writer
16:09:50.285 PreToolUse  Bash   agent_id=aaf296  type=probe-writer command="echo writer-1"
16:09:52.225 SubagentStop       agent_id=aaf296  last="done-1"
16:09:52.412 PostToolUse Agent  agent_id=a49321  status=completed
16:09:53.480 PreToolUse  SendMessage agent_id=a49321 to=aaf296...
16:09:53.627 SubagentStart      agent_id=aaf296  type=probe-writer        (same id, resumed)
16:09:53.628 PostToolUse SendMessage agent_id=a49321 {"success":true,"message":"Resuming agent aaf296"}
16:09:56.403 PreToolUse  Bash   agent_id=aaf296  command="echo writer-2"
16:09:57.298 SubagentStop       agent_id=aaf296  last="writer-2 echoed. The code word is TANGERINE-47."
16:09:57.782 SubagentStop       agent_id=a49321  last="The writer's second reply has not arrived yet, so I have stopped ..."
16:09:57.918 PostToolUse Agent  agent_id=-       status=completed
run 2
16:11:18.171 PostToolUse SendMessage agent_id=abd32a "Resuming agent a7414f"
16:11:19.329 PreToolUse  Agent  agent_id=abd32a  subagent_type=probe-pinned model=sonnet run_in_background=false
16:11:19.451 SubagentStart      agent_id=aff30f  type=probe-pinned
16:11:20.858 SubagentStop       agent_id=a7414f  (resumed writer done)
16:11:21.415 SubagentStop       agent_id=aff30f  last="... I'm running as claude-sonnet-5-5."
16:11:21.534 PostToolUse Agent  agent_id=abd32a  status=completed
```

| Item | Result | Evidence |
|---|---|---|
| (a) ids by depth | **observed** | Main: no `agent_id` or `agent_type` key at all (PreToolUse keys: `session_id, transcript_path, cwd, prompt_id, permission_mode, effort, hook_event_name, tool_name, tool_input, tool_use_id`). Depth 1 and depth 2: both keys present, each the calling agent's own. `session_id` and `transcript_path` are the main session's at every depth. A fork and `--agent` not tried |
| (b) resume | **observed: context kept; delivery is not a tool result** | The resumed writer gave the code word from its first prompt (run 1). SendMessage returns at once with `{"success":true,"message":"Resuming agent ..."}`; the writer receives the message as `<agent-message from="<lead id>">`. Its reply is a `<task-notification>` put on the session queue. Run 1: the lead had already ended its turn; the queue entry was taken by the main conversation (`remove`, reason `absorbed_mid_turn`) and the lead never saw it. Run 2: the lead was still working (inside the pinned launch); the lead absorbed it at its next tool boundary. In `-p` the lead does not wait for a resumed agent |
| (c) foreground | **observed (headless only)** | Every Agent call, main's and the lead's, carried `run_in_background: false`; `requestShape: "foreground"` in every meta file; `subagent_stats.requested` foreground 2 and 3, unset 0. The lead's PostToolUse came after the writer's SubagentStop (52.225, then 52.412), and its next call only after that |
| (d) claim 4 | **observed: the call's model wins** | `probe-pinned` (pinned haiku) launched with `model: sonnet`: meta `model: "sonnet"`, `spawnDepth: 2`, `requestShape: "foreground"`, `parentAgentId` the lead; run 2 `modelUsage` bills `claude-sonnet-5-5`. Its meta also reads `pickedEffortModel: "claude-haiku-5-5"` |
| (e) claim 5 | **observed: not refused** | With `Agent(probe-writer)` in the lead's tools, the lead launched `probe-pinned`; no denial, `permission_denials: []`, `refused` all zero |

Other observations:

- No `SubagentHandback` tool call in either run, at any depth. A finished subagent's report reaches
  its launcher inside the Agent tool result, prefixed `[Subagent hand-back]`.
- SubagentStart fires again on a resume, under the same `agent_id`. SubagentStop payload carries
  `agent_transcript_path`, `last_assistant_message`, `background_tasks`, `session_crons`.
- SendMessage's PreToolUse `tool_input` has keys `to, summary, message, type, recipient,
  recipient_kind, content`; its PostToolUse copy has only `to, summary, message`. A hook keying on
  SendMessage should read `to`.
- Agent PostToolUse `tool_response` keys include `agentId`, `agentType`, `resolvedModel`,
  `status`, `canContinueAgent`.
- Cost: run 1 $0.0097 (haiku only); run 2 $0.0226 (haiku $0.0073, sonnet $0.0153).

### Step 4: two defects, mended by path (not led)

- The lead's Agent call lacked `description`, which the tool requires (run 1). Mended in `63e2629`: the
  `wave-lead` definition has the lead pass the step name as `description`. The stop it recorded read as
  a gate refusal (`refused (5h n/a (hold 50), 7d 48% (hold 97))`) though nothing had started.
- A send's tool input carried `type: "message"`, `recipient` (equal to `to`), `recipient_kind: "agent"`
  and `content`, the first 49 characters of the message plus U+2026 (the message had 141 characters).
  The hook required `content` to equal the whole message and denied `not the permitted step (fix-1)`
  (run 3). The headless probe's message was short, where `content` equals `message`. Mended in `c9831b3`:
  `content` passes when it is the message or a non-empty prefix of it followed by U+2026; the ADR's P1
  clause was reworded there. The stop then named the newest deny (`refused (Bash: command not
  allowed)`: a chained Bash call), not the send deny that caused it.

### Step 4: P1 to P4

| P | Result | Evidence |
|---|---|---|
| P1 | **holds, one correction** | Each Agent call that passed the tool's validation reached the hook as a lead's and drew a permit; each step's file appeared. A send's `content` can be a shortened preview (49 characters plus U+2026 in the one long send seen; above). Run 4's lead's send was permitted after the fix |
| P2 | **holds** | All five Agent PostToolUse responses carried a string `agentId`, `status: "async_launched"` and a resolved model (`claude-sonnet-5-5`, `claude-haiku-5-5`, `claude-opus-5-5`); `agentType` was absent (recorded null). The writer's id and session were recorded. Launches are background here; the headless probe saw foreground |
| P3 | **not observed; moot (ADR 0027 withdrew the lead and build step 5)** | The session's usage file had no `five_hour` object in any run: `five` is null in all six permits and the verdict read `5h n/a`. Cause: this session's account has no 5-hour meter (the owner, 2026-11-24); of the seven session usage files then present, the four of this session's account carry `seven_day` and no `five_hour`, the three of another account carry both. `seven_day.used_percentage` went 48 to 49 between `review-1` and `fix-1`. The file's `updatedAt` as read at each permit advanced between permits of one lead run (66 seconds in run 2, 38 in run 4) while the coordinator had ended its turn and made no call: the file refreshes under an idle coordinator |
| P4 | **observed: a child goes on after its lead is stopped or ends, and can be stopped by its id (halves seen 2026-11-24)** | Stopped lead: after `TaskStop` its task read `killed`; the reviewer it had launched went on (transcript 302 to 458 kilobytes in 36 seconds, running under the recorded id in `ListAgents`) and wrote its review file about 2 minutes 20 seconds after its permit; its report and notice went to the coordinator. Lead ended on its own: `ListAgents` showed the lead completed and the reviewer running under the id in `lead.json`; the reviewer's transcript grew after the hand-back. Child stopped by id: `TaskStop` on that id succeeded, `ListAgents` then read it killed, its transcript stopped growing, its test process was gone a minute later, its own report was not delivered (its review file was already written). Side effect: the completed lead showed running again and notified finished a second time, so a lead is woken when its child is stopped, even after it handed back |

### Step 4: other facts for a later session

- An agent launched by one lead can be messaged by a later lead in the same session: run 4's lead
  resumed run 2's writer, which kept its context and wrote its response file (`1-1 fixed`).
- The check's range took in `c9831b3`, the coordinator's own commit made while the change was stopped
  (a deliberate break of the no-tracked-write rule, to mend the hook); the check reviewer left it out.
- Lead cost: run 1 about 21,700 subagent tokens in 17 seconds; run 3 about 21,900 in 17; run 4 about
  27,500 in 140; run 2 was stopped and gave no figure.

## Next

- This finding closes when its platform facts (the Result tables: what a nested agent's hook payloads
  carry, how launches and sends reach hooks, what happens to a child when its launcher ends or is
  stopped) are promoted to a reference entry under `docs/hatchery/reference/`. P3 is moot and P4 is
  seen, so nothing else is open.
- Cut from the earlier Next: interactive launches (settled, P2); whether 0025 can rely on a lead
  waiting for a resumed agent (ADR 0025 item 9: where a resumed writer's reply goes does not matter,
  the loop polls for files); the TaskStop and idle-meter items (seen above).
- Still not run: hooks in Workflow agents (one `-p` run with the Workflow tool allowed and this hook).
