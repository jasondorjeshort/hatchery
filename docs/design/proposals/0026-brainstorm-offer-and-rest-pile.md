# 0026. The brainstorm offer, entries on existing ideas, and the rest pile

Date: 2026-11-22
Status: promoted to ADR 0026

Revised 2026-11-22 after the critic's review (`0026-critic-review.md`: one blocking, seven serious,
five minor; D the right carrier, not ready to record) and the owner's answers to the four questions
of the draft; revised again the same day on the owner's answers to Q5 and Q6 and on the owner's
choice of where an unanswered line lives (an idea file ending in a `Question:`, which replaces the
commit-body store of the first revision). All under Recommendation. Recorded as
`../../hatchery/decisions/0026-brainstorm-offer-and-rest-pile.md`, contract in its sibling file.

## Question

Whether Hatchery adopts a sibling's brainstorm practice, and in which carrier, so that the pending
carry-back of the `triage` skill (dystopo `carry-back/triage-brainstorm-and-rest` at 982e4a57, base
3917d3d) can land with nothing it cites missing. The practice (dystopo ADR 0065, made at the owner's
request on 2026-11-22): after a triage or a wave the coordinator offers the owner at most nine new
ideas, moonshots included; an idea is written only when the owner accepts it; an idea that returns
updates its existing file; a half-baked idea rests. The carry-back was applied here, reviewed by a
critic and backed out; the owner chose to decide the idea first and land after. Inputs:
`docs/ideas/2026-11-22-adopt-the-brainstorm-offer-and-the-rest-pile.md`; the critic's review of the
carry-back, the finding dated 2026-11-22 under `docs/findings/` (two blocking objections, six more;
a runner then ran its scripted cases for the step 4 loop, which came out as predicted). In ten years
this should be a short procedure every project gets whole from the base, the grammar read by one
reader, every state it relies on printed by that reader, the cost paid only when an offer is made.

## Constraints that matter here

- Ownership (ADR 0016, `.claude/hooks/ownership.json`): `.claude` is base-owned and reaches every
  project by update; `docs/ideas` is project-owned and is never patched. Whatever a base skill needs
  in order to run must be base-owned. This is blocker 1 of the finding: carried step 9 takes its
  formats and the bar's table from `docs/ideas/README.md`, which holds neither here.
- The idea grammar is a promised surface whose record is ADR 0007 and `.claude/rules/docs.md` (ADR
  0013 as amended by 0016), and a promise on it is the owner's. A changed meaning or author is an
  incompatible change, whose ADR says how each sibling migrates; an addition older readers ignore
  is free. The rule file says "only the owner writes `Waits:`"; the carried text has an agent write
  one. This is blocker 2.
- The grammar has one reader, `.claude/hooks/queue-list.js` (ADR 0017). Nothing in it changed while
  this proposal was written; what a coder adds to it after the ADR is stated below.
- A change to a rule or a promised surface is not a carry-back (ADR 0019, `carry-back` skill):
  Hatchery writes those itself.
- The agreement loads every turn in every project, at most 190 lines (151 in Hatchery today); a new
  file under `.claude/agreement/` fails `--claude-check` in a project until its `CLAUDE.md` imports it.
- Only the coordinator can ask the owner; a triage may be run by a subagent. What the owner sees
  and answers, and what an offer spends, are the owner's.
- The owner's answers in the sibling's record are inputs here: no hard cap but a bar that rises
  with the queue; offers after a triage, at a wave close or a release, and on a spark; nothing
  written unasked; three near-term, three intermediate, three moonshots; the sanity check stays at
  triage; the source and its model recorded; a returning idea is an update; a pile for ideas that
  are not ready, allowed "so long as we have a good workflow for HANDLING the half-baked ideas
  later"; one primitive never offered as several features.
- The base has no wave skill (proposals 0003 and 0025 are open) and no release step. Living text
  names no sibling.
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
Risks: every other project re-derives the practice by hand or goes without; the base and one project
diverge at the file a drain most needs to match. Whether the owner wants it in the base was not
established by the sibling's record ("Applies to Hatchery too" is that session's line); it was asked
here as Q2, "what you want to see in every project", and answered yes. A is closed by that answer.
Exit cost: none. Adopting later is this proposal again, with more data from the sibling.
Moving parts: none in the base; permanent departure rows in one project.

### B. The sibling's decision as made, with the critic's minimum fixes

