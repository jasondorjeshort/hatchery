---
date: 2026-11-24
status: open
area: wave-lead pilot (ADR 0025 build step 6, item 11) / cost and stops of six led changes
---

# The six led changes cost the coordinator more than the relay they replaced would have: K1 fails under every reading of B, K2 only under some, K4 depends on a count

## Question

ADR 0025 item 11 sets the test of the wave lead: six led changes, the shakedown included, measured per
change by `B` (the coordinator's cost for the turns that touched the change), `L` (the lead's own cost) and
`A` (twice the lead's permit count times the mean cost of a coordinator turn in that span). K1: `B` at most
half of `A` in five of six. K2: `B + L` below `A` in four of six. K3: at most one change where the loop
closed a finding the coordinator, reading the files afterwards, would have declined or deferred. K4: at most
one change stopped by a lead-guard deny or `maxTurns`. What do the numbers say, and what does the rule then prescribe?

## What was tried

The session's transcripts, read by script only (`<scratchpad>/changes/pilot-finding/pilot-cost.js`; run twice,
identical output), plus the coordinator's notes and each change's `lead.json`, verdict and reviews.

- Cost of a turn: its `usage` (input, cache write, cache read, output tokens) times the list prices of the
  `claude-api` skill (US dollars per million tokens: Fable 5.2 8 in, 40 out, 0.20 cache read; Sonnet 5.5 2, 10, 0.10).
  The skill gives no cache-write price: 1.25 times input for 5-minute writes, 2 times for 1-hour writes (the
  transcripts record which). Check: the brief's fallback weights (input 1, write 1.25, read 0.1, output 5; Fable
  5, Opus 2, Sonnet 1) move some K2 cells, in the table below. Only ratios matter.
- Each API response counted once: a transcript repeats one response's `usage` over several lines; the script
  keeps the first line per message id.
- A change's span runs from the coordinator turn holding its first `lead.js init <slug>` to the one holding its
  last `lead.js close` of it. A turn that closes one change and opens the next is in both spans (3 turns, 0.35 of
  the coordinator's cost). The coordinator was Fable throughout; the leads were Sonnet in every turn; their
  longest run was 26 turns, so no lead met `maxTurns` (100).
- Item 11 words `B` as the coordinator's cost for "the turns that touched the change"; the span appears only in `A`'s
  mean. Whole-span `B` (every coordinator turn in the span) is the brief's simplification, not that wording, so
  both are reported. Touching `B`: a turn counts when its content names the slug or one of the change's lead ids;
  this is a string match, a heuristic, and a turn that acted on the change without naming it is missed. `A` keeps
  the whole-span mean in both. Beside `B`, `mend` is the part spent mending the lead's own bounds by path (turn
  ranges fixed by hand from the notes: `63e2629` and `c9831b3` in the shakedown, `30e891a` in
  `queue-operator-title`, `ad46517` in `formatter-cmd-shims`). `queue-operator-title`'s span also holds the briefs
  written for the later changes (1.61).
- `L` is all of that change's leads together. `A` uses the permit count of the landed `lead.json` (6 for
  `companion-quotes`, 3, 6, 3, 3, 3 in order).

## Result

