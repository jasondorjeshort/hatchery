---
date: 2026-11-22
status: open
area: triage skill / carry-back / idea queue
---

# The brainstorm-and-rest carry-back is not landable as it stands: two objections need a Hatchery decision first

## Question

Should `carry-back/triage-brainstorm-and-rest` at 982e4a57 (base 3917d3d) land as it is? It adds to the
`triage` skill a step 4 (flag a newer entry on a blocked idea), a step 9 (an end-of-triage brainstorm offer
with an admission bar) and a rest prefix (`Waits:` at rest). Reviewed by the critic (Claude Fable 5.2) and
backed out; the owner chose to decide the practice first (idea
`docs/ideas/2026-11-22-adopt-the-brainstorm-offer-and-the-rest-pile.md`, proposal 0026). The earlier branch
`carry-back/triage-brainstorm-step` was declined in a8f011a. Line numbers: skill blob 399b9e51.

## What was tried

- The step 4 loop verbatim (git 2.56.0.windows.4) from Hatchery's root: no output (no file has either
  prefix); read-only in the sibling checkout (head b05686f8, 192 idea files): one line. The regex survives
  MSYS path conversion. `queue-list.js ideas --json` and `--check` over four scratch files.
- `git-guard` denied the critic `git commit` ("... are: runner"), so a runner has since run the nine cases
  below. The one-commit case (`-gt` false, not listed) is reasoning only, not observed.
- The loop lists a file when its last `^(Came up again|Use): ` commit time (`git log -1 --format=%ct -G`)
  is greater than its last `^(Plan|Question|Waits):` one. Expected comes from `git log -G` semantics.

| Case | What it builds | Expected | Observed |
|---|---|---|---|
| A | block commit, then an entry commit | listed | listed |
| B | entry commit, then a block commit | not listed | not listed |
| C | block and entry in one commit (equal times) | not listed | not listed |
| D | block, entry, then block reworked below an unchanged opener | listed | listed |
| E | block, entry, then the opener line rewritten | not listed | not listed |
| F | block, then an entry in a later commit, same second | not listed | not listed |
| G | entries and block in one commit, then one `Use:` line removed | listed | listed |
| I | question, entry, then the owner answers (`Answer: yes.`) | listed | listed |
| README | formats as fenced examples at column 0, then an example edited | listed | listed |

Runner stdout: A, D, G, I and `README.md` listed; exit 0. The exit-1 case was seen only in a replay without git.

## Result

**Verdict: land with fixes, and not pushed alone.** Not as it stands. Objections 1 and 2 cannot be fixed
inside the carry-back without cutting what the owner asked for or deciding the idea file first: the landing
waits, unpushed, for a Hatchery decision on those two, or the branch is declined and its text rides with the
idea. Objections 3 to 6 are small edits at review.

### Blocking

1. **Lines 96, 99-100, 106-108: step 9 cites a table and formats the base cannot deliver.** "The formats and
   the bar's table are those `docs/ideas/README.md` gives." Hatchery's README gives neither, so "the bar's
   step", a required part of the offer's header, and "one step per doubling" have no starting count; an agent
   will invent a bar. Structural: `ownership.json` has `docs/ideas` under `projectOwned`, so updates patch this
   skill into every project and never the README it cites. Fix: a base-owned home for the formats and table
   (a file beside the skill), named at line 96: the sibling's decisions 3 to 7, so **belongs with the idea
   file**. Cutting the lines leaves an offer with no bar, which was not asked for.

2. **Lines 109, 112-114, 128-129: the diff carries a rule its own companion file says it cannot.** The
   sibling's list of what could not be carried names the rest prefix and "the docs rule on Waits"; the skill
   text carries both ("an agent writes one only from the owner's quoted words (step 9)").
   `.claude/rules/docs.md` says "only the owner writes `Waits:`", and the README defines it as a "deferral to
   a trigger it names"; a rest names none. ADR 0013 as amended by 0016 makes that rule file and ADR 0007 the
   record of the idea grammar, the owner's. The prefix lists as `waits`; the meaning and the author change.
   A change to a rule is not a carry-back, and Land step 4 refuses by path, so this would pass as prose.
   Fix **inside the carry-back**: drop "record at rest" from line 109 and the sentence at lines 112-114,
   restore the old first sentence of the Bounds bullet, keep "flag a newer entry on either (step 4)". The
   prefix and wording go **in the idea file**.

3. **Lines 103-105: where an entry is written is not said, and the wrong place flips the block.** The
   sibling's format file says "above the file's block"; the carried text and the README do not. Observed
   (`queue-list.js ideas --json`): an entry above the block lists `"block":"question"`; the same entry below a
   blank `Answer:` lists `"block":"answered"`, and `--check` exits 0 with nothing on stderr. Any non-blank line
   under a blank `Answer:` reads as the answer (0017 section 2), so an unanswered choice of the owner's
   becomes buildable, silently. Fix **inside the carry-back**: line 104 gains "above the block, never below".

### Serious, not blocking

