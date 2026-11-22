# 0026. The brainstorm offer, entries on existing ideas, and the rest pile

Date: 2026-11-22
Status: draft

## Question

Whether Hatchery adopts a sibling's brainstorm practice, and in which carrier, so that the pending
carry-back of the `triage` skill (dystopo `carry-back/triage-brainstorm-and-rest` at 982e4a57, base
3917d3d) can land with nothing it cites missing. The practice (dystopo ADR 0065, made at the owner's
request on 2026-11-22): after a triage or a wave the coordinator offers the owner at most nine new
ideas, moonshots included; an idea is written only when the owner accepts it; an idea that returns
updates its existing file; a half-baked idea rests. The carry-back was applied here, reviewed by a
critic and backed out; the owner chose to decide the idea first and land after. Inputs:
`docs/ideas/2026-11-22-adopt-the-brainstorm-offer-and-the-rest-pile.md`; the critic's review, the
finding dated 2026-11-22 under `docs/findings/` (two blocking objections, six more; a runner then
ran its scripted cases for the step 4 loop, which came out as predicted). In ten years this should
be a short procedure every project gets whole from the base, each format found by one `grep`, the
grammar read by one reader, the cost paid only when an offer is made.

## Constraints that matter here

- Ownership (ADR 0016, `.claude/hooks/ownership.json`): `.claude` is base-owned and reaches every
  project by update; `docs/ideas` is project-owned and is never patched. Whatever a base skill needs
  in order to run must be base-owned. This is the critic's blocker 1: carried step 9 takes its
  formats and the bar's table from `docs/ideas/README.md`, which holds neither here.
- The idea grammar is a promised surface whose record is ADR 0007 and `.claude/rules/docs.md` (ADR
  0013 as amended by 0016), and a promise on it is the owner's. A changed meaning or author is an
  incompatible change; an addition older readers ignore is free. The rule file says "only the owner
  writes `Waits:`"; the carried text has an agent write one. This is blocker 2.
- The grammar has one reader, `.claude/hooks/queue-list.js` (ADR 0017). It does not change in this pass.
- A change to a rule or a promised surface is not a carry-back (ADR 0019, `carry-back` skill):
  Hatchery writes those itself and names each sibling's migration (ADR 0013).
- The agreement loads every turn in every project, at most 190 lines (151 in Hatchery today); a new
  file under `.claude/agreement/` fails `--claude-check` in a project until its `CLAUDE.md` imports it.
- Only the coordinator can ask the owner; a triage may be run by a subagent; from HOLD there is no
  new work. What the owner sees and answers, and what an offer spends, are the owner's.
- The owner's answers in the sibling's record are inputs here, not re-asked: no hard cap but a bar
  that rises with the queue; offers after a triage, at a wave close or a release, and on a spark;
  nothing written unasked; three near-term, three intermediate, three moonshots; the sanity check
  stays at triage; the source and its model recorded; a returning idea is an update; a pile for
  ideas that are not ready; one primitive never offered as several features. "No cost guard" was
  chosen for that project; the base's default is asked again below.
- The base has no wave skill (proposals 0003 and 0025 are open). Living text names no sibling.
- Debug interface: the practice must be observable from a terminal (counts, the rest pile, offers).

Measured: Hatchery holds 42 idea files (13 untriaged, 12 `Waits:`, 8 `Plan:`, 7 answered, 2 blank).
The sibling added 288 in six weeks, 100 in the last; its first nine-line offer was accepted 9 of 9.

## Options

Each is judged on the same items: the offer, the Source line, entries on existing files, the bar,
the rest pile, the landing rule, the rest review, and what happens to the carry-back.

### A. Decline; the practice stays one project's departure

What it is: one empty `Carry-back declined:` commit; the idea file becomes a `Question:` and the
owner's no deletes it. The sibling keeps its `triage` text and its rule sentence as departure rows.
Constraints: no surface, rule or agreement line changes; nothing can dangle. ADR 0007's maintained
line breaks on record (the `triage` skill and the grammar identical across the repositories): a
drain written against the base reads `Waits: at rest` as an ordinary `Waits:` (harmless) and deletes
a landed file that still holds unbuilt `Use:` lines (they survive only in history).
Cost: none here. In the sibling, a conflict on the rowed paths at every update, resolved by its table.
Risks: the owner asked for the practice as standard; every other project re-derives it by hand or
goes without; the base and one project diverge at the file a drain most needs to match.
Exit cost: none. Adopting later is this proposal again, with more data from the sibling.
Moving parts: none in the base; permanent departure rows in one project.

