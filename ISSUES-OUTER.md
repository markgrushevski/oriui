# Known issues — outer

Defects and constraints whose fix lives outside this repository — a browser, a dependency, a tool, a
registry. We can only work around them, so each entry names the workaround, to keep anyone from
"simplifying" it away. Problems we own are in [ISSUES-INNER.md](ISSUES-INNER.md).

- **Only live problems.** When an upstream fix ships, drop the workaround and delete the entry in the
  same change.
- **Newest on top.** IDs are never reused; the last one issued is **ORI-O-04**.
- **Status:** `confirmed` — reproduced · `unconfirmed` — suspected · `mitigated` — a workaround is in
  place · `accepted` — a permanent constraint we design around.

---

## ORI-O-04 — npm refuses the unscoped name `oriui`

`accepted` · npm registry typosquatting filter

- **What:** npm's similarity filter rejects `oriui` as too close to `cliui` — a hard 403 on first publish.
  Names that normalise to the same token (`ori-ui`) are blocked too; scoped names bypass the filter.
- **Consequence:** there is no `npx oriui …`. Any CLI this project ships is `npx @oriui/cli …`.

## ORI-O-03 — attw reports `cjs-resolves-to-esm` for packages that have no CJS build

`accepted` · @arethetypeswrong/cli 0.18.x

- **What:** all three packages are ESM-only. attw still flags the CJS→ESM resolution path, which is the
  intended outcome, not a defect.
- **Workaround:** the CI gate runs attw with `--profile node16 --ignore-rules cjs-resolves-to-esm`. node10
  (classic resolution) is out of scope: it ignores `exports`, so the subpath entries cannot resolve
  without `typesVersions` hacks we do not ship.

## ORI-O-02 — axe-core no longer detects duplicate ids

`accepted` · axe-core 4.8+

- **What:** axe dropped `duplicate-id` and `duplicate-id-active`; only `duplicate-id-aria` survives. So
  `expectNoA11yViolations` passes on two elements sharing an `id` unless an ARIA attribute references it.
- **Workaround:** composite components assert id uniqueness explicitly
  (`new Set([...root.querySelectorAll('[id]')].map((e) => e.id)).size === count`). Those assertions are
  not redundant with axe.

## ORI-O-01 — Chromium leaves baked component colours stale after a runtime theme toggle

`mitigated` · Chromium 148–149

- **What:** flipping `ori-theme_dark` at runtime changes the inherited role tokens, but Chromium does not
  re-resolve a colour an element has baked into a local custom property until its box is rebuilt. A bare
  `color: var(--ori-color-primary)` flips correctly, which makes it look like a token bug.
- **Reproduces only** in a real browser over HTTP with the full cascade — not in happy-dom, not from
  `file://`, not with a trimmed stylesheet.
- **Workaround:** `applyTheme` / `createThemeController` / `useTheme` (`@oriui/headless`, core `theme.ts`)
  force a style flush (a `display: none` toggle) around the class change. `@property` registration and
  literal fallbacks do not help.
- **When it can go:** once the oldest supported Chromium has the fix. Re-test with the docs skin switcher
  before touching `theme.ts`.
