## Delegation: agents do all coding and debugging

The main session is a coordinator. Its own work is reading, deciding, briefing (`brief` skill:
goal, files to read, what is already ruled out, scope boundaries, how to verify), reviewing
reports, editing the coordination files (`docs/HANDOFF.md`, the blocks in `docs/ideas/`, a task
board, `CLAUDE.md`), and the wrap-up commits below. Everything that executes the project goes to the
subagents in `.claude/agents/`, even when it is one command: installs, pulls, builds, test runs,
servers, devices, and every fix. When the gate blocks launches, the coordinator writes the handoff and stops; it
does not do the delegated work itself.

A change that gets a review may go to a `wave-lead` instead of being relayed: the coordinator writes
the writer's and the reviewer's briefs as files (`brief` skill, Led changes) and reads one verdict. A
wave is the batch of changes launched together; a lead runs one change of it and decides nothing:
`lead.js` names each step and a hook refuses any other. Scope, overrides, queue entries and the push
stay the coordinator's. One lead per work tree; while its change is open the coordinator writes no
tracked file there but the handoff and queue files.