Per change, whole-span `B`, dollars at list prices (`turns`: coordinator turns in the span; `lead turns`: all leads' responses):

| change | turns | lead turns | permits | B | mend | L | A | B/A | B+L |
|---|---|---|---|---|---|---|---|---|---|
| companion-quotes (shakedown) | 64 | 25 | 6 | 5.54 | 2.44 | 0.29 | 1.04 | 5.33 | 5.83 |
| queue-operator-title | 57 | 38 | 3 | 5.73 | 1.33 | 0.46 | 0.60 | 9.50 | 6.18 |
| formatter-cmd-shims | 25 | 36 | 6 | 2.55 | 1.66 | 0.41 | 1.23 | 2.08 | 2.97 |
| adopt-proposals-reset | 5 | 14 | 3 | 0.52 | 0 | 0.10 | 0.62 | 0.83 | 0.62 |
| docs-rule-skipped-tokens | 4 | 12 | 3 | 0.37 | 0 | 0.09 | 0.56 | 0.67 | 0.47 |
| design-doc-pointers | 6 | 15 | 3 | 0.78 | 0 | 0.11 | 0.78 | 1.00 | 0.89 |
| all six | 161 | 140 | 24 | 15.50 | 5.43 | 1.47 | 4.83 | | |

Rounds used (cap 2): shakedown 1; `queue-operator-title` 0; `formatter-cmd-shims` 1; the other three 0.

Touching `B` (string match), list prices: shakedown 2.71, `queue-operator-title` 2.15, `formatter-cmd-shims` 1.08,
`adopt-proposals-reset` 0.44, `docs-rule-skipped-tokens` 0.30, `design-doc-pointers` 0.52; without the mend part
2.06, 1.51 and 0.75 for the first three.

| reading of `B` | K1 (needs 5 of 6) | K2 (needs 4 of 6) |
|---|---|---|
| whole span, list prices | 0 | 2 (`adopt-proposals-reset`, `docs-rule-skipped-tokens`) |
| whole span without mend, list prices | 0 | 2 |
| whole span without mend, fallback weights | 0 | 3 (`formatter-cmd-shims` joins) |
| touching, list prices | 0 | 3 (`design-doc-pointers` joins the two) |
| touching without mend, list prices | 0 | 4 (`formatter-cmd-shims` joins the three) |
| touching, fallback weights, mend in or out | 0 | 4 |

K1 fails on every reading, for a reason the readings do not touch: the shakedown and `queue-operator-title` have
`B/A` of 2.61 and 3.57 touching (5.33 and 9.50 whole-span), so at most four changes can pass. The nearest to half
is `docs-rule-skipped-tokens` at 0.54. K2 depends on the reading of `B`: it fails on the whole-span readings and
under touching `B` with the mend part counted at list prices, and passes on touching `B` without the mend part and
on touching `B` under the fallback weights.

Two things about the measure that a reader should weigh. Under whole-span `B`, `A = 2 x permits x B/turns`, so `B/A`
is the turn count over twice the permits whatever the prices: K1 there reads "at most as many coordinator turns in the
span as permits", and the shortest span here, init to close, took 4 turns (a 3-permit change passes only at 3 or
fewer). The weightings therefore say nothing about whole-span K1; they matter only for the without-mend and touching
columns. `L` is small (1.47 of 17.0): the lead's own turns are not where the cost sits. `A` is a model, not a
measurement: the relay it stands for never ran. The short spans hold the coordinator's work on this pilot itself
(the briefs of later changes, this finding's brief), which whole-span `B` counts.

K3 holds, 0 of at most 1: the coordinator's answer of 2026-11-24, having read both fix rounds, is that it would
have had both findings fixed, so no change counts against K3. Two fix rounds ran, each closing one serious
finding (the reviews' texts are in the change's lead directory or the reviewers' transcripts):

- `companion-quotes`, round 1: closed `1-1` (serious: the Caller bullet left out the conditions on the script
  path and the matcher). Minor: `1-2`, `1-3`. The response lists `1-1 fixed` only; the check (round 2) closed both minors and raised `2-1` (minor).
- `formatter-cmd-shims`, round 1: closed `1-1` (serious: the 20 s timeout no longer stopped a bare-name
  formatter run through `cmd.exe`, the documented `rustfmt` form included). Minors `1-2` to `1-4` (one of them
  the PW04 test's dependence on an English Windows message). The response named only `1-1`; the check closed all
  three, PW04 included, and left `2-1` (minor) open.

K4: every stop by a deny or `maxTurns`, with its cause from the notes. No lead reached `maxTurns`.

| change, run | stop | cause | mended by |
|---|---|---|---|
| companion-quotes, 1 | the Agent call failed the tool's input check (`description` missing); no hook ran, no deny | `wave-lead.md` did not pass `description` | `63e2629` |
| companion-quotes, 3 | send denied (`not the permitted step`), then a chained Bash call denied | the hook required `content` to equal the whole message; the harness sends a 49-character preview | `c9831b3` |
| queue-operator-title, 1 | two Bash denies (`cd <root> && ...`); nothing started | the lead's own wording | `30e891a` |
| queue-operator-title, 3 | Bash deny (`cat`) after about 25 minutes of polling `wait` | a `wait` moved to the background, and a commit step that never completed (a staged deletion broke the `git add`) | `ad46517` for the wait; the commit step is an idea, unmended |
| formatter-cmd-shims, 1 | Bash deny (`sleep 1; echo`) | a `wait` moved to the background | `ad46517` |

Also stopped, not by a deny: `companion-quotes` run 2 (stopped by the coordinator on purpose, for P4) and
`queue-operator-title` run 2 (`writer output malformed`, a script stop: the writer's `Files:` list named a file of
the lead directory). After the two mends no lead was denied: four runs in a row landed.

Counting is a judgment, and this finding does not make it:

- Every change with a stop by a deny counts: 3 changes (the shakedown, `queue-operator-title` with two,
  `formatter-cmd-shims`). K4 fails (more than one).
- The shakedown's deny came from a hook defect, not the lead; leave it out: 2 changes. K4 still fails.
- Leave out every deny whose cause was a defect of `lead.js`, a template or `wave-lead.md` that was then
  mended: 0 changes, or 1 if `queue-operator-title`'s denies count (run 1's cause is the lead's own wording, run
  3's includes a commit step left unmended). K4 holds either way. The shakedown's run 1 is no deny on any reading.

What item 11 then prescribes: "K1, K2 or K3 fails: withdrawn." K1 fails on every reading of `B`, with or
without the mend part and under both weightings, so the rule prescribes withdrawal from K1 alone, whatever K2
(reading-dependent) and K4 (count-dependent) say; K3 holds. K4 alone failing (the other branch, the `opus` model
and three more changes) is not the case. Withdrawal removes the agent, the hook entries, the lead's sentences and
Hatchery's `finish`; the policy keys stay (item 12).

Not measured: the cost of the writers, runners and reviewers (the same on both paths, so left out of `A`
and `L`); the coordinator's turns after a `close` (the four minors relayed for `queue-operator-title`, fixes by hand);
what the relay would really have cost. `queue-operator-title` had four leads; the coordinator's notes
said five, a miscount.

## Next

- The decision waits for the owner: the coordinator reported the result and did not withdraw the lead; the
  rule's text (ADR 0025 item 11) says withdrawn.
- The probe finding (`2026-11-23-nested-agent-hook-probe.md`) records P4 as seen; its open item is P3.
