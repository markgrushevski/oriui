# oriUI roadmap

The vision and phased plan for evolving this project. Day-to-day guidance lives in
[CLAUDE.md](CLAUDE.md).

## Idea

**oriUI** (織り, "weaving") weaves independent layers around shared design tokens.
Key feature: **prototype fast, scale without rewriting** — start with styled components,
drop to headless behavior or raw CSS when you need control, without rewriting, because
the tokens are shared across every layer.

Layers (each independently consumable via subpath exports):

- `@oriui/vue` — styled components (behavior + style composed)
- `@oriui/headless` — behavior contract; swappable adapter (native / Zag / your own)
- `@oriui/css` — standalone CSS classes + tokens (Tailwind-free, DaisyUI-like)

The `@oriui/css` layer needs **no JS framework** — server-rendered **htmx**, Astro, and plain HTML
are first-class scenarios (just classes + zero-runtime token theming).

Design system = **token contract + skins** (default neutral, signature "ori" / 織り,
preset gallery; Material 3 / iOS as optional skins). Platform: web-first with mobile-first
styling; optional `hybrid` (Capacitor) mode. Ambition: portfolio-grade (clean architecture,
a11y, tests, strong docs).

## Phases

1. ✅ **Modernize toolchain** — Vite 8, TS 6, vue-tsc 3, ESLint 10, stylelint 17; vue-tsc dts emit.
2. ✅ **Rebrand vueinjar → oriUI** — `ori-*` / `Ori*`, `src/` layout, types extracted, 1.0.0-alpha.0.
3. ✅ **Foundation** — token contract (`@layer`, neutral ramp + semantic on-color), neutral + ori
   skins (light/dark), mobile-first touch sizes + safe-area, standalone `@oriui/css` subpath.
4. ✅ **Headless layer** — swappable behavior **contract** (`OriHeadless` plugin): **native** zero-dep
   adapters for both the simple primitives (Disclosure ✅) and the dialog (native `<dialog>` ✅), or
   bring-your-own. (Superseded "own ↔ Reka" and "Zag for complex" — see DECISIONS.md.) `OriDialog` ships
   in `@oriui/vue`. **Two framework adapters over the one framework-agnostic core**: `@oriui/headless/vue`
   (Vue `ComputedRef`s) and `@oriui/headless/svelte` (Svelte stores) — `useDisclosure`/`useDialog`/
   `useCombobox`/`useMenu` at full parity, proving the "behavior travels between frameworks" thesis.
5. 🔄 **Styled components** — **31 shipped** (actions, forms, overlays, layout, feedback, navigation,
   data display), each with state-via-attributes + focus-visible a11y and a Vitest+axe suite. Remaining:
   the `glass` variant; the catalog grows from [IDEAS.md](IDEAS.md) as real screens need it.
6. 🔄 **Testing** — Vitest + happy-dom + `@vue/test-utils` + axe (**456 tests**): behavior/a11y
   contracts, OriDialog on a fake adapter, **executable token-contrast** (every skin's role/on-role pair
   asserted WCAG AA — already caught a real Sumi failure). Chose VTU over Testing Library (DECISIONS.md).
   ✅ **Playwright e2e** (`e2e/`, real Chromium — `.ori-anchored` placement + collision flip + the
   Popover API, asserted against the built CSS layer); remaining: broader visual-regression snapshots.
7. 🔄 **Docs** — a **Nuxt 4 + Nuxt Content 3** app, its own UI built on oriUI itself (not VitePress).
   ✅ a full page per component (31 — intro + classes + props/slots + a11y, with live demos on the page,
   so there is no separate `/playground` route); ✅ `nuxt-llms` (`/llms.txt` + `/llms-full.txt`); ✅ a
   one-page consumer cheat-sheet. Remaining:
    - ✅ **framework-switchable examples (Vue ↔ Svelte)** — the Svelte tab now ships real code: the
      behaviour-driven components (Combobox / Dialog / Menu) and the headless pages show
      `@oriui/headless/svelte`; the CSS components are covered by the HTML tab (standalone `.ori-*` — also
      the htmx / Astro / Svelte-static path). The switcher shows Svelte only where a real `#svelte` block ships;
    - ✅ an **applicability matrix** (`overview/applicability` — layer × Vue / Svelte / Astro / htmx, plus
      the Nuxt / SvelteKit / Capacitor / Electron runtime shells that inherit their framework column);
    - ✅ a **theme / skin gallery** page (`guides/skins` — the 7 skins, each clickable to reskin the whole
      site live via `useOriTheme`, demonstrating the zero-runtime theming);
    - an **idea + comparisons** page.
8. ✅ **CI/CD + deploy** — ✅ **GitHub Actions** quality gate (`lint → types → test → build → size` on
   push/PR, Node 22 + 24; check-mode `lint:ci`, including the `@oriui/css` layer) + Codecov upload. ✅ a
   **size budget** (`size-limit`, `.size-limit.json`) fails CI on a CSS/JS bundle regression, guarding the
   zero-runtime promise; a bundlephobia minzip badge in the README. ✅ **Vercel
   deploy** — `main` auto-deploys the static docs (`nuxi generate` → `docs/.output/public`). ✅ **Automated
   release** — `changesets` in alpha pre mode (a **fixed** lockstep group of the three packages) + a CI
   publish job (`changesets/action` + OIDC Trusted Publishing); runbook in [RELEASING.md](RELEASING.md). ✅ root
   **README** with status/coverage badges. Operational note: after the package rename all three packages
   are live on npm at `1.0.0-alpha.2` (the `alpha` dist-tag).

## Deferred / out of scope (for now)

- Full hybrid/Capacitor mode (haptics, native gestures); iOS adaptive skin.
- Optional Tailwind v4 preset adapter; monorepo split `@oriui/*` (started: `@oriui/headless`,
  `@oriui/headless`; full split + pnpm/changesets deferred).
- **Headless** for **no-framework / htmx** via Zag's `@zag-js/vanilla` behind the contract
  (an `@oriui/vanilla` adapter) — complex behavior (focus-trap, roving-tabindex) without a framework.
- **Native platform dialogs / Popover API — a separate feature track** (idea, do later). Lean on the
  platform: `popover` + `popovertarget` (non-modal — menus, tooltips, dropdowns; light-dismiss, top-layer)
  and `<dialog>` + `showModal()` / `::backdrop` (modal — built-in focus trap, `Esc`, top-layer), optionally
  triggered by the new `command` / `commandfor` invokers. **Zero-JS** for the `@oriui/css` / htmx layer — a
  lighter path than `@zag-js/vanilla` for simple cases, or a native adapter behind the headless contract.
  Caveats: baseline support (popover & `<dialog>` ~2024; invokers newer → progressive enhancement) and
  top-layer / `::backdrop` styling.
- Component catalog expansion (forms, overlays) — after the foundation. Candidate components,
  classes, and tokens are parked in [IDEAS.md](IDEAS.md) (a backlog, not committed scope — pulled in
  only when a real screen needs it).
- **Ionic is deliberately NOT a target** (it's a competitor, not a backend; Capacitor is
  supported without it via the planned hybrid mode).
