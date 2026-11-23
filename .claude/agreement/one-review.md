## One independent review per change

Every change is read once by an agent that did not write it before it is pushed: `reviewer` for
code and docs, `critic` for a proposal. The coordinator reads the report, not the diff, and
routes fixes back to the writer by the review file's path, never rewritten; a fix to an unpushed
commit is amended into it. One review, not
three: the writer's own check and the pusher's mechanical checks are not reviews, and a second
reading of the same diff by the same model finds what the first did. The user reviews what humans
see and touch, and anything the reviewer marked blocking that the coordinator overrode.

A change a `wave-lead` runs gets the same one review, of its unpushed commit. Each fix round is then
checked, an addition and not the review continuing: a fresh reviewer reads what the fix changed and
says which blocking and serious findings are still open, without seeing the writer's response. At
most two fix rounds; a brief may lower that. The fix is amended into the commit while it is HEAD and
unpushed, else it is a follow-up commit. A declined finding, one still open, or a verdict of rethink
stops the change unpushed; the coordinator alone overrides a finding (ADR 0025).
