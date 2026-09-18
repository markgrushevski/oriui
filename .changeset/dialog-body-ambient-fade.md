---
'@oriui/css': patch
---

**Fix: `.ori-dialog__body` no longer fades everything a dialog contains below WCAG AA.** The body carried
`opacity: 0.85` for visual hierarchy, but that element wraps the caller's whole slot — so the fade applied
to controls, not only to explanatory text, and multiplied with any fade a child carried of its own. A field
hint's `opacity: 0.7` compounded to 0.595.

Measured in real Chromium across all eight skins and both themes, before the fix: a primary `fill` button's
label at **3.35:1** (luxury, light), a `danger` fill button at **4.14:1**, a field hint at **3.95:1** — all
against a 4.5:1 bar. Dark themes passed, which is why it survived to rc: the token pairs themselves are
honestly AA (5.43:1 for the button), and the margin was only lost at paint time.

The fade is gone; hierarchy in a dialog comes from the title's size and weight, as it does elsewhere in the
library, where secondary text is always a leaf class with its own tone (`__subtitle`, `__hint`) rather than
a group fade over someone else's content. Worst reading inside a dialog is now 4.87:1.

Neither existing guard could see this by construction — the Node token test reads token PAIRS and never
renders, and an axe pass reads declared colours, not composited pixels. `e2e/text-contrast.spec.ts` gains a
third test that measures a composited dialog body (128 readings) so an ancestor fade cannot return unseen.

Reported by the justpaint session against its own login modal (JP-O-09 → ORI-I-85).