What it is: carried steps 4, 9 and 10 and the Bounds land inline in `triage`. A file beside the
skill, `.claude/skills/triage/brainstorm.md`, holds the formats and the bar's table (the sibling's
format file without its names) and step 9 names it. The rule file changes
"writes" to "decides; an agent writes one only from the owner's quoted words". One to three lines
join an existing agreement file as the rule (after a triage, at a wave close or a release, on a
spark). The rest is `Waits: at rest — "<words>" (the owner, <date>)`. The rest review comes every
third wave close. The finding's fixes 3 to 6 are applied as text: entries "above the block", one
offer per session, the wave-skill sentence moved to the agreement line, and the step 4 loop repaired
(ancestry between the two commits instead of `%ct`; `README.md` excluded; `git blame` of the block's
lines instead of `-G` on the opener).
Constraints: blocker 1 met; blocker 2 met by the owner's answer to Q1. A second reader of the
grammar remains (the loop, which ignores the fences `queue-list.js` honours). The agreement grows by
up to three lines in every project. The review's cadence names a wave record the base lacks. "Counts
once per distinct session or source" needs someone to read and judge every entry, because the prefix
is written for echoes too. The same migration as D (the authorship and the landing rule change).
Cost: `triage/SKILL.md` grows from 6,630 to about 10,000 bytes on every load, offer or not (the
finding, objection 7); a `git log` or `git blame` per file with an entry at every triage.
Risks: the repaired loop is new shell in skill prose, run under Git Bash in every project and tested
by no harness case. A file whose block is the owner's stays flagged at every later triage until the
owner changes the block, and the rest pile is exactly the files meant to gather entries.
Exit cost: remove the step text, the file and the agreement lines; the rule changes are argued back
as in D. Entries and `Waits: at rest` lines left in idea files stay valid text and a valid `Waits:`.
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
owner asked for a bar that rises and made a place for half-baked ideas the condition for offering on
a spark; C delivers neither. Returning ideas are not counted, so "the important ones come back" has
nothing to read.
Exit cost: delete one step. Growing into D later is additive; nothing C writes is in D's way.
Moving parts: one step, one line format.

### D. A `brainstorm` skill of its own; every state read by the one reader; no archaeology

