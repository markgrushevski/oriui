# Known issues — inner

Open defects and design debts whose fix lands in this repository. Problems owned by a browser, a
dependency or a registry are in [ISSUES-OUTER.md](ISSUES-OUTER.md).

- **Only live problems.** Delete an entry in the same change that fixes it. If the fix taught something
  non-obvious, leave one line in [NOTES.md](NOTES.md); a "won't fix" is a decision and goes to
  [DECISIONS.md](DECISIONS.md).
- **Newest on top.** IDs are never reused; the last one issued is **ORI-I-100**.
- **Status:** `confirmed` — reproduced · `unconfirmed` — suspected · `mitigated` — worked around, root
  cause still open.
- Read this before reviewing: a problem listed here is not a new finding.
- A consumer reports problems in its own `ISSUES-OUTER.md` (e.g. justpaint's `docs/ISSUES-OUTER.md`); an
  accepted report becomes an entry here that names the consumer's id.

---

## ORI-I-100 — OriField's label points `for` at nothing when it wraps a group

`confirmed`

- **Where:** `OriField` renders `<label for="<field id>">`, and a single control (input, select, textarea)
  takes that id. A group — `OriRadioGroup`, `OriSegmentedControl` — takes none: it is named through
  `aria-labelledby` instead, so the name is right, but the label's `for` points at no element and a click
  on the label does nothing.
- **Fix:** let a group tell the field it is one (the field context already carries `labelId` for it), and
  render the label without `for` then.
