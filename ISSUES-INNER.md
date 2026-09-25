# Known issues — inner

Open defects and design debts whose fix lands in this repository. Problems owned by a browser, a
dependency or a registry are in [ISSUES-OUTER.md](ISSUES-OUTER.md).

- **Only live problems.** Delete an entry in the same change that fixes it. If the fix taught something
  non-obvious, leave one line in [NOTES.md](NOTES.md); a "won't fix" is a decision and goes to
  [DECISIONS.md](DECISIONS.md).
- **Newest on top.** IDs are never reused; the last one issued is **ORI-I-98**.
- **Status:** `confirmed` — reproduced · `unconfirmed` — suspected · `mitigated` — worked around, root
  cause still open.
- Read this before reviewing: a problem listed here is not a new finding.
- A consumer reports problems in its own `ISSUES-OUTER.md` (e.g. justpaint's `docs/ISSUES-OUTER.md`); an
  accepted report becomes an entry here that names the consumer's id.

---

### ORI-I-98 — A caller's `aria-describedby` drops the field hint on RadioGroup and ColorPicker

`confirmed` · `ori-radio-group.vue`, `ori-color-picker.vue`

Inside an `OriField` with a `hint`, `<OriRadioGroup aria-describedby="mine">` renders
`aria-describedby="mine"` and loses the hint's id; `OriColorPicker` does the same. Both bind the field's
`describedBy` on a root that also receives fall-through attributes, and fall-through merges last, so the
caller wins and the hint is no longer announced. The four text controls had the mirror-image bug and now
join both lists; these two need the same (`inheritAttrs: false` plus an explicit merge).

### ORI-I-95 — Toasts auto-dismiss after 4 s with no way to pause, extend or disable it

`confirmed` · `packages/headless/src/core/toast/queue.ts`, `packages/vue/src/components/toast/ori-toaster.vue`

The binding criterion is WCAG 2.2.1 Timing Adjustable (Level A); the 2.2.3 / 2.2.4 that APG cites are AAA.
Today's toasts are probably compliant only because they carry no action: 2.2.1 exempts timed content that
is also available another way. A toast with an Undo button, or one that is the only place an error is
reported, fails it.

Decide this together with an action affordance (Radix, Reka and Ark all ship one): adding an action makes
pause-on-hover/focus mandatory. The toaster also lacks a labelled `role="region"` and a hotkey to reach it.

### ORI-I-94 — Arrow keys ignore RTL on Tabs, and on Toolbar work only through a prop nobody sets

`confirmed` · `packages/headless/src/core/roving.ts`, `ori-toolbar.vue`, `ori-tabs.vue` / `useTabs`

`roving.ts` swaps ArrowLeft / ArrowRight when given `dir: 'rtl'`, but nothing reads the computed direction:
Toolbar exposes a `dir` prop, Tabs and `UseTabsOptions` have none. Under `dir="rtl"` both move
forward-in-array. An RTL app can fix the toolbar and cannot fix the tabs. `e2e/rtl.spec.ts` covers
geometry only, not the keyboard.

Fix: read the computed `direction` once and let a `dir` prop override it.

### ORI-I-87 — `OriAccordion`'s `#default` slot renders once per item

`mitigated` · `packages/vue/src/components/accordion/ori-accordion.vue`

A `#default` template renders into every section, so an `id` inside it repeats; in `multiple` mode two
sections can be open at once, and a `<label for>` in the second focuses the input in the first.
`tests/accordion.test.ts` pins this.

Mitigated by `#panel-<value>`, which renders into its own section only; the docs point at it, and a DEV
warning names a `#panel-*` slot that matches no item. Content is deliberately not gated on `open`: a
closed `<details>` keeps it in the DOM so find-in-page can reveal it. Closing this means either documenting
the fan-out as the contract or finding a remedy that survives two open sections — Tabs' remedy (render the
fallback into the active panel only) has no analogue when several sections are open.