### B. The sibling's decision as made, with the critic's minimum fixes

What it is: carried steps 4, 9 and 10 and the Bounds land inline in `triage`. A file beside the
skill, `.claude/skills/triage/brainstorm.md`, holds the formats and the bar's table (the sibling's
format file without its names) and step 9 names it. The rule file changes
"writes" to "decides; an agent writes one only from the owner's quoted words". One to three lines
join an existing agreement file as the rule (after a triage, at a wave close or a release, on a
spark). The rest is `Waits: at rest — "<words>" (the owner, <date>)`. The rest review comes every
third wave close. The critic's fixes 3 to 6 are applied as text: entries "above the block", one
offer per session, the wave-skill sentence moved to the agreement line, and the step 4 loop repaired
(ancestry between the two commits instead of `%ct`; `README.md` excluded; `git blame` of the block's
lines instead of `-G` on the opener).
Constraints: blocker 1 met; blocker 2 met if the owner agrees to the wording. A second reader of the
grammar remains (the loop, which ignores the fences `queue-list.js` honours). The agreement grows by
up to three lines in every project. The review's cadence names a wave record the base lacks. "Counts
once per distinct session or source" needs someone to read and judge every entry, because the prefix
is written for echoes too.
Cost: `triage/SKILL.md` grows from 6,630 to about 10,000 bytes on every load, offer or not (the
finding, objection 7); a `git log` or `git blame` per file with an entry at every triage.
Risks: the repaired loop is new shell in skill prose, run under Git Bash in every project and tested
by no harness case. A file whose block is the owner's stays flagged at every later triage until the
owner changes the block, and the rest pile is exactly the files meant to gather entries.
Exit cost: remove the step text, the file and the agreement lines. Entries and `Waits: at rest`
lines left in idea files stay valid text and a valid `Waits:`. The rule's wording is argued back.
Moving parts: a file beside a skill; a git loop; agreement lines; three line formats, one with an
inline marker; a table; a cadence that needs a counter.

### C. The offer alone

What it is: step 9 is the offer and nothing else. After a triage the coordinator offers at most nine
lines in three groups; an accepted idea is a new file whose first body line is the Source line
(format inline in the step); a match with an existing idea is the dated line the README already
describes. No bar, no `Came up again:`, no `Use:`, no rest, no review, no rule change.
Constraints: both blockers vanish (nothing is cited outside the skill; no `Waits:` is written). No
surface changes; nothing to migrate.
Cost: the least text, under a kilobyte in `triage`. Every accepted moonshot or half-baked idea is an
untriaged file: a triage read of its anchor, a block and a commit each, and usually a `Question:`
that asks the owner a second time about something they accepted minutes before.
Risks: nothing presses on intake, and the measured intake above is what an unpressed offer does. The
owner asked for a bar that rises and for a place where half-baked ideas rest; C delivers neither, so
it is a real option only if the owner withdraws those two answers. Returning ideas are not counted,
so "the important ones come back" has nothing to read.
Exit cost: delete one step. Growing into D later is additive; nothing C writes is in D's way.
Moving parts: one step, one line format.

### D. A `brainstorm` skill of its own; entries read by prefix; no archaeology

What it is: the practice whole, in a different carrier. A new base-owned skill,
`.claude/skills/brainstorm/SKILL.md`, is the one home of the offer, the cheap check, the formats,
the bar's table and the rest review. Its description carries the triggers (after
a triage, at a wave close or a release, when work sparks an idea, when the owner asks for ideas or
for the resting ones), which is how a procedure is found (`where-things-live.md`); no agreement line
is added, and a project's wave skill names the skill. `triage` step 9 shrinks to a pointer and the
hand-over of candidates. Entries are three prefixes, each starting a line above the block, each with
one meaning:

- `Came up again: <date>, <source> (<model>), <context>.` Written only for an independent source
  (the owner, a report, a finding, a model that no Source line or entry on the file names), so
  `grep -c "^Came up again:"` is the count and nobody judges entries afterwards.
- `New: <date>, <source> (<model>): <angle, scope, anchor or constraint>.` Changes what the idea
  asks. On a file ending in `Plan:` the same commit removes the Plan, so the file lists as untriaged
  and the next triage rewrites the block with the entry in view.
- `Use: <date>, <source> (<model>): <the use>.` One more use of the primitive the file names.

