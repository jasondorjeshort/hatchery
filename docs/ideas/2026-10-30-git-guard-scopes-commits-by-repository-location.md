---
date: 2026-10-30
kind: chore
related: [2026-10-17-guard-false-positives-in-audits.md, 2026-10-21-git-guard-uses-the-policy-of-the-repo-it-runs-in.md]
---

# The git-guard could scope the commit rule by repository location

`.claude/hooks/git-guard.js`, reading `git.commit.subagents` in `.claude/hooks/policy.json`, denies
`git commit` from every agent but the runner in any repository, a throwaway one under the
scratchpad or the temp directory included, and a commit handed to a shell inside the command line
counts. A downstream project's spike plan needs scratch commits (a one-file repository, a clone to
bundle) and routes them through a Node setup script so the Bash tool never sees the command.
Reviews and hook tests need scratch commits in the same way, and each will invent its own detour.

A policy key that exempts repositories under the scratchpad or the temp directory from the commit
rule, the guard resolving the repository from `-C` or the cwd, would remove the friction without
weakening what the rule protects, which is commits to the project.

## Shape

- A `git.commit.scratchRoots` list in `.claude/hooks/policy.json`: a policy-schema change (ADR 0006).
- The repository resolved from `-C` or the cwd, as `invocations()` already resolves `inv.dir`.
- Rule 4's sentence in `docs/hatchery/decisions/0002-hook-specs.md` states the exemption.
- Harness cases in `.claude/hooks/test-hooks.js`: a commit inside a listed root allowed, the same
  commit outside it denied, `-C` into a listed root from a cwd outside it.

## How it differs from its neighbours

`2026-10-17-guard-false-positives-in-audits.md` keeps `update-ref -d` in a scratch repository denied
in its Question; this idea is about `commit` only. `2026-10-21-git-guard-uses-the-policy-of-the-repo-it-runs-in.md`
asks which policy governs a repository by location; its Open (a repository with no policy file)
overlaps with what a scratch root is.
