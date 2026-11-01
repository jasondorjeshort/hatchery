---
date: 2026-11-01
kind: chore
---

# A missing tool is installed, not worked around

Anchor: `.claude/agreement/delegation.md`, which ends after the paragraph on the coordinator not doing
the delegated work and says nothing about what an agent does when a tool is absent.

A downstream build-phase project filed this from a dated fact. On 2026-10-31 an agent's pre-push run
found the C compiler missing from `PATH`, dropped the race detector, and ran a weaker test command
in place of the documented one; the reference doc had also prescribed a per-command `PATH` prefix. The
compiler was installed all along, only off the user `PATH`. The owner's rule from that day: install
software, or put it on the user `PATH` for good, rather than work around its absence.

The project added this paragraph to its `delegation.md` (widened after review to cover a per-command
`PATH` prefix) and records it as a departure. Proposed text, to append to the Delegation section:

> An agent that meets a missing tool stops and reports it as a gap to install; it never substitutes a
> weaker command for a documented check, and never a per-command `PATH` prefix or other one-off
> workaround for a tool that should be installed or on the user `PATH` for good. The coordinator briefs a runner to install the tool, or to
> put its directory on the user `PATH` for good.

Why it belongs in the base: every decanted project has documented checks and agents that run them, and
the failure (a quietly weaker check that still reports green) is not specific to one toolchain.

## Open

- Whether the rule stays one paragraph in `delegation.md` or is also repeated in the `runner` and
  `pusher` agent definitions, where an agent reads it at the moment it meets the gap.
