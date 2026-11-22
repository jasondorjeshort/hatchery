# 0026 critic review: the brainstorm offer, entries on existing ideas, and the rest pile

Date: 2026-11-22
Reviewer: critic (Claude Opus 5.5, model override for a process proposal)
Proposal: `0026-brainstorm-offer-and-rest-pile.md`, draft as committed in 2ce5945

Verdict: **D is the right carrier, but not ready to record.** One blocking objection (the grammar
change has no migration although the proposal's own constraints call it incompatible), seven
serious, five minor. Every one can be fixed in text or by one small coder pass; none argues for B.

## What was checked, and how

| Claim | Result | Evidence |
|---|---|---|
| `.claude` base-owned, `docs/ideas` project-owned | holds; note `.claude/project` and `README.md` are project-owned | `.claude/hooks/ownership.json` |
| A new agreement file fails `--claude-check` until imported; 151 of 190 loaded | holds: 151 counted with `lineCount`; FAIL text "section ... neither imported nor replaced" | `policy.js` lines 428, 483-487, 501; `node .claude/hooks/policy.js --claude-check` exits 0 |
| 42 ideas: 13 untriaged, 12 waits, 8 plan, 7 answered, 2 question | holds | `queue-list.js ideas --json`, counted |
| Every `Waits:` last written by 46011d9, 70c6878, fa49e20, agent trailers | holds (5, 6 and 1 files; Fable, Opus, Fable trailers) | the proposal's loop, `git log -1 --format=%(trailers)` |
| No Hatchery file has `Came up again:`, `New:` or `Use:` | holds (grep exit 1) | `grep -lE "^(Came up again|New|Use): " docs/ideas/*.md` |
| The sibling at b05686f8: one `Use:` line, no other entry, no rest line | holds | `git grep` at b05686f8 in the sibling's second checkout (the first lacks the object) |
| Skill description in every listing, body on use | holds, with a caveat the proposal omits: when the listing overflows its budget (1% of context), descriptions are dropped "starting with the skills you invoke least" | https://code.claude.com/docs/en/skills, "Skill descriptions are cut short" |
| The gate stops launches and sends, never the main session's text | holds | `.claude/agreement/usage-gating.md` |
| Land step 4 may change the staged tree; step 7 closes the row on a landing | holds ("Fixes go to the coder's working tree"); but see objection 10 on the message | `carry-back` skill, Land 4, 5, 7 |
| An older `queue-list.js` reads a file ending in `Rests:` as untriaged | holds by code: the opener regex is `^(Plan|Question|Waits):` | `queue-list.js` line 83 |
| `triage/SKILL.md` is 6,630 bytes | holds | `wc -c` |
| The owner's answers and intake figures | owner's words read in the sibling's ADR 0065 Context at b05686f8; intake not rechecked | |

`queue-list.js ideas` over seventeen scratch files (`<scratchpad>/ql`, no commit needed), each
the same frontmatter and title with the lines shown:

| Case | Lines after the body | Reads |
|---|---|---|
| 01 | `Waits: at rest — "not now" (the owner, ...)` | waits |
| 02, 03 | `Came up again:` above a `Plan:`; the same below it | plan, plan |
| 04 | `New:` above `Question:` + blank `Answer:` | question |
| 05, 06 | `New:` / `Use:` below a blank `Answer:` | **answered**, **answered** |
| 07 | `Came up again:` between `Question:` and a blank `Answer:` | question |
| 08, 13 | `Use:` / `New:` below a `Waits:` (rest or trigger) | waits |
| 09 | `New:` only, the Plan removed | untriaged |
| 10 | a `New:` that wraps onto a line starting `Plan:`, no block | **plan** |
| 11 | `Use:` only, after a landing removed the block | untriaged |
| 12 | under a `Plan:`, a `New:` wrapping onto `Question:` | question (fails safe) |
| 14 | under `Waits: at rest`, a `Use:` wrapping onto `Plan:` | **plan** |
| 15, 16 | a fenced `Waits:` under a Plan; a README-form dated line above a Plan | plan, plan |
| 17 | `Use:` below an answered `Answer: yes.` | answered |

`--check --untriaged` exits 0 with nothing on stderr for all of them, the flips included. D's
observability commands run on the same tree plus a README carrying the formats in a fence at
column 0: `grep -l "^Waits: at rest" docs/ideas/*.md` lists 01, 13, **14** and **README.md**, while
`queue-list.js` lists 01, 08, 13 as waits and 14 as plan; `grep -lE "^(New|Use): "` lists README.md
too.

**The unsettled point, whether a build pass reads only the `Plan:`:** the base has no build pass
(no skill or agent text describes one; only `docs/ideas/README.md` line 55 and ADR 0007). Three
pieces of primary evidence say the whole file is read: (1) `docs/ideas/README.md` line 55, "A pass
builds only a `Plan:` or an answered `Question:`": an answered Question carries no brief, so a pass
that builds one must read the body; (2) the sibling's `docs/tasks/wave-44.md`, a task built from a
Plan: "pass one of the Plan of `docs/ideas/2026-11-20-a-panorama-view...` (read its Shape; ...)";
(3) sibling commit c36c7588, where the owner's new words were added to an idea's body and the Plan
was rewritten in the same commit, and the next task quoted those body words. The proposal's
trigger "a build pass reads the idea's body ... no removal is needed" therefore fires. Objection 4
says why its conclusion does not follow.

Not checked: whether `git log --grep "^Ideas: brainstorm offer"` also matches a body line (git is
expected to compile `--grep` with `REG_NEWLINE`); it needs commits, denied to the critic. Script for
a runner: `<scratchpad>/grep-anchor-case.sh` (expected output: two matches).

## Objections

1. **Blocking. The grammar change is incompatible by the proposal's own test, and D names no
   migration.** The Constraints say "A changed meaning or author is an incompatible change"; D
   changes both for `Waits:` (an agent writes it; "at rest" names no trigger) and changes a drain's
   terms (a landed file is kept while `Use:` or `New:` lines remain, where `docs/ideas/README.md`
   says "deletes the file in the commit that lands the work"). ADR 0013, The promise: an
   incompatible change's ADR "says how each sibling repository migrates"; ADR 0016 item 7:
   `docs/ideas/README.md` is "the project's copy, named by a grammar change's migration"; ADR 0013,
   Deferred: a compatibility check of the idea grammar and a migration note format, both triggered
   by "the first incompatible change", the first "which then lands with it". D says "Every other
   project: nothing until it updates; its README pointer is optional". After an update, each
   project's README (never patched) still defines `Waits:` as a "deferral to a trigger it names" and
   still deletes on landing, while `triage` tells the agent to read that README first and the rule
   file says otherwise. Resolve: state that this is the grammar's first incompatible change (or
   argue it is not); name the README edit per project (three sentences); land or re-defer, with a
   reason, the two ADR 0013 Deferred items.

