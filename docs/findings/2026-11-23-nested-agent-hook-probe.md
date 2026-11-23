---
date: 2026-11-23
status: open
area: claude-code / subagents, hooks (proposal 0025)
---

# Headless: agent_id at every depth, foreground nested launches, a pin overridden, Agent(type) inert, and a resume that reports to whoever is still running

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

## Next

- Interactive behaviour stays unobserved: fork mode is on by default there and the docs say
  launches start in the background and a resumed agent reports to its resumer, who waits. Settle
  with one interactive session in the same directory: same prompts, same log. Headless cannot.
- (b) as built for 0025: in `-p` a lead that resumes its writer must keep working until the
  notification arrives, or the result goes to the main conversation. The architect decides
  whether 0025 can rely on that.
- Out of scope, not run. TaskStop on a lead: headless can, with a lead that starts a background
  writer on a slow step and a main that TaskStops the lead, logging whether the writer's later
  calls fire. Meter refresh under an idle coordinator: not headless; needs an interactive session
  with the status line, logging the usage file once a minute. Hooks in Workflow agents: one `-p`
  run with the Workflow tool allowed and this logging hook, if the Workflow tool is offered there.
