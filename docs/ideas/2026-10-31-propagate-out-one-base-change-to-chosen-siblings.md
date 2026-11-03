---
date: 2026-10-31
kind: feature
---

# `propagate-out`: one Hatchery commit into chosen siblings, from the Hatchery session

`update-from-hatchery` takes every base change since a sibling's base line, runs in the sibling's
session, and is one sibling at a time. The owner also wants the opposite shape: one small base
commit, pushed from Hatchery, carried into a named set of siblings in one sitting from the Hatchery
session, each sibling read with an independent eye, so that a cosmetic or tooling fix does not wait
for each project's next full base update. The first run was by hand on 2026-10-31: commit `2cf5d21`
(status line shows the session name) into broodforge, dystopia, dystopo, droplet-management and
regenesis, one `coder` per sibling, launched in parallel from this session.

## Decided by the owner (2026-10-31)

- Edits never happen in a sibling's own checkout. The Hatchery session is not working natively
  there, so each sibling gets a side repo: a fresh clone of its `origin` in a scratch directory,
  where the change is applied, tested, committed and pushed; the sibling's checkout is left for its
  own session to fast-forward. This is the default shape, not the in-flight-wave fallback below.
- The owner's local status line runs Hatchery's `.claude/statusline.js` directly from
  `~/.claude/settings.json`, so a Hatchery push updates it with no propagation step; the skill
  checks that the setting still points there and says so.

## Notes from the second run (2026-10-31, `cac01fd`, side clones)

- Five coders, one fresh clone each under one scratch parent, took 3 to 6 minutes per sibling, about
  half the first run: no dirty checkout to work around. Give each agent its own scratch directory:
  two coders wrote test logs to the same file name in the shared parent and one misread a failure.
- A fresh clone fails checks that read local state: O1 skips only when a `hatchery` remote exists,
  and CB1 wants a local `main` where the sibling's branch is `master`. Each coder proved its
  failures predate the change by reverting the patch; the skill adds the `hatchery` remote (no
  fetch) and names each sibling's known-failing ids in its fact sheet.
- One sibling's line was one commit behind, so its take was a full update and its base line moved;
  the others recorded a partial take in the message, following their own precedent.
- A sibling whose `main` only its main session may commit gets its commit from this main session in
  the clone; the others go to one `runner`, with `-c user.name/user.email` where the sibling asks.
- Commit messages went to files in the scratch parent, written by the coordinator (the runner has
  no Write tool, and heredocs with apostrophes fail here).

## Notes from the third run (2026-11-03, `ca1cca4`, six siblings, side clones)

- A shared brief file in the scratchpad plus a per-sibling fact sheet (branch, origin, base line
  and its file, where each touched file lives or "absent", departure rows on them, commit and push
  policy, test command, known fresh-clone skips, in-flight work) was the whole launch; an Explore
  agent wrote the six sheets in 80 seconds while the base change was still in review.
- Review policy that worked: a sibling whose hunks applied clean by 3-way (identical to the
  reviewed base diff) got no second review; a sibling with a hand merge got its own reviewer, and
  two of three found something real (a rule text claiming a pusher gate the project does not have;
  a stale "cap" wording in a project doc). The one-review question above is answered by that line.
- Full update versus partial take sorted itself: three siblings one base commit behind took it as
  `Update from Hatchery <old>..<new>` and moved their line; three older ones recorded a partial
  take in the message, line unchanged. A sibling whose recorded base sha is not in Hatchery at all
  cannot compute the diff; the coder reasoned from the size of the `.claude` diff instead.
- The base's ADR numbers collide with project ADRs from 0020 on
  (`2026-11-03-base-adr-numbers-collide-with-project-adrs.md`).
- A sibling with no `.claude/agents/` has no push gate: base rule text that says "the pusher
  refuses" is false there and the hand merge must say what the tree does. The departure row
  records it.