2. **Serious. "The grammar keeps its one reader" does not hold for D's own observability.** The
   pile, the unbuilt list and the recurrence count are three `grep`s that ignore fences and the
   last-opener rule; tested above, the pile grep lists a README and a file `queue-list.js` reads as
   `plan`. This is the same fault the proposal holds against B's loop. Resolve: add the two `--json`
   fields the proposal already sketches (`rest`, and an entry count or `recurrences`) in this pass,
   an addition ADR 0013 calls free, and have the skill's commands read them; at the least, exclude
   `README.md` and say the greps are approximate.

3. **Serious. Entry placement fails silently, in both directions the owner cares about.** Cases 05
   and 06: an entry below a blank `Answer:` makes the owner's open choice buildable. Case 14, which
   the proposal does not list: a wrapped entry under `Waits: at rest` makes the owner's rest a
   buildable `plan`. Case 10 likewise for a file whose Plan was just removed for a `New:`, the very
   state D creates. `--check` exits 0 on all. The guard is a prose sentence in the rule file, and
   entries are written by whichever model is coordinating, wrapping long lines as it goes. Resolve:
   a `post-edit.js` warning (not a promised surface, nothing fails) when a line starting
   `Came up again:`, `New:` or `Use:` follows the block's opener, or when a `Plan:` opener sits after
   one, with harness cases for 05, 10 and 14; or entries are one physical line, stated and checked.

4. **Serious. The build-pass trigger fires, and its conclusion is wrong.** Evidence above: the body
   is read. But reading is not deciding: a pass that finds a Plan and a scope-changing `New:` must
   judge which holds, which is what triage exists to spare it ("never has to judge"). The observed
   practice in c36c7588 is cheaper than D's removal: the writer, who has the context, rewrites the
   Plan in the same commit. D also leaves an answered `Question:` with a scope-changing `New:` above
   it buildable, unjudged. Resolve: replace the trigger; "a `New:` under a `Plan:` rewrites the Plan
   in the same commit when the change is settled, else removes it"; say what a `New:` on an answered
   Question does (lists it in the triage report, or makes the next triage re-read it).

