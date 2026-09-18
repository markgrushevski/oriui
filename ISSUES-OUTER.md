# Known issues — outer (someone else has to fix these)

Defects and constraints whose fix lives **outside this repository** — a browser, a dependency, a tool, a
registry. We cannot close them; we can only work around them, and record the workaround so nobody
"simplifies" it away later. Problems we own are in [ISSUES-INNER.md](ISSUES-INNER.md).

**Status vocabulary.** `confirmed` — reproduced here, with evidence · `unconfirmed` — suspected ·
`mitigated` — a workaround is in place, the root cause is still theirs · `accepted` — a permanent external
constraint we design around · `fixed upstream` — their fix shipped, note the version that lets us drop the
workaround.

**The rule that makes this file worth keeping:** every `mitigated` entry names the code that exists _only_
because of the upstream defect. That is the thing a future cleanup will try to delete.

**Inbound from consumers.** A downstream project reports oriUI problems in its own `ISSUES-OUTER.md` (see
justpaint's `docs/ISSUES-OUTER.md`). When we accept one, it becomes an entry in
[ISSUES-INNER.md](ISSUES-INNER.md) here, backlinking the consumer's id — that way the fix has exactly one
home, and the consumer's file tracks only whether the upgrade landed.

---

## ORI-O-01 — Chromium leaves baked component colours stale after a runtime theme toggle

`mitigated` · Chromium 148 and 149 · source: NOTES.md:218-232, found building the docs skin switcher

- **What:** flipping the `ori-theme_dark` class at runtime changes the inherited role tokens, but Chromium
  does not re-run the element-level bake — a component whose colour was resolved into a local custom
  property keeps the previous theme's colour, box and paint, until the box is rebuilt. A bare direct read
  (`color: var(--ori-color-primary)`, no element-level bake) flips correctly, which is what makes the bug
  look like a token problem rather than an engine one.
- **Reproduces only** in a real browser over HTTP with the full cascade — not in happy-dom, not from a
  `file://` page, not with a trimmed stylesheet.
- **Workaround that exists because of this:** `applyTheme` / `createThemeController` / `useTheme` in
  `@oriui/headless` (core `theme.ts`) force a style flush (`display: none` toggle) around the class change.
  `@property` registration and literal fallbacks were both tried and do **not** work.
- **When it can go:** when the oldest Chromium we support has the fix. Re-test with the docs skin switcher
  before deleting anything in `theme.ts`.

## ORI-O-02 — axe-core no longer detects duplicate ids

`accepted` · axe-core 4.8+ (this repo runs 4.12.1) · source: NOTES.md:554

- **What:** axe dropped the `duplicate-id` and `duplicate-id-active` rules; only `duplicate-id-aria`
  survives. So `expectNoA11yViolations` passes on two elements sharing an `id` unless that id is referenced
  from an ARIA attribute. This exact gap let a three-way id collision in ColorPicker-inside-Field ship green.
- **Workaround that exists because of this:** composite components assert id uniqueness explicitly
  (`new Set([...root.querySelectorAll('[id]')].map((e) => e.id)).size === count`) instead of trusting the
  axe pass. Do not remove those assertions as "redundant with axe" — they are not.

## ORI-O-03 — attw reports `cjs-resolves-to-esm` for packages that have no CJS build

`accepted` · @arethetypeswrong/cli 0.18.x · source: the CI packaging gate

- **What:** all three packages are ESM-only (`"type": "module"`, no CJS output). attw still flags the
  CJS→ESM resolution path, which is the expected and intended outcome, not a defect to fix.
- **Workaround that exists because of this:** the CI gate runs attw with `--profile node16` plus
  `--ignore-rules cjs-resolves-to-esm`. If that flag is ever dropped, the gate goes red for a packaging
  shape we chose deliberately. node10 (classic resolution) is out of scope for the same reason: it ignores
  `exports` entirely, so the subpath entries cannot work without `typesVersions` hacks we do not ship.

## ORI-O-04 — npm refuses the unscoped name `oriui`

`accepted` · npm registry typosquatting filter · source: DECISIONS.md "Root package renamed `oriui` → `@oriui/vue`"

- **What:** npm's similarity filter rejects `oriui` as too close to `cliui` — a hard 403 on first publish,
  not appealable in practice. Variants that normalise to the same token (`ori-ui`) are blocked too; scoped
  names bypass the filter entirely.
- **Consequence to remember:** there is no `npx oriui …`. Any CLI this project ever ships is
  `npx @oriui/cli …` or an in-repo script — see the CLI entry in IDEAS.md, which was written against the
  unreachable form.
