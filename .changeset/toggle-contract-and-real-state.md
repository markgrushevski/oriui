---
'@oriui/vue': patch
'@oriui/css': patch
---

**The toggle-button contract, and three states that only looked real.**

**`OriButton` gains `pressed`** — the toggle STATE (`aria-pressed`), next to the existing `active`,
which stays what it always was: a forced `:active` LOOK (`data-active`). Like `OriToolbarButton`'s
`pressed` and `OriDialog`'s `open`, it defaults to `undefined` rather than `false`, so a plain action
button renders no `aria-pressed` at all. Before this, a toggle built on `OriButton` announced nothing
to assistive technology, and the toolbar's own `aria-pressed` wiring is unchanged (it passes the
attribute through, which still wins over the new binding).

**The pressed look is no longer gated behind `.ori-toolbar`.** It moves from `toolbar.css` into
`button.css` and is now keyed on the button alone, so any toggle gets it. It is deliberately NOT the
flat ungate that suggests itself: a literal `background-color` on `.ori-button[aria-pressed='true']`
beats the variant token and repaints `solid` and `soft` toggles with a neutral grey (measured in
Chromium: a pressed `solid` button went from `rgb(3, 105, 161)` to an 18% near-black tint). Instead the
universal affordance is an inset hairline in `currentcolor` — no variant touches `box-shadow`, and the
button's own label colour is contrast-paired with whatever background sits under it — and the neutral
tint is added only for `text` / `quiet` / `outline`, the three variants whose background is
transparent. A toolbar button (`variant="text"` by default) renders exactly the same tint it did
before; `solid` and `soft` toolbar toggles stop being flattened. A source-level test fails if the rule
is re-gated behind an ancestor, or if a pressed background ever reaches a variant that owns its own.

**`<OriCard disabled>` is now `inert`.** It used to be `aria-disabled` on a role-less `<div>` plus
`pointer-events: none` — announced to nobody (a role-less `<div>` is `role=generic`) and no obstacle
at all to the keyboard: buttons and links inside stayed focusable and Enter-activatable. With `inert`
(Baseline 2024) Chromium drops the whole subtree from the accessibility tree, refuses focus and
refuses hit-tested clicks. `aria-disabled` stays as the CSS-layer styling hook.

**`loading` on a non-`button` `OriButton`** (`as="a"`, a router link) no longer relies on
`pointer-events: none`, which never stopped the keyboard — Enter on a focused link still navigated.
It now renders `aria-disabled="true"` and blocks activation with the same capture-phase guard
`OriToolbarButton` already uses. The control stays focusable and simply refuses, and a real `<button>`
is untouched (its `disabled` attribute stops the event at the source).

**Checkbox / switch / radio dim from the real control state.** Their disabled look was driven only by
a prop-driven modifier class, so a control disabled by a surrounding `<fieldset disabled>` — or by a
hand-written `disabled` attribute in the CSS layer — was inert but rendered fully enabled. The
stylesheets now also match `:has(<input>:disabled)`; the modifier class stays for compatibility.