5. **Serious. Two of the reversal triggers cannot fail, and the log cannot measure acceptance.**
   (a) "A triage closes twice with no offer made" tests the after-triage trigger, which `triage` step
   9 wires by name; the description carries only the spark, wave-close, release and on-request
   triggers, and nothing observes those. The listing drops the least-invoked descriptions first
   (docs above), and a skill used once per triage is a candidate. (b) The commit exists only when
   something is accepted, and its subject has no offered count, so "accepted near nine of nine"
   cannot be read from `git log`; an offer answered with silence, or skipped at HOLD, leaves no
   trace. (c) Hatchery's own intake is too small to move (last triage 2026-10-19). Resolve: subject
   `Ideas: brainstorm offer <date>: offered n, recorded n, at rest n, entries n, held back n`, written
   for every offer (an empty commit, or one handoff line, when nothing is accepted); name where the
   prediction is checked (the sibling, by date); test the description with should-trigger prompts
   (the docs' skill-creator description eval) or name the skill from the handoff skill's wrap-up
   step, which is loaded at every stop.

6. **Serious. The rest review as recommended fails the owner's stated condition.** The owner (sibling
   ADR 0065, Context) allowed sparks "so long as we have a good workflow for HANDLING the half-baked
   ideas later". D offers the review on request and at a release. The base has no release (no skill
   or agreement file uses the word but the proposal skill's generic files), and the README's sitting
   "never happened" in the sibling (the idea file). So in the base the review happens only when the
   owner remembers to ask. Resolve: recommend a cadence every project has (every third triage, or
   when the offer header's `resting:` passes a number), keep "on request"; reword Q4 accordingly.

7. **Serious. "Never from HOLD" refuses with no lift and drops paid work.** Who enforces: no hook
   (verified). Who lifts: not stated; neither the override grant (ADR 0006) nor the owner's own
   "give me ideas" is named, so the skill's description lists "when the owner asks" and its bounds
   refuse it. No refusal message exists to say any of this. What it costs: little in tokens (main
   session text, no launch), but the candidates a subagent's triage was paid to list are discarded,
   since nothing carries them past the session. Meanwhile `handoff` step 3 files "later work" as
   ideas at any level, unasked, which is a wider door than the one closed. Resolve: an offer the
   owner asks for in so many words is always made; the override grant lifts the rule as it lifts the
   gate; at HOLD the candidates go to the handoff as one line naming the report; state where
   "later work" ends and a generated idea begins.

8. **Serious. A decision the proposal takes as technical is the owner's.** "The rest: prefix or a
   `Rests:` block" changes the meaning of `Waits:`, a block the owner writes by hand; ADR 0013: "A
   promise on a surface a user touches by hand (the first three rows) is the owner's". Q1 asks only
   who types the line. Resolve: Q1 also asks whether `Waits:` may mean "until I wake it", or a Q5.

9. **Minor. Objection 5 of the finding is moved, not fixed.** One offer per session defers the
   re-arm by one session: each triage ends in an offer whose accepted files are the next triage's
   work (sibling: 59 added, 34 untriaged in a day). It is the owner's choice (no cap), but say so and
   count triage files per session alongside intake.

10. **Minor. The landing message would misstate the change.** Land step 5's template carries the
    branch's subject and body verbatim ("triage reads entries newer than a block, ends with a 3/3/3
    brainstorm ..."); after edits 3 and 4 the loop and the inline step 9 are gone, and the template
    has only `Dropped: <path>` lines. Resolve: the landing body gains one `Changed at review:` line
    naming ADR 0026, and the `carry-back` skill's template allows it.

11. **Minor. The exit cost is boilerplate.** "Lines already in idea files stay inert text" ignores
    that the authorship rule and the landing rule outlive a deleted skill, and that a drain under the
    old rule deletes a file holding unbuilt `Use:` lines. Resolve: the exit names both rules and a
    sweep of `Use:` lines into files.

12. **Minor. Q1's evidence is overstated.** "It is how all twelve were written" does not hold for
    the proposed form: five came in 46011d9 with no attribution at all, six carry "(owner,
    2026-10-19)" without the owner's words, one is fa49e20's. The evidence shows agents type
    `Waits:`; it also shows they did so without the quote the new rule requires. Resolve: say that.