The step 4 loop is not landed: "needs triage again" is the state `queue-list.js` already prints. The
rest is the same `Waits: at rest` prefix. The authorship rule, the placement rule and the landing
rule go in `.claude/rules/docs.md`, the grammar's record, which loads whenever an idea file is
edited. The rest review is offered on request and at a release, the offer's header printing
`resting: N` as the reminder; a project with waves sets a cadence in its own wave skill.
Constraints: blocker 1 met and generalised (a base skill cites no project-owned file for a format it
needs); blocker 2 put to the owner with the evidence below; one reader; the agreement untouched; no
wave skill assumed; `queue-list.js` unchanged. Observable by `node .claude/hooks/queue-list.js ideas
--json` (the open count), `grep -l "^Waits: at rest" docs/ideas/*.md` (the pile), `grep -lE "^(New|Use): "
docs/ideas/*.md` (unbuilt additions) and `git log --grep "^Ideas: brainstorm offer"` (every offer,
with its counts in the subject).
Cost: one description sentence in every session's skill listing in every project; the skill body,
about the size of the sibling's step 9 and format file together, loads only when an offer is made;
`triage` grows by about 600 bytes. Up to three searches per candidate on the coordinator's model.
Risks: a Plan removed for a `New:` costs a triage re-read even where the old Plan would have stood
(the removed block is in the last commit's diff). The formats differ from the sibling's in two
places (`New:` starts a line; `Came up again:` only when it counts), so its ADR is superseded in
part when it updates; at b05686f8 it holds one `Use:` line and no other entry or rest line, so no
file migrates. A description that does not trigger on a spark leaves that one trigger dead.
Exit cost: delete the skill directory, step 9's pointer and the rule file's added sentences. Lines
already in idea files stay inert text; `Waits: at rest` stays a valid `Waits:`.
Moving parts: one skill; three prefixes; one table; about five lines in the rule file.

## Recommendation

D. It is the only option in which every format a base skill uses arrives with the base, the grammar
keeps its one reader, a project without waves gets the whole practice, and all of the owner's
recorded answers hold. It changes carriers and mechanics, none of those answers. B holds the answers
too, at the price of a second reader: the loop as carried listed an answered `Question:`, a removed
`Use:` line and `README.md` and missed a same-second entry in the runner's cases, and its repair is
untested shell. What the owner sees and answers, who writes `Waits:`, and what an offer spends at
HOLD wait for the owner (questions below); the rest is the coordinator's once the critic is answered.

### Position on each item

| Item | Position | Whose |
|---|---|---|
| Blocker 1: the home of the formats and the bar | The `brainstorm` skill. The idea's first Open question is answered by it. | technical |
| Blocker 2: who writes `Waits:` | "Only the owner decides a `Waits:` or that an idea is not wanted; the session the owner answered writes the line, or deletes the file, from the owner's words, quoted with `(the owner, <date>)` (in the commit message for a deletion); never a subagent, never by default." All twelve `Waits:` lines in Hatchery arrived in agent-made commits, six under the subject "the owner's answers of 2026-10-19", so the present wording does not describe the practice. | owner, Q1 |
| Objection 3: where an entry goes | Accepted. Above the block, never below; no entry line starts with a block word. In the rule file and the skill. | technical |
| Objection 4: the step 4 loop | Accepted by removal. A pure recurrence and a `Use:` leave the block alone (a `Use:` outlives the landing); a `New:` under a `Plan:` removes the Plan at writing. An entry on a `Question:` or a `Waits:` is read by whoever next acts on that block, and the owner accepted it at the offer. | technical |
| Objection 5: step 9 re-arms triage | Accepted. One offer per session after a triage; the files it records do not make triage due in that session. | technical |
| Objection 6: a rule for a wave skill | Accepted. The sentence is cut; the triggers live in the skill's description. | technical |
| Objection 7: who generates, on whose meter | The coordinator, from what is already in its context. A subagent that ran the triage reports up to nine candidates, one line and an anchor each. No agent is launched to brainstorm. Not offered from HOLD on either meter. | owner, Q3 |
| Objection 8: independent sources | Accepted, and made mechanical: the prefix is written only for an independent source; an echo with a new angle is a `New:` line and does not count. | technical |
| The agreement line | None. Add one pointer line to `where-things-live.md` only if the trigger under "What would change" fires. | technical |
| The Source line | As the sibling's: the first body line after the title; source, generating model and recorder, the public trigger, "offered and accepted by the owner; not sanity-checked", `Moonshot.` when one. No frontmatter key. | technical |
| `Use:` lines | Adopted, in the format above. | technical |
| The bar | The sibling's table unchanged, in the skill; guidance that never refuses. The open count is the row count of `queue-list.js ideas --json`, resting included. Steps one to three are what the cheap check verifies; four to six are stated judgement. | technical |
| The rest: prefix or a `Rests:` block | The prefix. `Rests:` is rejected for now: an older `queue-list.js` lists such a file as untriaged and an un-updated triage would write a block under it. If a reader must tell rests apart, an added `--json` field is the cheaper lift. | technical |
| The landing rule | In the rule file: a pass removes the `New:` and `Use:` lines it built and the block; the file is deleted only when none remain, and otherwise lists as untriaged. | technical |
| The rest review | On request and at a release; resting files only, sorted by count, one line each; the owner says keep, wake (the `Waits:` line is removed) or delete. Answers the second Open question. | owner, Q4 |
| `queue-list.js --recurring` | Not built now. When wanted: two `--json` fields, `recurrences` and `rest`, an addition under ADR 0013 that needs no proposal. A sorting flag adds nothing a field does not. | technical |

Scope of "nothing is written unasked": ideas a session generates. A defect seen in work, a scan hit
(`triage` step 1), a review follow-up and the handoff's later work are filed as today.

### What the owner sees (Q2)

```
Ideas: 42 open, 3 resting (at the session's start); bar step 3: not one use of a named primitive.
3 near-term, 2 intermediate, 3 moonshots; 1 entry on an existing file; held back: 4, ask to see them.
```

Then at most nine numbered lines in the three groups, one or two lines each, naming the anchor. The
owner answers by number: record, record at rest, fold into a named file, or no; no answer is a no.
A spark is one such line, offered when the work it came up in reaches a stop. Everything accepted
goes in one commit, subject `Ideas: brainstorm offer <date>: <n> recorded, <n> at rest, <n> entries`.

### Edits the carried text needs before it lands (lines of the carried blob 399b9e51)

1. Line 3, the description: the added sentence becomes "Ends with the brainstorm offer (the
   `brainstorm` skill)."
