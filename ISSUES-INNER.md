# Known issues — inner

Open defects and design debts whose fix lands in this repository. Problems owned by a browser, a
dependency or a registry are in [ISSUES-OUTER.md](ISSUES-OUTER.md).

- **Only live problems.** Delete an entry in the same change that fixes it. If the fix taught something
  non-obvious, leave one line in [NOTES.md](NOTES.md); a "won't fix" is a decision and goes to
  [DECISIONS.md](DECISIONS.md).
- **Newest on top.** IDs are never reused; the last one issued is **ORI-I-99**.
- **Status:** `confirmed` — reproduced · `unconfirmed` — suspected · `mitigated` — worked around, root
  cause still open.
- Read this before reviewing: a problem listed here is not a new finding.
- A consumer reports problems in its own `ISSUES-OUTER.md` (e.g. justpaint's `docs/ISSUES-OUTER.md`); an
  accepted report becomes an entry here that names the consumer's id.

---

## ORI-I-99 — No list row outside OriMenu

`confirmed` · reported by justpaint (JP-O-13)

- **Where:** a panel of rows — icon, label, a shortcut hint or a chevron into a sub-panel, as a button or a
  link — has no component. `OriMenu` has rows, but its `role="menu"` cannot hold inline controls (a
  segmented picker, a select, a switch), and an `OriButton` centers its content, so a row built from it
  needs local CSS to read left to right.
- **Fix:** a List / ListItem component: `ul > li` rows with leading, title and trailing parts, the row's
  action a real button or link, `aria-current` for the current row.
