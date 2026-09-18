---
'@oriui/css': patch
---

**The combobox "no results" message now meets AA.** `.ori-combobox__empty` faded on-surface text with
`opacity: 0.6`, which measured **3.69:1** at worst (sumi, light) — below the WCAG 1.4.3 minimum for body
text. Unlike a placeholder or a disabled option, an empty-state message is real informational content, so
the exemption for disabled and decorative elements does not apply to it.

It now carries `opacity: 0.7`, the same fade a field hint uses, measuring **4.87:1** at worst. Found by the
extended real-Chromium contrast guard on its first run over form controls, and the cell is now asserted in
that matrix rather than only printed.