2. Lines 10 to 11: after "files with no block" add "(files this session's brainstorm offer recorded
   do not make it due)".
3. Lines 60 to 73: the addition to step 4, loop and paragraph, is removed; step 4 reads as at 3917d3d.
4. Lines 93 to 118, step 9, become: "The brainstorm offer (`brainstorm` skill), once the blocks are
   committed and below HOLD: at most one per session. Whoever ran steps 4 to 8 lists up to nine
   candidates the reading suggested, one line and an anchor each; a subagent puts them in its
   report, since only the coordinator can ask the owner. Nothing is written unasked."
5. Lines 119 to 121, step 10: "which step 4 reopened or flagged," is removed; the brainstorm counts
   stay; "and the candidates, when a subagent ran the triage" is added.
6. Lines 125 to 127: "in step 9" becomes "through the `brainstorm` skill".
7. Lines 128 to 130 become: "A `Waits:` and a `Question:` with an `Answer:` are the owner's; triage
   rewrites neither. Who may write one: `.claude/rules/docs.md`, Queues."

These are applied at Land step 4 (the review), which the `carry-back` skill allows; the landing
message says so and names ADR 0026. Landing, not declining, is what closes the sibling's row at its
next update with nothing relayed by hand (Land step 7).

### Files Hatchery changes itself (one commit, before the landing, pushed with it)

- `.claude/skills/brainstorm/SKILL.md`, new: When; the offer and its header;
  the cheap check (the anchor exists, the tree lacks it, a matching idea is searched for, one
  primitive is not split); the formats (Source line, the three entries, the rest line); the bar's
  table; recording; the rest review with its two `grep` commands; bounds (never from HOLD, one per
  session after a triage, nothing unasked, no subagent launched for it).
- `.claude/rules/docs.md`, Queues: `Waits:` is "the owner's deferral, to a trigger it names or, as
  `Waits: at rest`, until the owner wakes it"; the authorship sentence of blocker 2; one bullet for
  the entries (above the block; a `New:` under a `Plan:` removes it) and the landing rule.
