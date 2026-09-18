---
'@oriui/css': minor
---

**Structure has a name: `--ori-color-outline` and `--ori-color-outline-strong`.** Borders, dividers and
control edges were invented per component — forty-odd ad-hoc `color-mix` percentages — so a consumer who
wanted one consistent hairline had nothing to repoint and had to guess our numbers. This is the fix for the
one gap a real consumer filed that the library had not closed.

Two weights, because there are two structural jobs: the resting hairline that separates surfaces (panels,
menus, dividers, list rows) and the heavier edge that marks an interactive control (text fields, key caps,
colour swatches). Both derive from `currentcolor`, so a hairline follows the text it accompanies and a
themed subtree needs no per-theme re-declaration.

Visible change: the hairlines that were 14% are now 12%, and the chip edges that were 20% / 25% are now
28% — a few percentage points of alpha on a translucent line, collapsed so one token can own the weight.
Deliberately NOT folded in: low-percentage background tints (hover rows, zebra stripes, the progress
track) are state tinting rather than structure, and the checkbox / radio box edge stays heavier on purpose,
because an unfilled interactive target has to read as an affordance.

A source guard in `tests/tokens.contrast.test.ts` now fails if a component hand-rolls a structural mix
again, with the checkbox / radio exception named in the test rather than left silent.
