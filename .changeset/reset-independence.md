---
'@oriui/css': minor
---

Components no longer rely on the global reset: every component block declares its own box-sizing
(a zero-specificity border-box subtree rule) and UA neutralization (button/input `padding-block`,
button `font-family: inherit`, dialog-close `padding`, anchored-panel `margin` — the UA gives
`[popover]` `margin: auto`), so `tokens.css` + components renders identically to `base.css` with no
reset at all — guarded by an e2e computed-style diff over all 32 components in real Chromium
(`e2e/reset-independence.spec.ts`).

`reset.css` no longer pins `html { font-size: 16px }` — that wasn't a reset: it overrode the user's
browser font-size preference. The rem base now follows the user's browser setting; the reset is
border-box + Meyer-style margin/padding/border zeroing, nothing more.
