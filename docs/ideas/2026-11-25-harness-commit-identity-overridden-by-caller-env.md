---
date: 2026-11-25
kind: bug
---

# The harness's commit identity is overridden by the caller's GIT_AUTHOR_* and GIT_COMMITTER_*

Anchor: `.claude/hooks/test-hooks.js`, `git()` (the scratch repositories) and `pvGit` (group PV).

The harness commits in its scratch repositories as its own identity (`hooks-test`, given as
`-c user.name=... -c user.email=...`), and the PV cases run against a fixture policy that lists only
that identity. `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME` and `GIT_COMMITTER_EMAIL`
in the caller's environment override `-c user.*`, and both helpers hand git the caller's whole
environment (`git()` passes none of its own; `pvGit` falls back to `process.env`). A caller with
those variables set commits under that identity, and the PV cases see an author the fixture policy
does not list.

Reported by a downstream project, 2026-11-25: with no such variables the harness passed; with a
made-up identity exported through the four variables every failure was a PV case and nothing else
failed; a third caller's environment stopped the harness at its first scratch commit. It matters on
a shared tree, where an agent that exports a dummy identity to get past a git error gets a red
harness and then a refused push.

Asked for: remove the four variables from the environment of every git call the harness makes. One
PV case sets `GIT_COMMITTER_NAME` and `GIT_COMMITTER_EMAIL` on purpose through `envWith`, so the
fix strips the caller's values and still lets a case set its own.

## Open

- Whether `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` go too: nothing reported shows them failing a
  case; they also change what a commit records.
- What stopped the third caller: an empty `GIT_AUTHOR_NAME` gives "empty ident name not allowed",
  which stripping would also cure; the report did not confirm that was the cause.
