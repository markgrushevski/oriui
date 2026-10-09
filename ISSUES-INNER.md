# Known issues — inner

Open defects and design debts whose fix lands in this repository. Problems owned by a browser, a
dependency or a registry are in [ISSUES-OUTER.md](ISSUES-OUTER.md).

- **Only live problems.** Delete an entry in the same change that fixes it. If the fix taught something
  non-obvious, leave one line in [NOTES.md](NOTES.md); a "won't fix" is a decision and goes to
  [DECISIONS.md](DECISIONS.md).
- **Newest on top.** IDs are never reused; the last one issued is **ORI-I-102**.
- **Status:** `confirmed` — reproduced · `unconfirmed` — suspected · `mitigated` — worked around, root
  cause still open.
- Read this before reviewing: a problem listed here is not a new finding.
- A consumer reports problems in its own `ISSUES-OUTER.md` (e.g. justpaint's `docs/ISSUES-OUTER.md`); an
  accepted report becomes an entry here that names the consumer's id.

---

## ORI-I-102 — a few built-in accessible names are English only

`confirmed` · found by the final 1.0 review (October 2026)

- **What:** Alert, Tag, Dialog, Drawer and Toast take a `closeLabel`, and Combobox a `noResultsText`. These
  strings still have no prop:
    - the color picker's labels: the area, the hue and alpha sliders, the hex field and the preset list,
      some of them set in `useColorPicker`;
    - the combobox's clear button, named "Clear selection" in the core connect.

    An app in another language gets English names on those controls.

- **Fix:** additive props (a `labels` object on `OriColorPicker` and `useColorPicker`, a `clearLabel` on
  `OriCombobox` and in the combobox options). A minor release after 1.0, so it does not block it.