- A sibling whose `main` only its main session may commit got its commit and push from this main
  session, on the owner's word, after the same checks the pusher runs; everything else went to one
  runner per sibling and a fresh pusher per sibling, six pushes, none behind.
- Two coders reported the git-guard refusing the pusher's `> "$l"` redirect as an unexpanded
  argument; no pusher hit it. Unexplained; each wrote the list file to a literal path instead.

## What the skill has to settle

- The relation to `update-from-hatchery` and the base line. A partial take leaves the sibling's
  recorded base line behind the commit it holds; the next full update must not re-apply or conflict.
  Candidates: record the taken sha in the sibling (a `Hatchery partial:` line next to the base
  line, or the update log), or require the full update's three-way patch to notice an already-applied
  hunk and skip it, and check that it does.
- Path mapping. Siblings keep the spec under `docs/design/decisions/` where Hatchery has
  `docs/hatchery/decisions/`; the ownership map (ADR 0016) says which paths are base-owned; a
  departure row on a touched file turns the take into a merge the owner must see.
- Who commits and pushes in each sibling: that sibling's `policy.json` (`git.commit.subagents`,
  push rules), not Hatchery's. The git guard applies the session project's policy to a
  `git -C <sibling>` command (`2026-10-21-git-guard-uses-the-policy-of-the-repo-it-runs-in.md`),
  so a commit or push into a sibling from the Hatchery session may be refused for the wrong reason.
- One review per sibling (one-review.md) or one review of the propagation as a whole, where the
  five diffs are the same hunks on five trees.
- Which siblings exist: a list the owner keeps, or every directory in `..` with a `Hatchery base:`
  line.

## Notes from the first run (2026-10-31)

Filled in by the coordinator as the agents report; whoever writes the skill starts here.

- Launch: five `coder` briefs, identical apart from the repo path and what was already known to
  differ (branch name, spec path, `settings.json` statusLine command). Each brief said: read the
  sibling's CLAUDE.md, agreement, ownership map, departure table, `policy.json` and its
  `update-from-hatchery` skill first; take this one commit only; record a partial take if the
  sibling's rules say how; stop on a conflict rather than improvise; commit and push nothing.
- The siblings are not alike. One adopted the base by hand and replaced the agreement files with
  pointers at its own CLAUDE.md sections (its provenance ADR says what it took); one has only the
  `update-from-hatchery` skill and no `commit` or `carry-back`; the rest carry the full skill set.
  A brief that says "read its CLAUDE.md and the agreement files it imports" has to allow for a
  sibling that imports none.
- The siblings found a defect in the base commit that Hatchery's own review and a 778-case green
  run had not: the new harness cases reused ids already taken in the same file. Five independent
  readings of one diff on five trees are a review of a kind one-review.md does not count; the skill
  should run the propagation after the base commit is reviewed but hold the base push until the
  first sibling's report, or say that it does not.
- The base line question is real. Two adopted siblings in patch mode record `Hatchery base: <sha>`
  and have no rule for a partial take; both coders left the line alone and relied on the next full
  update's three-way apply treating the already-present hunks as identical changes. Nobody has
  checked that it does; the skill needs a test of that or a recorded `Hatchery partial:` line.
- The recorded base sha of two siblings no longer exists in Hatchery's clone (history was
  rewritten after they adopted; the counterpart commit has the same subject and date). Their
  `hatchery/main` remote refs are stale. The next full update in each has to translate the base
  line first; a propagation skill that reads the base line would hit the same wall.
- Where the spec lands differs per sibling [no-check: sibling paths]: `docs/hatchery/decisions/0002-hook-specs-usage.md`
  in the base; a combined `docs/design/decisions/0002-hook-specs.md` in one sibling; no copy at
  all in another (its adoption record points at the base's spec). The `.claude/` files' `// Spec:`
  comments in both point at paths that do not exist there. A skill maps the spec per sibling or
  states that spec hunks are dropped where the sibling keeps no spec.
- Two siblings commit only with the person's identity given on the command line (`-c user.name`,
  `-c user.email`, `--author`) and confirmed at the prompt; the propagation's commit step has to
  carry that per sibling, not assume the base's `runner` brief.
