---
date: 2026-11-17
kind: feature
---

# The push scan asks to approve a new commit identity

A tree several people commit to (here, the template every ER workspace pulls from) keeps one shared
list of approved identities, `privacy.identities` in `.claude/hooks/policy.json`, and adds a person once
they are approved (the owner, 2026-11-17). Today a commit whose author or committer email is not listed
is refused by `git-guard` like any personal-data hit, and its message offers `privacy.allow` or the
owner's `~/.claude/privacy-allow.txt`; the second cannot lift an email at all (`scanSetup` in
`.claude/hooks/privacy-scan.js` lets it lift word, host and home hits only). The workspace's rule,
`.claude/project/git.md`, makes the session ask and add by hand.

Want, in the base: when every hit of a push is an author, committer or tagger name and email on no
identity, the guard says so as its own case ("a new commit identity: ask the user to approve
<name> <email>; on yes add it to privacy.identities"), separate from personal data in content, so the
session asks instead of treating it as a leak. A carry-back to Hatchery (`carry-back` skill), since the
guard and the scan are base-owned.

## Related: a warn-only form of the CLAUDE.md caps

The same template imports each person's `me.md` from `CLAUDE.md`, so its loaded length varies by
person. `edit.capExempt` naming `CLAUDE.md` lifts both caps at once (`claudeCapsLifted` in
`.claude/hooks/policy.js`); the owner wanted them kept as a guideline. Want: a policy value that
turns the two `CLAUDE.md` FAILs into warnings the post-edit hook prints and the pusher reports
without refusing.
