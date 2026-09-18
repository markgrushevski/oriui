---
'@oriui/css': patch
'@oriui/headless': patch
'@oriui/vue': patch
---

**The colour picker's two public custom properties are namespaced.** `--ori-hue` and `--ori-ink` sat in the
library's shared `--ori-*` namespace while meaning something only inside one component — so a consumer (or a
future token with a better claim to the name) could collide with them silently. They are now
`--ori-color-picker-hue` and `--ori-color-picker-ink`, matching `--ori-color-picker-size` beside them.

Breaking only for markup that wrote or read those names directly. The rename spans three packages in one
commit, because the value is written by the headless composable (all three adapters), consumed by the
stylesheet, and forwarded by the styled SFC — a partial rename would have left the area painting its
fallback red.
