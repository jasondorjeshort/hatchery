---
date: 2026-11-24
kind: bug
---

# A writer's `git rm` breaks the lead's commit brief, and the lead waits on a partial commit

Seen on 2026-11-24 in the first led change of build step 6 of ADR 0025. The writer deleted the idea
file its change landed with `git rm`, so the deletion was staged and the path was gone from the tree
and the index. `.claude/hooks/lead.js` wrote `commit-1.md` with one `git add -- <the four paths>`
line; git refuses the whole line when one pathspec matches nothing, so nothing was staged. The
runner went on to the `git commit -F` line anyway, and the commit took what was already staged: the
deletion alone. The three edited files stayed modified.

`lead.js wait` then neither finished nor stopped: `findCommit` wants the change's files clean, so
the commit step never counted as done, and no rule covers "a commit landed and files are still
dirty". The lead polled `wait` for 25 minutes, then tried a `cat`, which its hook denied, and the
change stopped as `refused (Bash: command not allowed)`. The coordinator had a runner amend the
three files into the commit and resumed.

The script is one of the lead's own bounds, so the change is relayed by path, never led (ADR 0025,
item 11).

## Open

- The commit brief: stage in a way a staged deletion survives (a path already staged needs no
  `git add`; or one `git add` per path with the brief saying which may fail), and tell the runner to
  stop when a staging line fails.
- `steps.md` (Writer, Fix): say "stage nothing" beside "do not commit", or leave staging free and
  make the brief cope.
- `wait`: stop with a reason when a commit newer than the permit touches the change's files and
  some of them are still dirty, not wait out the hour.
