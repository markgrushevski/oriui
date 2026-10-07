# Known issues — outer

Defects and constraints whose fix lives outside this repository — a browser, a dependency, a tool, a
registry. We can only work around them, so each entry names the workaround, to keep anyone from
"simplifying" it away. Problems we own are in [ISSUES-INNER.md](ISSUES-INNER.md).

- **Only live problems.** When an upstream fix ships, drop the workaround and delete the entry in the
  same change.
- **Newest on top.** IDs are never reused; the last one issued is **ORI-O-09**.
- **Status:** `confirmed` — reproduced · `unconfirmed` — suspected · `mitigated` — a workaround is in
  place · `accepted` — a permanent constraint we design around.

---

## ORI-O-09 — WebKit's native radios keep physical arrows in a right-to-left group

`accepted` · WebKit (measured in Playwright's WebKit, October 2026)

- **What:** in `dir="rtl"`, Chromium and Firefox mirror the arrows of a radio group (Left moves to the next
  option); WebKit does not, so Right still moves forward. `OriRadioGroup` and `OriSegmentedControl` are
  native radio groups, so they inherit it. Up and Down behave the same everywhere.
- **No workaround:** rewriting the arrows would take the keyboard away from the browser for a difference the
  platform owns. `e2e/segmented-control.spec.ts` skips its RTL case in WebKit.

## ORI-O-08 — WebKit does not match `:focus-visible` on a radio an arrow key focused

`mitigated` · WebKit (measured in Playwright's WebKit, October 2026)

- **What:** Tab into a radio group matches `:focus-visible`; moving with an arrow key then focuses the next
  radio without it, so a ring drawn from `:focus-visible` disappears after the first arrow.
- **Workaround:** `OriRadioGroup` and `OriSegmentedControl` set `data-ori-keyboard` on the group on keydown
  and clear it on pointerdown (`src/internal/keyboard-modality.ts`); radio.css and segmented-control.css also
  draw the ring from `:focus` under that attribute. Plain-HTML users set the attribute themselves.
- **When it can go:** once WebKit matches `:focus-visible` there. `e2e/segmented-control.spec.ts` checks the
  ring after an arrow key and fails in WebKit without the workaround.

## ORI-O-07 — three dependency majors are held back

`accepted` · each hold lifts on its own condition

- **Changesets 3 (with `changesets/action` v2):** it moves a prerelease's versioned changesets into
  `.changeset/pre/` and drops their list from `pre.json`. Taking over the v2 pre mode we are in is not
  reliable: a trial `changeset version` on the untouched v2 state put all 40 already-released changesets
  into the next rc's changelog. Upgrade right after `changeset pre exit`, when there is no pre state left.
- **TypeScript 7:** typescript-eslint 8.71 accepts `typescript <6.1.0`. Upgrade when it widens the range.
- **better-sqlite3 13** (the docs' Nuxt Content database): it builds from source with node-gyp on install,
  which fails on Windows without Visual Studio. Nuxt Content accepts `^12.5`, so the docs stay on 12.

## ORI-O-06 — `mdast-util-to-markdown` 2.1.3+ sends the docs build into endless recursion

`mitigated` · remark-mdc 3.11.1 with mdast-util-to-markdown ≥ 2.1.3 ([nuxt-content/remark-mdc#161](https://github.com/nuxt-content/remark-mdc/issues/161))

- **What:** since 2.1.3, bold and italic are written only through a handler's `attention` / `peek` properties.
  remark-mdc wraps the `strong` and `emphasis` handlers without copying them, so the wrapper calls itself:
  `/llms-full.txt` and `/raw/*.md` fail with "Maximum call stack size exceeded" and `docs:build` stops.
- **Workaround:** `overrides` in the root `package.json` pins `mdast-util-to-markdown` to exactly `2.1.2`. An
  override does not touch an already-resolved lockfile; changing it needs `package-lock.json` regenerated.
- **When it can go:** once a remark-mdc release copies those properties. Drop the override, regenerate the
  lockfile, and check that `docs:build` writes `llms-full.txt`.

## ORI-O-05 — `npm audit` reports advisories in dev tooling that have no fixed release

`accepted` · braces (via stylelint), node-forge (via the Nuxt CLI's dev certificates)

- **What:** every remaining advisory sits in build and docs tooling, with no patched version upstream. The
  published packages have no runtime dependencies, only peers, so nothing reaches a consumer.
- **Do not run `npm audit fix --force`:** it "fixes" these by downgrading Nuxt to 3 and the SMACSS order
  config to 1, which breaks the docs and the linter. Re-run `npm audit` after dependency updates instead.

## ORI-O-04 — npm refuses the unscoped name `oriui`

`accepted` · npm registry typosquatting filter

- **What:** npm's similarity filter rejects `oriui` as too close to `cliui` — a hard 403 on first publish.
  Names that normalize to the same token (`ori-ui`) are blocked too; scoped names bypass the filter.
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

## ORI-O-01 — Chromium leaves baked component colors stale after a runtime theme toggle

`mitigated` · Chromium 148–149

- **What:** flipping `ori-theme_dark` at runtime changes the inherited role tokens, but Chromium does not
  re-resolve a color an element has baked into a local custom property until its box is rebuilt. A bare
  `color: var(--ori-color-primary)` flips correctly, which makes it look like a token bug.
- **Reproduces only** in a real browser over HTTP with the full cascade — not in happy-dom, not from
  `file://`, not with a trimmed stylesheet.
- **Workaround:** `applyTheme` / `createThemeController` / `useTheme` (`@oriui/headless`, core `theme.ts`)
  force a style flush (a `display: none` toggle) around the class change. `@property` registration and
  literal fallbacks do not help.
- **When it can go:** once the oldest supported Chromium has the fix. Re-test with the docs skin switcher
  before touching `theme.ts`.
