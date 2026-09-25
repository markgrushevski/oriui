---
'@oriui/css': patch
---

**CSS layer: the modifier vocabulary goes flat — 106 `.ori-x.ori-x_y` compounds collapse to one class.**

The rule is that specificity stays flat (`:where()`, no `.a.a_b` stacking), and the
component layer broke it 106 times, across 22 files. The cause was structural rather than sloppy: each
block declared its baked token defaults in the very same `.ori-input { … }` rule (0,1,0) that carried
its layout, so a single-class modifier could never outrank it, and `input.css` said so out loud
("Compound with the block so it beats the baked `md` default by specificity").

So the baked defaults move out into a companion `:where(.ori-input) { … }` rule at (0,0,0) — declaring
a custom property on the element still beats inheritance at any specificity, so a nested block keeps
reading its own value — and every modifier is now a single class: `.ori-input_lg`, `.ori-card_fluid`,
`.ori-toaster_top-left`, `.ori-surface_elevation-md`. The vocabulary finally matches the
`.ori-size-action_*` utilities it was written to mirror, and the modifiers still win on **specificity**
rather than on source order.

**This is a behavioural change for one audience, and it is deliberate.** Every modifier selector drops
from (0,2,0) to (0,1,0), so a rule you wrote to beat one needs one less class. Nothing changes for the
common case — an unlayered consumer stylesheet still outranks the whole library by layer order, and
`@oriui/vue` emits exactly the same class names — but an override that lives _inside_ `@layer` and was
sized against the old (0,2,0) now ties or wins where it used to lose. Pre-1.0 is the moment to pay for
that; after 1.0 it is a major-version event.

**Proof that nothing else moved:** every component in the reset-independence fixture was rendered once
per modifier class, in four theme selectors (bare `:root`, `:root.dark`, `:root.light`,
`.ori-theme_dark`) × LTR and RTL × page-level and subtree-themed regions, against the before and after
builds in real Chromium — 16,016 element renders, 9,549,488 computed-property readings, **0
differences**. A control run that seeded two regressions into the same harness reported 472.

One selector genuinely did change a cascade outcome and was fixed rather than skipped:
`.ori-toaster:dir(rtl)` is (0,2,0), so once the corner modifiers flattened to (0,1,0) the direction
default started beating them and a corner-pinned toaster slid in from the wrong edge under `dir="rtl"`
— the exact regression the control run reproduces. Both arms of that default now sit in `:where()`, so
the corners outrank them by specificity instead of by source order, which is what the file's own
comment had been relying on all along.

**The variant vocabulary's interactive half is no longer button-only.** Ten rules in `ori.utilities`
named `.ori-button` outright, so `.ori-variant_*` gave a consumer's own block the base cluster and the
generic `[data-active]` tint but no `:hover` / `:active` — two thirds of a vocabulary. They now read
`:where(.ori-button, [data-ori-interactive])`, so an element opts in with `data-ori-interactive` and
gets the whole thing. `:where()` keeps the hook free, so a button computes identical values at rest,
on hover, on `:active` and under `[data-active]` in all five variants and both themes (measured), and
an element _without_ the attribute is still untouched. The rules stay in `ori.utilities` on purpose:
they move `--ori-variant-bg-color`, and that layer outranks `ori.components`, so the same rules moved
into a block file could never win.

**Eleven more dead `var(--ori-color, …)` fallbacks are gone** — from `accordion`, `menu`, `popover` and
`tabs`, finishing the sweep the slider and colour-picker blocks started. `--ori-color`, `--ori-color-on`
and `--ori-color-text` are all declared unconditionally at `:root`, so the fallback arm can never fire.
Eight of the eleven were also misleading: `accordion` and `tabs` bake the primary accent in their own
block, so the `currentcolor` those arms advertised was never what would resolve — measured, the
accordion chevron and the tabs indicator paint `rgb(3, 105, 161)` in light and `rgb(56, 189, 248)` in
dark where the fallback claimed the page ink. The remaining three (`menu` ×2, `popover`) bake no accent,
so they were merely redundant. A component that needs its own default declares a block-local token, the
way `--ori-tooltip-bg` and `--ori-checker-*` already do.

Net effect on the bundle: `styles.css` loses 798 bytes raw and 29 bytes gzipped.
