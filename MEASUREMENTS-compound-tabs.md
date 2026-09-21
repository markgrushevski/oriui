# Compound Tabs — the prototype and what it measured

**Branch:** `poc/compound-tabs`, not merged. Built 2026-09-21 to answer step 4 of the approved API
plan: _"build compound Tabs on a branch beside the current one, measure SSR / size / the real call
site, then decide on the numbers."_

The prototype is `packages/vue/src/components/tabs-compound/` — `OriTabsC` (root, owns the registry
and the selection), `OriTabList` (the `role="tablist"` + one roving keydown), `OriTab` (registers
itself, renders its own button), `OriTabPanel`. It is Vue-only and deliberately bypasses
`@oriui/headless` — see cost 4 below, which is exactly what that bypass measures.

Every number here is reproducible on this branch:

- `npx vitest run tests/poc-ssr-compound.test.ts --silent=false --reporter=verbose`
- `npx vitest run tests/poc-ssr-registry-root.test.ts --silent=false --reporter=verbose`
- `npx vitest run tests/poc-compound-tabs.test.ts`
- size: swap `.size-limit.json` for the two `import:` entries quoted below, then `npx size-limit`

---

## 1. SSR — the plan's blocker is real, and belongs to the OTHER design

The plan recorded: _"with naive provide/inject registration the SSR tablist serializes empty
(measured: 0 tab buttons in the SSR string)"._ Both designs below are provide/inject registration;
only one loses its tabs (`tests/poc-ssr-registry-root.test.ts`):

| design                                                                               | SSR output                                                                    |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| **A** root renders the buttons from what children registered                         | `<div role="tablist"></div>` — **0 tabs**                                     |
| **B** children render themselves (the prototype, and Vuetify / Element Plus / Naive) | `<button role="tab">One</button><button role="tab">Two</button>` — **2 tabs** |

A loses because the root's render runs before any child's setup. B is immune because each child
serializes itself, in order, after registering itself. This is PrimeVue's "each component must render
itself" — the sentence the earlier audit quoted backwards.

So SSR is **not** a reason to reject compound.

## 2. SSR — what compound genuinely cannot do: heal an invalid selection

`tests/poc-ssr-compound.test.ts`, three tabs where the third is disabled:

| bound value                | array API (shipped)                           | compound prototype                     |
| -------------------------- | --------------------------------------------- | -------------------------------------- |
| none                       | 3 tabs / 3 panels / 1 visible, tab 0 selected | identical — 3 / 3 / 1, `one` selected  |
| `"two"`                    | tab 1 selected                                | `two` selected                         |
| `"three"` (disabled)       | **heals** → tab 0 selected                    | **selects the disabled tab**           |
| `"ghost"` (not in the set) | **heals** → tab 0 selected                    | **nothing selected, 0 visible panels** |

The array API resolves the selection synchronously from the list it was handed, so an invalid bound
value is corrected before the first byte is written. A compound root cannot: at the moment the first
tab serializes, the registry holds only that tab, so validating a bound value against it would select
the wrong tab whenever the real one registers later — a guaranteed hydration mismatch. The only
SSR-safe rule is "a bound value wins unconditionally", which is precisely how the two failures above
arise. Healing can then only happen after mount, i.e. as a visible flash.

This is not hypothetical for the one real consumer: justpaint's `AuthForm.vue:39-42` exists solely to
bridge a narrowed union into `string | number | undefined`, because the bound value can be out of set.

## 3. Size — a wash

Measured with `size-limit` against the real built barrel, `vue` external in both cases:

| bundle                                          | gzip        |
| ----------------------------------------------- | ----------- |
| `{ OriTabs }` including its `useTabs` behaviour | **1.48 kB** |
| `{ OriTabsC, OriTabList, OriTab, OriTabPanel }` | **1.58 kB** |
| both shipped side by side                       | 2.38 kB     |

+100 B, +7%. Size is not an argument in either direction. (Excluding `@oriui/headless/vue` as external
flatters the array API to 630 B against compound's 1.31 kB — that comparison is not honest, because
the behaviour the array API imports is the behaviour the compound version inlines.)

## 4. The call site — it depends entirely on whether panels share a template

**Distinct panels** (the docs' Basic example, three tabs): array 13 lines → compound 11 lines.
Compound is ~15% shorter and reads better; the array API names each value twice (in the array and in
`#panel-<value>`), and a typo there is a silent miss — which is why the SFC ships a DEV-only warning
for exactly that mistake.

**A shared panel body** (justpaint's `AuthForm`, the only real consumer): array 35 lines — 31 of
template plus the 4-line `AUTH_TABS` — against compound's **62 lines**, +77%. The two tabs render the
same form, and compound has no "one template, every panel" mechanism: the body must be repeated per
panel, extracted into a component, or `v-for`-ed over an array — which is the array API, moved into
the caller's file.

## 5. The costs the prototype cannot pay off

- **Cross-framework.** `useTabs` is 315 lines across Vue / React / Svelte over ONE shared core
  machine, with 14 headless tests. A compound root has no shared core: the registry is Vue
  provide/inject, React context with a rendered provider (already a recorded React-only deviation for
  the toolbar), Svelte `setContext`. Three implementations, three suites — and the styled tier stops
  using the composable the library ships.
- **Docs.** 10 inline MDC demos (`:ori-tabs{:tabs='…'}`) cannot be expressed compound at all; each
  needs a bespoke wrapper component like `MenuDemo`. Accordion, which the plan says follows Tabs,
  would add 14 more.
- **Migration.** 41 unit tests, 14 headless tests, 7 e2e, 420 + 200 doc lines, and 12 selectors that
  pin rendered ids — which change, because compound ids must derive from the value (`-tab-0` →
  `-tab-one`).

## Verdict

**Tabs stays array-driven.** Compound wins on shape-fidelity (12-to-1 among styled libraries) and on
the distinct-panel call site, and costs nothing in bytes. It loses on the one axis that has no
workaround — synchronous, SSR-correct recovery from an invalid selection — and it makes the only real
call site 77% longer. The decisive asymmetry: the defect compound would make structurally impossible
(the `#default` fan-out, ORI-I-84 / ORI-I-87) is fixable directly, while the healing compound gives up
is not recoverable in a compound shape at all.