As revised after the review (the critic's "D-prime"): the draft's D, with the reader's additions
built in the same pass, the migration written, every offer recorded, and the Plan kept honest by a
state the reader prints instead of by removal.

What it is: the practice whole, in a different carrier. A new base-owned skill,
`.claude/skills/brainstorm/SKILL.md`, is the one home of the offer, the cheap check, the formats,
the bar's table and the rest review. `triage` step 9 and the `handoff` skill's wrap-up name it, so
those triggers do not depend on its description; the description carries the rest (when work sparks
an idea, when the owner asks for ideas or for the resting ones, a project's wave close or release).
No agreement line is added. Entries are three prefixes, each one physical line above the block:

- `Came up again: <date>, <source> (<model id>), <context>.` Written only for an independent source
  (the owner, a report, a finding, a model that no Source line or entry on the file names), so the
  count needs nobody to judge entries afterwards.
- `New: <date>, <source> (<model id>): <angle, scope, anchor or constraint>.` Scope no block has
  taken in. A file with one is not ready to build, whatever its block; the block that takes it in
  (written by triage, or by the entry's writer when the change is settled) removes the line.
- `Use: <date>, <source> (<model id>): <the use>.` One more use of the primitive the file names;
  it outlives the landing of a Plan that did not take it in.

The step 4 loop is not landed. `queue-list.js ideas --json` gains five fields per row, `rest`,
`offered`, `recurrences`, `news` and `uses`, and the same reading reports misplaced entries as
warnings, so "resting", "offered and waiting for an answer", "came back", "not ready" and "still
holds a use" are states the one reader prints. The rest is the `Waits: at rest` prefix. A line the
owner leaves unanswered is written as an idea file ending in `Question: offered ...` with a blank
`Answer:`. The authorship rule, the placement rule, the readiness rule and the landing rule go in
`.claude/rules/docs.md`, the grammar's record, which loads whenever an idea file is edited. Every
offer leaves one record line in a commit. The rest review is prompted at most once in seven days
and always given on request.
Constraints: blocker 1 met and generalised (a base skill cites no project-owned file for a format it
needs); blocker 2 answered by the owner; one reader, with no `grep` over idea files in any skill; the
agreement untouched; no wave skill and no release assumed. The idea grammar changes incompatibly in
three places (who writes `Waits:`, what `Waits:` may mean, when a pass builds and deletes), so the
migration below is part of the decision. Observable by `node .claude/hooks/queue-list.js ideas
--json` (the open count and the five fields) and `git log --grep "^Ideas: brainstorm offer 20"
--format=%B` (every offer's record).
Cost: one description sentence in every session's skill listing in every project; the skill body,
about the size of the sibling's step 9 and format file together, loads only when an offer is made;
`triage` grows by about 700 bytes; one coder pass on two hooks with five harness cases. Up to three
searches per candidate on the coordinator's model. One README edit per project.
Risks: the practice has run for one day in one project and its bar has no published precedent, so
the base takes it before any outcome is known (the critic's strongest case; the owner chose to adopt
now, and the predictions are checked in the sibling's log, where the volume is). A skill's
description is dropped from an overfull listing, least-invoked first, which leaves the spark as the
one trigger nothing wires. Silence now writes: an offer left wholly unanswered adds up to nine
files to the open queue, each a `Question:` the owner has yet to read (the cost the owner accepted
in choosing that store; it also raises the bar, so an unanswered queue gets fewer and stronger
offers). The formats differ from the sibling's (`New:` is a line of its own; `Came up again:` only when it
counts; one physical line), so its ADR is superseded in part and its one `Use:` line is rejoined.
Exit cost: delete the skill directory, step 9's pointer and the `handoff` line. That is not the
whole of it: the authorship, readiness and landing rules outlive the skill, and reverting them is a
second incompatible change with a README edit per project. Before the old delete-on-landing rule
returns, every `Use:` and `New:` line is swept into a file or a block of its own, or a drain deletes
it with the file. The five fields stay (removing a promised field is incompatible) and read zero
or false. `Waits: at rest` stays a valid `Waits:`; an offer `Question:` stays a valid `Question:`.
Moving parts: one skill; three prefixes; two block prefixes the reader names (`Waits: at rest`,
`Question: offered`); one table; about ten lines in the rule file; five fields and two warnings in
the reader; one record line per offer and per review.

## Recommendation

D as revised. It is the only option in which every format a base skill uses arrives with the base,
the grammar keeps its one reader, a project without waves or releases gets the whole practice, and
all of the owner's answers hold. B holds the answers too, at the price of a second reader: the loop
as carried listed an answered `Question:`, a removed `Use:` line and `README.md` and missed a
same-second entry in the runner's cases, and its repair is untested shell. The critic's fallback
(land the compatible half now, the authorship and landing rules after the sibling's first
prediction) is not taken: the owner's answers to Q1 and Q3 choose the whole practice now.

### The owner's answers (2026-11-22, through the coordinator)

- Q1, may the session the owner answered type a `Waits:` line or delete an unwanted idea from the
  owner's words: "Yes, from my quoted words". The session the owner answered writes the `Waits:`
  line or deletes the idea, quoting the words and the date; never a subagent, never by default.
- Q2, is the offer as shown what the owner wants to see in every project: "Yes, but silence is not a
  no". The shape as shown, except: "An unanswered line is carried to the next offer (counted in
  "held back") instead of being dropped."
- Q3, the offer at HOLD: "Offer anyway". The offer is made at HOLD too and what is accepted is
  recorded in the wrap-up commit.
- Q4, the rest review's cadence: "On request and at a release, but no more than every week?" Read
  as: a prompted review at most once in seven days; the owner's own request always honoured.
- Q5, a review prompt every project has: "Yes, one line after a triage". The offer after a triage
  ends with one line offering the review when something is resting and the last review is at
  least seven days old, in addition to on request and at a release.
- Q6, what `Waits:` may mean: "Yes, widen Waits:". A named trigger, or at rest until the owner
  wakes it.
- Where an unanswered line lives. The owner rejected the commit-body store of the first revision:
  "Shouldn't the unanswered line be recorded in the idea itself?", then chose "As an idea file with
  a Question:". The line becomes a normal idea file ending in a `Question:` with a blank `Answer:`,
  its Source line saying it was offered and not yet answered. The option stated its cost: files
  are written without the owner's yes, and they count in the open queue. So "nothing is written
  unasked" reads: a line answered no writes nothing; a line left unanswered is written as that
  Question. This replaces Q2's "(counted in "held back")".

### Position on each item

| Item | Position | Whose |
|---|---|---|
| The home of the formats and the bar (blocker 1) | The `brainstorm` skill. Answers the idea's first Open question. | technical |
| Who writes `Waits:` (blocker 2) | "Only the owner decides a `Waits:` or that an idea is not wanted; the session the owner answered writes the line, or deletes the file, from the owner's words, quoted with `(the owner, <date>)` (in the commit message for a deletion); never a subagent, never by default." The twelve `Waits:` lines here show agents already type them (five in 46011d9 with no attribution, six in 70c6878 with "(owner, 2026-10-19)" and no words, one in fa49e20); none has the quoted form, which holds from adoption on. They are not rewritten. | owner: decided, Q1 |
| Where an entry goes | Above the block, one physical line, a blank line before the block; no line of a block starts with an entry prefix. Stated in the rule file, checked by the reader's warnings. | technical |
| The step 4 loop | Not landed. `triage` step 4 reads the rows whose `block` is `plan` or `answered` and whose `news` is not 0, from the same listing. | technical |
| A `New:` under a `Plan:` or an answered `Question:` | The file is not ready to build. The writer rewrites the Plan in the same commit when the change is settled, taking the line in; otherwise the next triage does. On an answered Question the next triage writes the Plan, or a new Question quoting the answer when the `New:` reopens the choice. | technical |
| Step 9 re-arms triage | One prompted offer per session; the files it records do not make triage due in that session. This defers the re-arm by a session and does not remove it: each offer's files are the next triage's work, by the owner's choice of no cap. Measured by the record's `recorded` count beside the untriaged count. | technical |
| A rule for a wave skill | Cut. `triage` and `handoff` name the skill; a project's wave skill names it too. | technical |
| Who generates, on whose meter | The coordinator, from what is already in its context; a subagent that ran the triage reports up to nine candidates. No agent is launched to brainstorm, at any level. Offered at HOLD too. | owner: decided, Q3 |
| Independent sources | The `Came up again:` prefix is written only for one; an echo with a new angle is a `New:` line. | technical |
| The agreement line | None. | technical |
| The Source line, `Use:` lines, the bar | Adopted; formats and table below. | technical |
| The rest: prefix or a `Rests:` block | The prefix, with the `rest` field for readers. `Rests:` stays rejected: an older reader lists such a file as untriaged. `Waits:` now means a named trigger, or at rest until the owner wakes it. | owner: decided, Q6 |
| An unanswered line | An idea file ending in `Question: offered <date> and not answered: record, record at rest, fold into <file>, or no?` and a blank `Answer:`; the reader's `offered` field marks it. The coordinator acts on the answer as on a live one; no pass builds it and triage writes no Plan from it. | owner: decided |
| The landing rule | A pass that lands a `Plan:` deletes the file when `uses` is 0 and otherwise removes the block; the file then lists as untriaged. | technical |
| The rest review | On request always; prompted at a release and by one closing line on the offer after a triage, at most once in seven days. | owner: decided, Q4 and Q5 |
| `queue-list.js --recurring` | Replaced by the five `--json` fields, built in this decision's pass. No sorting flag. | technical |

Scope of "nothing is written unasked": an idea nobody asked for and no task implies. Work a session
was given or started and did not finish, a defect it saw, a scan hit (`triage` step 1) and a review
follow-up trace to a task, a report or a diff and are filed as today, the `handoff` skill's "later
work" included. An idea a session thinks up while wrapping up goes through the offer.

### What the owner sees

```
Ideas: 42 open, 3 resting, 5 offered and unanswered (at the session's start); bar step 3: not one
use of a named primitive. 3 near-term, 2 intermediate, 3 moonshots; 1 entry on an existing file;
held back: 4, ask to see them.
```

Then at most nine numbered lines in the three groups, one or two lines each, naming the anchor. The
owner answers by number: record, record at rest, fold into a named file, or no. A spark is one such
line, offered when the work it came up in reaches a stop. After a triage, when something rests and
the last review is seven or more days old, the offer closes with one line: `Rest review? <n>
resting, last reviewed <date or never>.`

What each answer writes, in the offer's one commit:

- record: a new idea file with the accepted Source line and no block; the next triage reads it.
- record at rest: the same file ending in the rest line, from the owner's words.
- fold into a named file: the entry on that file (`Came up again:` only from an independent source,
  else `New:` or `Use:`); no new file.
- no: nothing.
- no answer (the owner answered other lines and not this one, or the session reached its wrap-up
  with no reply): a new idea file with the unanswered Source line, ending in the offer `Question:`
  and a blank `Answer:`; a line that was offered as an entry names its file in the question and in
  `related:`. Nothing is written into the other file.

An offer Question is an ordinary `question` row with `offered` true. It has a block, so it does not
make triage due; it counts in the open count, so silence raises the bar; the header counts the
unanswered ones (`offered` true, `block` `question`) and the owner may ask to see them or answer
one by its title in any session. "Held back" keeps only its first meaning: candidates below the bar
or beyond the nine that were never shown, which stay with the session as in the sibling; one that
the owner asks to see and then leaves unanswered is written like any other.

The owner's later answer, in the file's `Answer:` or in words to the coordinator, is acted on by the
coordinator alone (the `brainstorm` skill, at the start of every offer and when a triage report
lists rows with `offered` true and `block` `answered`), exactly as a live answer would have been:

- record: the Source line becomes the accepted form and the `Question:` block is removed; the file
  is untriaged and the next triage does the sanity check, as for any recorded idea.
- record at rest: the Source line likewise; the block becomes the rest line, quoting the answer.
- fold into a file: the entry is written on that file and this file is deleted in the same commit,
  the message naming both (a fold, the README's rule for a duplicate; not a verdict).
- no: the file is deleted, the commit message quoting the owner's words and the date (Q1's rule).
- an answer in other words is read for which of the four it means; where that is unclear the
  coordinator asks at the next offer and the file stays as it is.

The date quoted is that of the commit that brought the answer, or the day it is acted on when the
answer is uncommitted. Until the coordinator has acted, no pass builds the file (the readiness
rule) and triage leaves it (edit 7 below): "record" is a yes to keeping the idea, not to building it.

### Formats, the bar and the record

- Source line, the first body line after the title of an offered idea, one physical line like an
  entry so that a later answer replaces one clause of one line. Accepted: `Source: <who>, generated
  by <model id> and recorded by <model id>, <the public trigger>; offered and accepted by the owner;
  not sanity-checked.` Unanswered: the same with `offered <date>, not yet answered by the owner` as
  its middle clause, which a later "record" turns into `offered <date>, accepted by the owner
  <date>`. `Moonshot.` closes either when the idea is one; `coordinator (<model id>)` stands for
  `<who>, generated by ... and recorded by ...` when the two models are the same; the owner's own
  idea reads `Source: the owner, <context>`.
- Rest line: `Waits: at rest — "<the owner's words>" (the owner, <date>)`.
- Offer question: `Question: offered <date> and not answered: record, record at rest, fold into
  <file>, or no?` then `Answer:` on its own line, blank. `<file>` is the matching file the cheap
  check found, or the words "a named file". The opener always starts `Question: offered `.
- The bar, read once at the session's start from the row count of the listing, resting included.
  Guidance: it never refuses; an offer below it states its reason.

| Step | Open ideas | What an offered idea also shows |
|---|---|---|
| 1 | under 20 | an anchor in the tree |
| 2 | 20 to 40 | no existing file says it (else a `Came up again:` or `New:` entry) |
| 3 | 40 to 80 | it is not one use of a primitive a file or this list names (else a `Use:` line) |
| 4 | 80 to 160 | its lever: what it unblocks or answers, or why a moonshot is worth carrying |
| 5 | 160 to 320 | which open idea of its kind it outranks, one line of reason |
| 6 | 320 and up | the owner asked for its topic, or it recurred from an independent source |

- The record, one per offer, prompted or asked for: `Ideas: brainstorm offer <date> (<trigger>):
  offered <n>, recorded <n>, at rest <n>, entries <n>, unanswered <n>` (the lines answered no are
  the remainder). It carries counts only; no candidate is stored in a commit message. It is the
  subject of the commit that writes the offer's files and entries; at HOLD, where those ride in the
  wrap-up commit, and when every line was a no so that nothing is written, it is one line in the
  body of the wrap-up commit, which the `handoff` skill checks for. `git log --grep` with `^`
  matches a body line as well as a subject (the runner's case: two matches for one subject), which
  the two forms rely on; the date in the pattern keeps a message that quotes the format from
  matching, and `git log --format=%s` piped to `grep` reads subjects alone. The rest review leaves
  `Ideas: rest review <date>: listed <n>, kept <n>, woken <n>, deleted <n>` the same way, and its
  date is what the seven-day limit is counted from.

### The reader's additions (code on a promised CLI: decided here, built by a coder after the ADR)

In scope of ADR 0026, as an amendment to the listing contract (`0017-queue-list.md` sections 2, 3
and 5, in a sibling file of the ADR): additions only, free under ADR 0013, no flag, no exit code and
no existing field changed.

- `ideas` rows gain `rest` (boolean: `block` is `waits` and the opener line starts `Waits: at
  rest`), `offered` (boolean: `block` is `question` or `answered` and the opener line starts
  `Question: offered `), `recurrences`, `news` and `uses` (integers: lines outside a fence that
  start `Came up again: `, `New: `, `Use: `). The field names join the promised `--json` row; the
  text and `--markdown` forms gain the columns, unpromised as before.
- `read()` also returns `warnings`, never a `?` and never a change to `--check`, so the parse is not
  stricter: W1, an entry line below the first block opener; W2, an entry line followed by a
  non-blank line that is not an entry (a wrapped or glued entry, whose next line may open a block).
  The CLI prints each on stderr as `queue-list: <file>: line <n>: <text>`; `post-edit.js` prints
  `post-edit: <rel> line <n>: <text>` for an edited idea file through the call it already makes, so
  under the README marker as for `?`. Known false positive: a block's own line starting with an
  entry prefix; the rule file forbids it.
- Harness, group `Q`: Q14 the five fields (a rest; a trigger `Waits:` with `rest` false; an offer
  Question blank and one answered, both `offered` true; an ordinary `Question:` with `offered`
  false; two recurrences, one `New:` and one `Use:` above a `Plan:`; the same prefixes inside a
  fence count 0; a clean file prints no warning); Q15 a `New:` below a blank `Answer:` warns W1 and still reads
  `answered`, `--check` exit 0; Q16 a `New:` wrapping onto a line starting `Plan:` in a file with no
  block warns W2 and reads `plan`; Q17 under `Waits: at rest`, a `Use:` wrapping onto `Plan:` warns
  W1 and W2, reads `plan` and `rest` false; Q18 the hook prints the lines for those three files and
  nothing for the clean one. The hook specs message table gains the two rows in the same commit.

### What refuses, and who lifts it

- One prompted offer per session: an offer the owner asks for in so many words is always made and
  does not count. Stated in the skill.
- STOP, where a policy sets one: nothing is offered and nothing is written. Candidates already in
  hand (a subagent's triage report) are not kept: the wrap-up report says how many, and the next
  triage's reading lists its own, which the finding's research says will mostly be the same ones.
  Writing them as offer Questions unseen would spend past a stop the owner set, on an inference; the
  store would take them if the owner says so. The owner's own request is the owner's instruction
  and is answered. No agent is launched to brainstorm at any level.
- Nothing written on a no; a file written on silence: the owner, by answering the line.
- The review prompt, at most once in seven days from the last `Ideas: rest review` record: the
  owner's request, any time.
- No subagent writes a `Waits:`, deletes an idea as unwanted or acts on an offer answer: the
  coordinator does, from the owner's words.

### Edits the carried text needs before it lands (lines of the carried blob 399b9e51)

1. Line 3, the description: the added sentence becomes "Ends with the brainstorm offer (the
   `brainstorm` skill)."
2. Lines 10 to 11: after "files with no block" add "(files this session's brainstorm offer recorded
   do not make it due)".
3. Lines 60 to 73, the loop and its paragraph, become: "Also take, from the listing without
   `--untriaged`, the rows whose `block` is `plan` or `answered` and whose `news` is not 0: steps 5
   to 7 with the `New:` lines in view; the new block takes them in and removes them. Rows whose
   `offered` is true are not triage's: the report lists those whose `block` is `answered`, for the
   coordinator. The report carries the placement warnings stderr prints."
4. Lines 93 to 118, step 9, become: "The brainstorm offer (`brainstorm` skill), once the blocks are
   committed: one prompted offer per session. Whoever ran steps 4 to 8 lists up to nine candidates
   the reading suggested, one line and an anchor each; a subagent puts them in its report, since
   only the coordinator can ask the owner. A line answered no writes nothing; a line left
   unanswered is written as an offer `Question:`."
5. Lines 119 to 121, step 10: "which step 4 reopened or flagged," becomes "which step 4 re-read for
   a `New:`, which answered offer Questions wait for the coordinator,"; the brainstorm counts
   become "offered, recorded, recorded at rest, added as entries, and left unanswered"; "and the
   candidates, when a subagent ran the triage" is added.
6. Lines 125 to 127: "in step 9" becomes "through the `brainstorm` skill".
7. Lines 128 to 130 become: "A `Waits:` is the owner's; triage never rewrites one. A `Question:`
   with an `Answer:` is the owner's too: triage only turns it into the block the answer settles,
   quoting it, and leaves an offer Question (`Question: offered`) to the coordinator. Who may write
   a `Waits:`: `.claude/rules/docs.md`, Queues."

These are applied at Land step 4 (the review). The landing body gains one line, `Changed at review:
step 4's loop and step 9's text replaced as ADR 0026 decides`, above the `Carry-back:` line, since
the branch's own subject and body describe the text as sent. Landing, not declining, is what closes
the sibling's row at its next update with nothing relayed by hand (Land step 7).

### Files and order (three commits, each with its one review, pushed together)

1. Coder: `queue-list.js`, `post-edit.js`, group `Q` and the hook specs rows, as above. Verify: the
   harness green; `node .claude/hooks/queue-list.js ideas --check` exits 0 with no warning here.
2. Tester, from the ADR: the new `.claude/skills/brainstorm/SKILL.md` (when; the offer and header;
   the cheap check: the anchor exists, the tree lacks it, a matching idea is searched for, one
   primitive is not split; what each answer writes; acting on later answers; the formats, the table
   and the record above; the rest review, read from the listing; what refuses and who lifts; the
   README check under Migration); `.claude/rules/docs.md`, Queues (the `Waits:` definition and
   authorship; entries and their placement; "a file with a `New:` line, or ending in an offer
   Question, is not ready to build"; the landing rule; "where a project's README says otherwise,
   this file is the record"); `.claude/skills/handoff/SKILL.md` (step 3's
   `Waits:` clause and where "later work" ends; a wrap-up line: a triage, wave close or release this
   session with no offer record means the offer is made now, and the record rides in the wrap-up
   commit); `.claude/skills/carry-back/SKILL.md` (Land step 5's template allows `Changed at
   review:`); the `adr` skill (the migration table below as the format); Hatchery's
   `docs/ideas/README.md` (the three sentences; after "no agent runs that sitting", the coordinator
   prints the resting ideas for it); `README.md` (the skill list). Verify: the skill's description
   against three should-trigger and three should-not prompts where a description eval is at hand.
3. The landing, with the seven edits; it deletes the idea file. Nothing changes under
   `.claude/agreement/`.

### Migration (ADR 0013: the idea grammar's first incompatible change)

What changes meaning: who writes a `Waits:` and deletes an unwanted idea; `Waits:` may be a rest
with no trigger but the owner's word; a file with a `New:` line is not built; a landed file with a
`Use:` line is kept. What does not: every file written before reads as it did, and no old reader
misreads a new one (a rest is a `Waits:`; entries are body text). The base-owned parts arrive
together in one update, so no tree has the skill without the rule file and the reader. The
project-owned part is three sentences of `docs/ideas/README.md`, which `triage` reads first:

1. The `Waits:` bullet: "the owner's deferral: to a trigger it names, or, as `Waits: at rest`, until
   the owner wakes it. Only the owner decides one; the session the owner answered writes it from
   their quoted words."
2. Under what drains the queue: "A pass builds a `Plan:` or an answered `Question:` only when no
   `New:` line stands above it and the Question is not an offer (`Question: offered`, which the
   coordinator acts on), and deletes the file only when no `Use:` line remains; otherwise it
   removes the block and the file is untriaged again."
3. "Offered ideas, the Source line and the entries (`Came up again:`, `New:`, `Use:`): the
   `brainstorm` skill."

The skill applies them itself: before its first offer in a tree it checks that the README names it,
and where it does not, the three sentences ride in that offer's commit. Until then the rule file
is the record (ADR 0016 item 7).

| Tree | Arrives by update | The project edits | When | Check |
|---|---|---|---|---|
| Hatchery | n/a | the three sentences, commit 2 | with the ADR | `--check` exits 0, no warning |
| dystopo | skill, rule file, `triage`, reader, hook; its rows on `triage` and the rule file close | README aligned (sentence 2 is new to it); its wave skill names the skill and keeps its cadence; an ADR superseding its 0065 in part (formats, no loop, an unanswered line as an offer Question, the weekly limit and the closing line), its format file a pointer; its one wrapped `Use:` line rejoined | its next update | the same; `uses` reads 1 for that file |
| broodforge | the same base-owned set | the three sentences; its ideas README has no marker, so the edit-time warning waits for the marker (ADR 0017 item 9) and the listing's stderr warns meanwhile | first offer | the same |
| ER-Workspace (both), Exiled Reign, regenesis, droplet-management, any other tree with a base line | the same base-owned set | the three sentences | first offer | the same |
| A tree that never updates | nothing | nothing | n/a | no file of its own changes meaning |

ADR 0013's two Deferred items, whose trigger ("the first incompatible change") fired with ADR 0021
for the policy row and again here. The migration note format lands: the table above, its five
columns, recorded in the `adr` skill. The compatibility check lands for the idea grammar as harness
group `Q`, which already holds a fixture per block kind, per `kind:` value and for a foreign key and
fails when one changes, extended by Q14 to Q18; a separate fingerprint would restate those fixtures.
The policy-schema half is still owed from ADR 0021 and is not this decision's subject; ADR 0026
says so in amending the item, and the triage scan lists it.

### Asked after the first revision (answered; the answers are above)

- Q5. The base has no release step, so "on request and at a release" would leave the rest review to
  your memory in most projects. May the offer after a triage end with one line offering the review
  when something is resting and the last review is at least seven days old (your weekly limit), in
  addition to on request and at a release? Recommended yes. Answered yes.
- Q6. "Record at rest" writes `Waits: at rest — "<your words>"`. That widens what `Waits:` means in
  every project, from "deferred to a trigger it names" to "or resting until you wake it". Is that
  the meaning you want? Recommended yes; on a no, a rest needs a block of its own, `Rests:`, with a
  reader change and a migration in every project before any rest is written. Answered yes.

Nothing waits on the owner. One default is stated for the owner to reverse with a word: at STOP the
candidates in hand are not written.

## What would change this recommendation

- By 2027-01-31, in the sibling's log, the records show `recorded` plus `at rest` at nine tenths of
  `offered` or more and files added per week have not fallen below 50 (its own prediction): the bar
  does nothing; go back to the owner with a cap or with C. Hatchery's own volume is too small to
  test this; the check is `git log --grep "^Ideas: brainstorm offer 20" --format=%B` there. Files
  added now include unanswered lines, so intake is read beside the records' `unanswered` counts.
- By 2027-02-22, no record in any tree names `spark` as its trigger: the description does not
  trigger; name the skill from one more wired place or drop the spark.
- A session ends after a triage with no offer record in its wrap-up commit: the `handoff` line is
  not holding; make the record a pusher check.
- By 2027-02-22, in any tree, the rows with `offered` true and `block` `question` pass 30, or fewer
  than half of the offer Questions written (the sum of the records' `unanswered`) have been
  answered: silence is filling the queue; ask the owner for a sitting or for a smaller offer.
- The warnings fire on more than one edit in ten of idea files with entries: one physical line is
  the wrong rule; let entries wrap with an indent the reader can see.
- The owner wants candidates kept at STOP: they are written as offer Questions in the wrap-up commit.
- A base wave skill lands (proposals 0003, 0025): it names the skill at close.

## Claims to verify

Checked by the critic and holding (its table): the ownership classes; the agreement-file check and
151 of 190; the 42 files and their blocks; the three commits behind every `Waits:` line; no entry
prefix in Hatchery; one `Use:` line and nothing else in the sibling at b05686f8; skill descriptions
(with the overflow caveat, now under Risks); the gate's reach; Land steps 4 and 7; an older reader
and `Rests:`; the reader's seventeen scratch cases, which the placement rule and Q15 to Q17 come from.

New in the revision:

- `git log --grep "^..."` matches a body line as well as a subject: the runner's case, two matches
  for one subject line; `git log --format=%s` piped to `grep` matches one.
- Group `Q` holds a fixture per block kind and per `kind:` value, and for a foreign key and an
  invalid kind: the `IDEAS` fixtures in `.claude/hooks/test-hooks.js`.
- `post-edit.js` calls `read()` only under a valid marker (`queueLines`), and broodforge's ideas
  README carries none while dystopo's, both ER-Workspace trees' and Exiled Reign's do: `grep -c
  "Listed on demand"` in each checkout.
- No idea file in a sibling checked out beside Hatchery starts a line with `New: ` or `Came up
  again: `, and only the one in the sibling starts one with `Use: `: `grep -lE` in each. regenesis
  and droplet-management are not checked out here and were not read.
- ADR 0021 changed the policy row incompatibly, wrote a migration paragraph and landed neither
  Deferred item of ADR 0013: its Migration paragraph and its Deferred list.
- A wrap-up commit is made by the main session at HOLD (`handoff` skill step 5, `git.md`), so a
  record line in its body needs no launch.
- The cost figures for D are estimates, not measurements. The owner's words and the intake figures
  are the sibling's ADR 0065, Context; the critic read the words there, the intake is not rechecked.

## Critic's objections and responses

Review: `0026-critic-review.md` (critic on Opus 5.5, a process proposal). Thirteen objections.

1. Blocking: the grammar change is incompatible by the proposal's own test and D names no migration.
   Response: right. The authorship of `Waits:`, its meaning, and a drain's terms all change, and
   "nothing until it updates; its README pointer is optional" left each project's README
   contradicting the rule file. The body now says this is the grammar's first incompatible change,
   gives the three README sentences, has the skill apply them at its first offer, names every tree
   in a table, and takes a position on both Deferred items of ADR 0013 (the note format lands; the
   grammar's check is group `Q`, extended; the policy half is owed from ADR 0021).
   Resolution: accepted with change (the README edit is made by the skill, not left to each session).
2. Serious: D's own observability is three `grep`s, a second reader. Response: right; the pile grep
   listed a README and a file the reader calls `plan`. The `--json` fields (five, with `offered`) are built in this
   decision's pass and every skill command reads them. Resolution: accepted.
3. Serious: entry placement fails silently (cases 05, 06, 10, 14). Response: right, and case 14 was
   missing from the draft. Entries are one physical line with a blank line before the block, and the
   reader reports W1 and W2 at the edit and at every listing, with harness cases for 05, 10 and 14.
   The warnings come from `read()`, not from a second parser in the hook. Resolution: accepted with
   change (the check lives in the one reader; the hook prints it).
4. Serious: the build-pass trigger fires and removal is the wrong conclusion. Response: the evidence
   holds; a pass reads the whole file, and reading is not deciding. Removal is gone. A `New:` line
   makes the file not ready whatever its block; the writer rewrites the Plan in the same commit when
   the change is settled, else the next triage does, finding the file by `news` and not by git; an
   answered `Question:` with a `New:` is re-read by the next triage the same way. Resolution:
   accepted with change (a state the reader prints replaces "else removes it").
5. Serious: two triggers cannot fail and the log cannot measure acceptance. Response: right on all
   three counts. `triage` and `handoff` name the skill, so only the spark rests on the description;
   every offer leaves a record with its offered count and its trigger, also when nothing is accepted;
   the predictions are dated and checked in the sibling's log. Resolution: accepted.
6. Serious: the rest review happens only when the owner remembers. Response: right that the base has
   no release. The owner's answer sets a limit (at most weekly) and keeps "on request and at a
   release"; it does not name a prompt every project has. The position is a closing line on the
   offer after a triage, under the weekly limit; "every third triage" needs a counter and "when
   `resting:` passes a number" needs a number nobody has. Since it is what the owner sees, it was
   asked as Q5 and answered "Yes, one line after a triage".
   Resolution: accepted with change (a closing line under the owner's weekly limit).
7. Serious: "never from HOLD" refuses with no lift and drops paid work. Response: the owner's answer
   removes the refusal: the offer is made at HOLD and recorded in the wrap-up commit. What remains
   is stated: the owner's own request is always honoured and does not count against one per session;
   at STOP there is no prompted offer and candidates in hand are kept in the record; no agent is
   launched to brainstorm; "later work" traces to a task, a report or a diff. At STOP nothing is
   offered or written and candidates in hand are not kept (the first revision kept them in the
   commit body, a store the owner then rejected). Resolution: accepted.
8. Serious: the prefix changes what `Waits:` means, which is the owner's. Response: right; the row
   was mislabelled technical. Q1's text told the owner a rest is a `Waits:` line and Q2 approved
   "record at rest", so the practice is answered; the definition's sentence was never shown, and ADR
   0013's history is of an owner who does not confirm by implication. Asked as Q6 and answered
   "Yes, widen Waits:". Resolution: accepted.
9. Minor: the re-arm is deferred, not fixed. Response: right; the table says so and names the two
   counts to read. Resolution: accepted.
10. Minor: the landing message would misstate the change. Response: right; a `Changed at review:`
    line, and the `carry-back` template allows it. Resolution: accepted.
11. Minor: the exit cost is boilerplate. Response: right; D's exit now names the rules that outlive
    the skill, the sweep of `Use:` and `New:` lines, and the fields that stay. Resolution: accepted.
12. Minor: Q1's evidence is overstated. Response: right; the table gives the three commits as they
    are: agents typed all twelve, none in the quoted form. Resolution: accepted.
13. Minor: A is dismissed on a reading of the owner. Response: right; A's risk line now cites the
    question asked here and its answer. Resolution: accepted.

Unresolved between architect and critic: nothing. Waiting on the owner: nothing.

After the review, not an objection: the first revision kept unanswered lines as `Held back:` lines
in the offer's commit body. The owner rejected that store and chose an idea file ending in a
`Question:`. The body is corrected in place: the commit record carries counts only, the reader
gains `offered`, and objections 2 and 5 hold as answered (the store is read by the one reader, and
the record still counts every offer).