- One sibling had done a partial take before, by hand, and recorded it only in the commit message
  (no departure row, base line not moved). The coder found the precedent and followed it. That is
  the recording rule the skill can adopt unless the base-line question is settled another way:
  the commit message names the base sha taken and says the base line stays where it is.
- Where a sibling keeps a departure in a file the change touches (one sibling's `test-hooks.js`
  carries a skip block), the hunks applied cleanly this time, but the next full update replays the
  same hunks over a file that already has them and the departure lines; a conflict there is
  resolved by the departure-row rule (keep HEAD). The skill says so.
- A sibling with the usual skill set but no `Test command:` line in CLAUDE.md cost the coder a
  search; the brief should name the test command per sibling or say where to find it.
- A sibling in a build phase may have a wave running: its rule that nobody but its coordinator
  commits to `main` while agents are active, its `protectedBranches` policy denying every subagent
  a commit there, and its merge sequence that can sweep a dirty main checkout into an unrelated
  commit. A propagation into such a sibling leaves three uncommitted files in a tree someone else
  is driving. The skill checks the sibling's handoff for in-flight work first and either hands the
  commit to that sibling's session or applies the change on a branch of its own.
- A sibling whose session is open sees the new status line as soon as the file changes, before
  any commit: the change is live in that session the moment it is written. Harmless here; a skill
  propagating a hook change would not be.
- When the sibling's base line is close behind, the "one commit" is the whole base-owned diff
  since its line, and the take is a full update in all but name: the base line moves and the
  commit is `Update from Hatchery <old>..<new>`. One coder spotted this and rightly held the line
  back only because the base commit was still unpushed and might be amended (it was). The skill
  computes the base-owned diff from the sibling's line first; when it equals the propagated
  commit, it is an update, and the base line moves to the pushed sha.
- The commits went through from the Hatchery session with `git -C <sibling>` under Hatchery's
  own guard policy, one `runner` for all four, each with the sibling's identity rule honoured on
  the command line. One sibling's pre-commit hook ran its formatter (a Gradle task) before the
  commit; a sibling's hooks are part of the cost. One sibling was behind its remote at commit
  time, so its push needs a pull first; the skill's push step checks `status -sb` per sibling.
- Three of four remotes had moved by push time (by 1, 2 and 15 commits), so each push took three
  launches: a pusher that fetched and stopped (check 3), a runner that rebased (the guard routes
  rebase to the commit class), a fresh pusher. The skill fetches and rebases per sibling before
  the push step, in one runner, and launches the pushers once. The rebase card's `backup/push-one`
  ref cannot be removed by an agent (`branch -D` is denied, `-d` refuses an unmerged ref); the
  skill's wrap-up lists the refs for the owner to delete.
- Two siblings have no ADR 0018 privacy scan yet; their pushers fell back to the older secrets
  grep. The skill reports which checks ran per sibling, not "checks passed".
- The in-flight-wave sibling was done last through a fresh clone of its `origin/main` in a temp
  directory: `git diff` of the three files from the dirty checkout, `git apply` in the clone, a
  runner commit there, and, since that sibling's policy lets only its main session push `main`,
  the push from this main session on the owner's word (`tools/push-verified.sh`). Then the dirty
  checkout: each edit checked equal to `origin/main`, restored, `merge --ff-only`, clone removed.
  That is the shape for any sibling whose main checkout cannot take a commit at the time; the
  skill can make it the default, since it never dirties the sibling's checkout at all.
- The same hunks took 7 to 19 minutes per sibling, most of it reading the sibling's rules and
  running its harness (3 or more minutes a run). Five in parallel was the right shape; the reading
  is what a skill with a per-sibling fact sheet (branch, test command, spec path, commit identity
  rule, base line, in-flight work) saves.