4. **Lines 61-68: the loop lists more, and less, than "committed after their block".** Fix **inside the
   carry-back**.
   - `b` is the last commit that added or removed an opener line, not the last change to the block (`-G`
     matches "added/removed lines", https://git-scm.com/docs/git-log). Observed: a sibling file's `Answer:`
     was written in cdf1a137, yet `b` is 6549db59, where `Question:` first appeared. So an answer after the
     entry does not clear the flag (case I); a reopened Plan edited below its opener is listed at every later
     triage (case D); a flagged `Waits:` is listed while the file lives, since line 128 lets only the owner
     touch it. On a rest pile meant to gather recurrences the list only grows.
   - Seconds, not order: `-gt` on `%ct` prints nothing on a tie. a58866f5 and cdf1a137 touch the same file in
     the same second (1795379392); 7 of the 71 commit times on Hatchery's `docs/ideas` are shared (case F).
   - The glob takes `README.md`: formats as fenced examples at column 0 (the sibling's format file, lines 42,
     58, 68), once edited, list the README. The pickaxe ignores fences, unlike `queue-list.js`: a second
     reader of a grammar ADR 0017 gave one reader. A removed `Use:` line also counts as an entry (case G).
   - The loop exits 1 whenever its last file is not newer (a failure in the Bash tool); it does not say "in
     Bash"; Hatchery's four idea files with dated lines in the README's form (date first) are not read.

5. **Line 117 with lines 10-11: step 9 re-arms the skill that runs it.** Triage is due "when `docs/ideas/`
   has files with no block"; step 9 ends by adding such files. Sibling, 2026-11-22: three brainstorm commits
   (be89dabd 14 files, 73467e3c 11, b05686f8 9), 59 idea files added, 34 untriaged at its head; the first
   offer was accepted nine of nine, only the cap bound. Fix **inside the carry-back**: one offer per session;
   step 9's files alone do not make triage due.

6. **Line 118: a rule for a skill the base does not have.** "A project's wave skill offers the same step ...
   and on a spark" is the agreement line the idea file lists as not carriable. Fix **inside the carry-back**:
   cut it; it goes **in the idea file**.

7. **Lines 93-95: who brainstorms, and on whose meter.** "The coordinator offers ... from the anchors just
   read", but under the delegation rule a subagent reads the anchors and step 10 reports counts, not
   candidates. The sibling chose "no cost guard"; what the owner pays is the owner's to state. Estimated, not
   measured: about 840 more skill tokens per load, three lookups per candidate, up to nine four-way answers.
   Fix **in the idea file**: ask the owner whether the offer runs at HOLD, and say who generates.

8. **Lines 115-116: a "distinct session" is not an independent source.** The same model re-derives the same
   ideas (research below). Fix **in the idea file**: count the owner, a report, a finding, another model.

### Research (fetched 2026-11-22; "summary" marks a source read only through a search summary)

- **Generated ideas repeat and are not self-graded:** "only 200 non-duplicate unique ideas" of 4000; "LLMs
  cannot evaluate ideas reliably yet" https://arxiv.org/html/2409.04109v1 . Less diverse than human groups
  (summary) https://arxiv.org/pdf/2402.01727 ; outputs grow alike (summary)
  https://pmc.ncbi.nlm.nih.gov/articles/PMC11244532 .
- **Recurrence as a signal** holds where returns are independent: Shape Up, "Really important ideas will come
  back to you" https://basecamp.com/shapeup/2.1-chapter-07 . Counts as priority are criticised, mostly by
  vendors (summary) https://www.prodpad.com/blog/feedback-voting-bias-in-product-decisions/ .
- **A rising admission bar: nothing found.** The nearest published bar is fixed, external and has an exit:
  VS Code, 20 up-votes, a bot closes a Backlog Candidates issue after 60 days
  https://github.com/microsoft/vscode/wiki/Issues-Triaging . "One-in/one-out":
  https://buttondown.com/therealadam/archive/mind-and-trim-your-backlogs .
- **Icebox and review:** "a place where stories go to die"
  https://thoughtbot.com/blog/the-icebox-is-where-stories-go-to-die . Stale bots clear a backlog and cost
  contributors https://arxiv.org/abs/2305.18150 . All argue for expiry, which this owner has ruled out.
- **Agent-filed backlogs:** a best-practices post (feed copy; Medium returned 403): "tell it to file beads as
  it goes", cleanup past about 200 issues, rarely beyond 500
  https://drss.io/feed/npub1na2ppcvpx7m7dg4d2rqelpq4xdj9z40cxu3avh4qcdq8dtupdcmqahmfge/Beads-Best-Practices .
  It prunes hard; "never dropped" is the opposite bet. **Nothing found** on a capped end-of-task brainstorm
  offer, a 3/3/3 split, or an owner-accepted idea queue for a coding agent.
- **Provenance:** precedent for code, none found for ideas: the kernel's `Assisted-by:` tag
  https://docs.kernel.org/7.1/_sources/process/coding-assistants.rst.txt . Disclosure lowers ratings of
  identical writing (press summary); here that is wanted
  https://michiganross.umich.edu/news/readers-less-favorable-toward-ai-generated-creative-writing-berg-research-finds .

**Not checked:** an ancestry-based comparison; renames; the token cost of a real offer (no transcript read); sources marked
summary; the kernel page's current text (7.1 was read, the latest lacks the tag); whether the coder's working
copy in Hatchery matches the branch (branch blob only); the one-commit case; the exit-1 case with git.

**The critic's recommendation:** land only with a Hatchery decision on two items: a base-owned home for the formats and the bar's table, and
the `Waits:` authorship rule (`.claude/rules/docs.md`, README); else decline the branch. Do not cut step 9 to a
bar-less offer. Confidence: about 85% on "not as it stands"; about 60% that holding beats declining.

## Next

Proposal 0026 decides the practice; this finding is its evidence.
