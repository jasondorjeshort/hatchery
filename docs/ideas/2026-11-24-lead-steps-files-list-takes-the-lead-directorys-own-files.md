---
date: 2026-11-24
kind: bug
---

# A led writer lists the lead directory's `message.txt` under `Files:` and the change stops

Seen on 2026-11-24 in the first led change of build step 6 of ADR 0025. `steps.md`, which
`.claude/hooks/lead.js` writes at `init`, tells the writer to write `message.txt` into the lead
directory and then to list under `Files:` "a repository-relative path per line, for every file
created, changed or deleted". The writer listed the four repository files and
`.lead/<slug>/message.txt`, which it had also created. `lead.js wait` read that entry as "not one
file this round created, changed or deleted" (the directory is git-ignored), and the change stopped
at `writer output malformed` with the work done and uncommitted. The coordinator removed the line by
hand and resumed; the cost was one more lead launch.

Since then the coordinator's writer briefs say that `Files:` lists repository files only.

The script is one of the lead's own bounds, so the change is relayed by path, never led (ADR 0025,
item 11).

## Open

- Whether `steps.md` says it (the Writer and Fix sections: "never a file of this directory"), or
  the reader drops an entry under the lead directory without stopping, or both.
