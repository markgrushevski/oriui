---
'@oriui/css': patch
---

Each tooltip opens at its own trigger. Tooltips share one default anchor name, and with several of them in
normal flow, such as the buttons of a toolbar, every bubble was placed at the last trigger on the page.
`.ori-tooltip` now scopes the name with `anchor-scope`. Nothing to migrate; a per-instance `--ori-anchor` set
only to work around this can be removed.
