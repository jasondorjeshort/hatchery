---
date: 2026-11-23
kind: bug
---

# A led fix round that changes only the commit message has nothing to commit

Seen while the record of ADR 0025 was corrected from the review of build step 1
(`docs/hatchery/decisions/0025-lead-contract.md`, section 3, rule 4, and section 4, the commit brief).

A reviewer's finding can be about the commit message alone. The writer then answers `<id> fixed`,
rewrites `message.txt` in the lead directory and changes no file of the tree. The commit step that
follows stages nothing:

- in the amend form the commit is rewritten with the new message, which works;
- in the follow-up form (the commit is no longer HEAD, or is pushed) `git commit` fails on an empty
  index, the runner reports the failure, no commit appears and the change stops `no output`, which
  names the wrong cause.

What to settle: whether a message-only fix in the follow-up case is a stop of its own that goes to
the coordinator (a pushed message cannot be amended, so the fix may have to be declined), an
`--allow-empty` follow-up commit that carries the corrected text, or a note in the verdict with no
commit. The lead is not in use before build step 4, so nothing is broken today.