13. **Minor. Option A is dismissed on a reading of the owner.** The owner asked the sibling to make
    brainstorming standard "after a triage or a wave" there; "Applies to Hatchery too" is that
    session's line. Q2 does ask; A's risk line should cite the owner's words, not restate them.

## The strongest case against D, and for the best alternative

Against: D makes the base's first incompatible change to the idea grammar for a practice one
project has run for one day, whose first offer was accepted nine of nine, whose bar has no
published precedent (the finding's research) and never refuses, and whose own predictions come due
2027-01-31 and 2027-02-22. The base's earlier queue rules came from a project's long-running loops
(ADR 0007, Context); this one would reach every project before any outcome is known, and Hatchery
itself, with one triage a month and no releases, will generate almost none of the evidence. The
sibling meanwhile pays one rowed conflict per update.

For the alternative, **D-prime: D with the reader built and the incompatible part made honest.**
Build the `rest` and entry fields in `queue-list.js --json` and the placement warning in
`post-edit.js` now (objections 2 and 3; both additions, one coder pass with harness cases), write
the migration ADR 0013 asks for (objection 1), and record every offer with its offered count
(objection 5). That keeps everything D gains (a base-owned home, no agreement line, no wave skill
assumed, no git archaeology) and removes the three places where D's guarantees are prose a model
must remember. If the owner prefers to wait for the sibling's data, the compatible half of D
(the skill, the Source line, the three entries above the block, owner-typed rest lines) can land
now and the authorship and landing rules after the first prediction; that split costs nothing
D needs later.

## Pre-mortem

It is 2036 and every project's `docs/ideas/` holds thousands of owner-accepted, model-generated
files and entries. The bar never refused, the offers kept being accepted because nine plausible
lines at the end of good work are easy to say yes to, the rest pile was reviewed twice because no
project had releases and nobody asked, and `Waits:` stopped meaning "the owner deferred this to a
named event": agents typed it from paraphrases, wrapped entries flipped a few rests into Plans that
a drain built, and a drain written to the old README deleted files with unbuilt `Use:` lines. Each
step was in the proposal's text as a rule a model had to remember. The line that should have
caught it is the prediction "four weeks after adoption the offers are still accepted near nine of
nine and weekly intake has not fallen": nothing in D records how many lines were offered, so it
could never fire, and the exit line ("stay inert text") had already told everyone retreat was free.

## Mechanisms that refuse or fail closed

| Mechanism | Enforced by | Who lifts, from where, mid-session | Says so? |
|---|---|---|---|
| No offer from HOLD | nobody (skill text) | not stated: neither the override grant nor the owner's request | no message exists |
| One offer per session after a triage | skill text | not stated (does an owner's ask count?) | no |
| Silence is a no | the offer's wording | the owner, by asking again; the candidates are not kept | the header says "no answer is a no" only if Q2 adopts it |
| Nothing written unasked | skill and rule text | the owner, per line, at the offer | yes |
| A subagent never writes `Waits:` | rule file | the owner, by answering the coordinator | yes, in the rule |
| Triage leaves `Waits:` and answered Questions | `triage` Bounds | the owner's answer | yes |
| The bar | guidance, never refuses | n/a | yes |

## The four questions to the owner

Q1 is the right question but incomplete: it asks who types `Waits:` and not whether `Waits:` may
mean a rest without a trigger (objection 8), and its "how all twelve were written" overstates
(objection 12). Q2 is answerable as a yes or no, but bundles five choices and shows "bar step 3" with
no table beside it; show the table or one example line per group. Q3 is the right question with the
wrong frame: the cost of an offer at HOLD is small; what the owner should choose is whether an
offer they ask for is refused, whether the override grant lifts the rule, and whether candidates are
kept or dropped (objection 7). Q4 is the right question, but its recommended option relies on a
release the base does not have; offer "every third triage" as the recommendation (objection 6).
No other decision taken as technical is the owner's, except the prefix's meaning.

## Recommendation

Adopt D-prime: D as written, with the migration of objection 1, the queue-list fields and the
post-edit placement warning built in the same pass, the Plan rewritten rather than removed where the
writer can, offers recorded with their offered count, the rest review tied to triage, and Q1 and Q3
reworded. I agree with the proposal that D beats B (B's loop is a second reader and untested shell)
and C (no rest pile, which the owner made a condition). I am about 75% confident that D-prime is
the right shape, and about 25% that the owner would be better served by landing only the compatible
half now and the authorship and landing rules after the sibling's first prediction comes due.
