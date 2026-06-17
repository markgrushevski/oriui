# Review checklist

The bar a change must clear before it's "done". The **mechanical** layer (formatting, lint, types,
tests, build) is gated by CI — don't hand-check what tooling already enforces:

```sh
npm run lint:ci      # prettier --check + stylelint + eslint (no auto-fix)
npm run types        # vue-tsc on the library
npm run test:types   # vue-tsc on the test suite
npm run test         # vitest + axe
npm run build        # packages -> lib -> .d.ts
```

This file is the **judgment** layer on top: the design/quality criteria tooling can't assert.
Companion to [CLAUDE.md](CLAUDE.md) (conventions / how) and [DECISIONS.md](DECISIONS.md) (rationale / why).

## How to apply it

- **Default** — self-review the diff against the relevant sections before committing.
- **Diff review** — `/code-review` (low→high effort) for an extra pass with `--fix`/`--comment`;
  `/code-review ultra` (cloud, multi-agent, billed) for big milestones, not routine changes.
- A criterion that's deliberately not met is fine **if** the exception is recorded in
  [DECISIONS.md](DECISIONS.md) — otherwise it's a finding.

## A new or changed component

### Accessibility — the headline contract

- [ ] State is **real attributes, not classes**: native `disabled` (or `aria-disabled` + `tabindex="-1"`
      on a non-`<button>`), `aria-busy` while loading, `aria-pressed` / `data-active` for toggles,
      `aria-invalid` for errors.
- [ ] Every control has an accessible name (visible `<label>` tied by `for`/`id`, `aria-label`, or text);
      decorative graphics (icons, spinners inside a labelled control) are `aria-hidden="true"`.
- [ ] Focus is always visible — `:focus-visible` (buttons/links) or `:focus` (fields); never
      `outline: none` without an equivalent ring.
- [ ] Helper / error text is wired via `aria-describedby` that references **only rendered** elements
      (no dangling ids); errors use `role="alert"`.
- [ ] The component's test is **axe-clean**.

### Tokens & theming

- [ ] Reads the resolved **aliases** (`--ori-size-action`, `--ori-color`, `--ori-shadow-*`), never raw
      scale tokens (`--ori-size-action_md`) directly.
- [ ] No hardcoded hex in a component — colour comes from role tokens; any new role/on-role pair is
      WCAG AA (and therefore caught by `tests/tokens.contrast.test.ts`).
- [ ] Theming stays **zero-runtime** — switching skin/size/variant is a class or attribute toggle, no JS.

### Component API

- [ ] Props use **reactive props destructure** (Vue 3.5), not `withDefaults`; every prop referenced in
      `<script>` is destructured, defaults co-located. A prop feeding a composable/`watch` is passed as a
      getter.
- [ ] Props are optional and **alphabetical**; one is required only when the component is incorrect
      without it (e.g. an accessible label for an icon-only control).
- [ ] Two-way state uses `defineModel`; for form controls, native attributes fall through to the real
      element (`inheritAttrs: false` + `v-bind="$attrs"`).
- [ ] Imports: types from `../../types`, sibling components directly — **never** the root barrel `../../`.
- [ ] Naming: `Ori*` component; `ori-block`, `ori-block__element`, `ori-block_modifier` classes.

### CSS & cascade

- [ ] Structure via BEM classes; variant / size / colour ride the shared utilities + the two-tier token
      pattern (a class repoints one alias).
- [ ] Specificity stays flat — `:where()`, no `.a.a_b` stacking; dynamic state via **attribute selectors**,
      not extra classes.
- [ ] Hover is wrapped in `@media (hover: hover)`; state colours derive via `color-mix(in srgb, …)`.
- [ ] `<style>` is unscoped, `ori-`-prefixed, and the markup works as standalone `.ori-*` — the css layer
      ships without Vue.

### SSR & correctness

- [ ] Any Teleport/portal is gated on a `mounted` ref (the library can't use Nuxt `<ClientOnly>`).
- [ ] Element ids come from `useId()` (SSR-safe), not ad-hoc counters.

### Tests

- [ ] A `tests/<name>.test.ts` covers the **behaviour + a11y contracts** (real attributes, roles, focus
      guards) and runs axe; form controls also assert `v-model` and attribute passthrough.
- [ ] Token changes are reflected in the contrast test.

### Docs

- [ ] Single-source page: a class-reference table + **live Vue/HTML examples**; the component is
      registered globally for MDC and added to the sidebar.

### Build & packaging

- [ ] `vue-tsc` clean; `@oriui/*` stay **external** in the lib build; tree-shakeable (importing one
      component doesn't pull the others).

## Sign-off

A change is done when **CI is green** and every applicable box above is checked — or the gap is a
recorded decision, not an oversight.