- `.claude/skills/handoff/SKILL.md`, step 3: "only the owner adds a `Waits:` block" follows the rule.
- `docs/ideas/README.md` (Hatchery's own copy, the one a decant starts from): the `Waits:` bullet as
  the rule file has it; a pointer to the skill for offered ideas and entries; the landing sentence
  under "What drains it"; after "no agent runs that sitting", the coordinator prints the resting
  ideas for it on request.
- `README.md`: the skill list gains `brainstorm`.
- The landing commit deletes the idea file. Nothing changes under `.claude/agreement/` or in any hook.

Siblings, each in its own session. dystopo, at its next update: takes the skill, the rule file and
`triage`; its departure rows for those paths close; its wave skill's close step names the skill and
keeps its own cadence; a short ADR of its own supersedes its 0065 in part (the `New:` line, the
counting rule, no step 4 loop) and its format file becomes a pointer. Every other project: nothing
until it updates; its README pointer is optional, since the skill and the rule file carry every format.

### Questions for the owner

- Q1. May the session you answered type a `Waits:` line, or delete an idea you said you do not want,
  from your words, quoted with the date? Recommended yes; it is how all twelve were written. On a
  no, "record at rest" records the idea and leaves the `Waits:` line for you to type.
- Q2. Is the offer as shown above (the header, `resting: N`, the four answers, silence as a no, a
  spark as one line at a stop) what you want to see in every project?
- Q3. At HOLD: no offer on either meter (recommended), or offered anyway and recorded in the
  wrap-up commit? In the sibling you chose no cost guard.
- Q4. The rest review on request and at a release, the header as its reminder (recommended for a
  base without waves), or a fixed cadence such as every third triage?

## What would change this recommendation

- The owner answers no to Q1: "record at rest" only records and the owner types the line; D stands.
- A triage closes twice with no offer made and none skipped for HOLD: the description is not
  triggering; add the pointer line to `where-things-live.md`.
- More than a third of the Plans removed for a `New:` come back unchanged: stop removing and take
  B's flag in the triage report instead, with the repaired loop as a script under the harness.
- The critic shows a build pass reads the idea's body and not only the `Plan:`: no removal is needed.
- Four weeks after adoption the offers are still accepted near nine of nine and weekly intake has
  not fallen: the bar does nothing; go back to the owner with a cap or with C.
- A base wave skill lands (proposals 0003, 0025): it names the skill at close and may carry a cadence.
- A reader has to separate resting from waiting ideas: add the `rest` field, and consider `Rests:`
  only if a field cannot do it.

## Claims to verify

- `.claude` is base-owned and `docs/ideas` project-owned: `.claude/hooks/ownership.json`.
- A new file under `.claude/agreement/` fails a project's check until imported, and Hatchery loads
  151 of 190 lines: `claudeCheck` in `.claude/hooks/policy.js` (`sections`, `CLAUDE_LOADED_CAP`).
- Every `Waits:` line in Hatchery was last written by a commit with an agent trailer: `for f in
  $(grep -lE "^Waits:" docs/ideas/*.md); do git log -1 --format="%h %s" -G"^Waits:" -- "$f"; done`
  names 46011d9, 70c6878 and fa49e20. A trailer names the model behind the commit, not who decided.
- `queue-list.js` reads `Waits: at rest — "..."` as `waits`; an entry above the opener leaves `block`
  unchanged; one below a blank `Answer:` reads `answered`; a file whose `Plan:` is removed reads
  `untriaged`; a wrapped entry line starting `Plan:` in a file with no block reads `plan`:
  `docs/hatchery/decisions/0017-queue-list.md` section 2, and the finding, objection 3.
- An older `queue-list.js` reads a file ending in `Rests:` as `untriaged`: the same section.
- No Hatchery idea file has a line starting `Came up again:`, `New:` or `Use:` today, and the
  sibling at b05686f8 has one `Use:` line and no other entry or rest line: `grep -lE` in each tree.
- The step 4 loop's observed cases: the finding, objection 4, and the runner's report of them.
- A skill's description is loaded into every session's listing and its body only on use:
  https://code.claude.com/docs/en/skills. The cost figures for D are estimates, not measurements.
- The gate stops launches and sends, never the main session's own text, so "no offer at HOLD" is a
  rule the skill states and no hook enforces: `.claude/agreement/usage-gating.md`.
- Land step 4 may change the staged tree and Land step 7 closes the row on a landing: the
  `carry-back` skill.
- The owner's answers and the intake figures: dystopo ADR 0065, Context; not rechecked here.

## Critic's objections and responses

(none yet)
