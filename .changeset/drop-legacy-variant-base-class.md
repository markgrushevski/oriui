---
'@oriui/css': patch
---

Drop the legacy `.ori-variant` base class. oriUI's token axes are single-class — a block class plus
one value class (`ori-button ori-variant_tonal`) — and the `.ori-color` axis already shipped without a
paired base. `.ori-variant` was the last survivor of the older `base + modifier` model, and it was not
an inert opt-in: it lives in `ori.utilities`, which by layer order outranks the per-axis defaults a
block bakes into `ori.components`, so its `--ori-variant-bg-color: transparent` **stripped the fill of
any block it was added to**. In real Chromium, `<button class="ori-button ori-variant">` painted
`rgba(0,0,0,0)` with a `currentColor` label instead of the filled primary — also silently bypassing
the AA-checked `--ori-color-on` pairing, since the cluster's `--ori-variant-text-color` fell back to
`currentColor`.

Removing the rule is strictly a fix, not a break. Nothing in the library applied the class, and the
legacy paired form keeps rendering exactly as before: `ori-variant ori-variant_fill` already resolved
through `.ori-variant_fill` (same specificity, later in source order), so with the base gone the bare
class simply matches nothing and becomes the true no-op it was assumed to be. Markup that used
`ori-variant` alone stops losing its background and now renders like the bare block.

A new source-level guard (`tests/css.utilities.test.ts`) walks every stylesheet under
`packages/css/src` and fails if a bare `.ori-variant` or `.ori-color` rule reappears, so the paired
model cannot creep back in; a companion assertion keeps the five single-class variant utilities in
place so the guard can't be satisfied by deleting the file.
