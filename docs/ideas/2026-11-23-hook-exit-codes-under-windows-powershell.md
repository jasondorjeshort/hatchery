---
date: 2026-11-23
kind: question
---

# A hook that blocks by exit code may not block when hooks run under Windows PowerShell

Seen in the review of build step 3 of ADR 0025, on a script ADR 0027 has since withdrawn.
The coder observed that Windows PowerShell 5.1, run with `-Command`, turns a native program's exit
code 2 into 1. Claude Code reads exit 2 from a hook as "block" and exit 1 as a non-blocking error.
Where Git Bash is absent the default shell for hook commands is PowerShell, so a hook that refuses
by exiting 2 would then fail open, for every hook that refuses that way. Whether a hook can tell
which shell ran it was not looked at.

What to find out:

- Which of the base's hooks refuse by exit code and which by printing a `permissionDecision`; the
  second kind is not affected.
- Whether the observation holds for the hook runner itself (a hook command run by Claude Code on a
  machine without Git Bash), not only for a command typed into PowerShell.
- Whether the base should require Git Bash on Windows (`docs/hatchery/reference/claude-code-on-windows.md`
  would say so), have each exit-code hook also print its decision, or check the shell at session start.
