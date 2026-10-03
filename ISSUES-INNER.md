# Known issues — inner

Open defects and design debts whose fix lands in this repository. Problems owned by a browser, a
dependency or a registry are in [ISSUES-OUTER.md](ISSUES-OUTER.md).

- **Only live problems.** Delete an entry in the same change that fixes it. If the fix taught something
  non-obvious, leave one line in [NOTES.md](NOTES.md); a "won't fix" is a decision and goes to
  [DECISIONS.md](DECISIONS.md).
- **Newest on top.** IDs are never reused; the last one issued is **ORI-I-101**.
- **Status:** `confirmed` — reproduced · `unconfirmed` — suspected · `mitigated` — worked around, root
  cause still open.
- Read this before reviewing: a problem listed here is not a new finding.
- A consumer reports problems in its own `ISSUES-OUTER.md` (e.g. justpaint's `docs/ISSUES-OUTER.md`); an
  accepted report becomes an entry here that names the consumer's id.

---

## ORI-I-101 — No forced-colors support: state shown by fill disappears

`confirmed` · reported by justpaint as JP-O-15

- **What:** `@oriui/css` has no `@media (forced-colors: active)` rules. A forced-colors mode (Windows
  contrast themes) replaces backgrounds with system colors and drops box shadows, so every state drawn by
  fill alone disappears: the pressed toolbar toggle, the selected segment, the switch track and thumb, the
  slider track and fill. An `OriSurface` without `bordered` is lifted by its shadow alone and has no edge.
- **Fix:** forced-colors rules in each component that shows state by fill (`Highlight` / `HighlightText`
  for pressed and selected, `CanvasText` borders for tracks), a transparent border on unbordered surfaces
  so the forced border shows, and an e2e audit under `emulateMedia({ forcedColors: 'active' })`.
