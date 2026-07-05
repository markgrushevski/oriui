---
'@oriui/vue': minor
---

Fix an implicit-mode footgun: **icon mode now requires an explicit `icon` prop**, no longer the mere
absence of `text`. Previously `<OriButton>Label</OriButton>` (a slot-only button with no `text` prop)
silently became a fixed-size icon square and its label overflowed. Now `ori-button_icon` is applied
only for an icon-**only** button (`icon` set, `text` absent):

- `<OriButton icon="…" aria-label="…" />` → icon-only square (unchanged).
- `<OriButton icon="…" text="Save" />` → normal labelled button with a leading icon (no longer a square).
- `<OriButton text="Save" />` and `<OriButton>Save</OriButton>` (slot) → normal buttons (no longer forced squares).

OriCard gets the same treatment: its `ori-card_icon` modifier now needs an explicit icon
(`prependIcon` / `appendIcon`) with no `text`, instead of triggering on any card that omits `text`.

This changes existing behaviour for consumers who relied on the old text-absent icon square — pass the
`icon` prop explicitly to keep an icon-only button.
