# @oriui/headless

[![npm](https://img.shields.io/npm/v/@oriui/headless?logo=npm&color=cb3837)](https://www.npmjs.com/package/@oriui/headless)
[![license](https://img.shields.io/npm/l/@oriui/headless?color=blue)](https://github.com/markgrushevski/oriui/blob/main/LICENSE)

Framework-agnostic **headless behavior** for [oriUI](https://oriui.vercel.app) (織り) — tiny state
machines + prop-getters behind a swappable contract. This is the **behavior** layer: focus, keyboard,
and ARIA wiring with no styles and no framework lock-in.

- **`@oriui/headless`** — the framework-agnostic engine: state machines, prop-getters, anatomy, and the
  `OriHeadless` contract. Components are exposed namespaced, mirroring Zag (`disclosure`, `combobox`).
- **`@oriui/headless/vue`** — the Vue 3 composables (return Vue `ComputedRef`s).
- **`@oriui/headless/svelte`** — the Svelte 5 composables (return Svelte stores). Same engine, same
  behavior; only the reactive wrapper differs per framework.

## Install

```bash
npm install @oriui/headless
```

`vue ^3.5` and `svelte ^5` are **optional** peers — each needed only for its own adapter (`./vue` /
`./svelte`). A Vue app carries no Svelte, and vice-versa.

## Use — Vue

```ts
import { useDisclosure } from '@oriui/headless/vue';

const d = useDisclosure();
// d.open  → ComputedRef<boolean>
// d.setOpen(bool) · d.toggle()
// spread the prop bags onto your own elements:
// d.rootProps · d.triggerProps · d.contentProps
```

Also ships `useDialog` (native `<dialog>`: focus-trap, `Esc`, `::backdrop`, top-layer), `useCombobox`,
`useMenu`, `useToolbar`, and `useColorPicker`, plus the `useToken` / `useTheme` bridges. The
machine-based behaviours (Disclosure / Dialog / Combobox / Menu) each take a swappable engine
(Zag / custom) through `provideHeadless()` / the `OriHeadless` plugin — the component markup never
changes. (`useToolbar` / `useColorPicker` are compositional helpers, not adapter-backed.)

## Use — Svelte

```ts
import { useDisclosure } from '@oriui/headless/svelte';

const d = useDisclosure();
// d.open  → Readable<boolean>  (auto-subscribe with $open)
// d.setOpen(bool) · d.toggle()
// spread the prop bags onto your own elements:  <button {...$triggerProps}>
// d.rootProps · d.triggerProps · d.contentProps  → Readable<Record<string, unknown>>
```

Same surface as Vue (`useDialog` / `useCombobox` / `useMenu`, `provideHeadless()`), returning Svelte
stores instead of `ComputedRef`s and lowercased event handlers (`onclick`). Item prop-getters are a
store of a function — `$getOptionProps(item, i)`. `useCombobox` / `useMenu` take a plain options object
**or a store** (`MaybeReactive`) — pass a store to react to a changing option list / `disabled`.

**SSR note:** the Vue adapter's ids come from `useId()` (SSR-stable); Svelte has no framework `useId()`
callable outside component init, so it falls back to a module counter. Under SSR, pass an explicit `id`
to the composable so the server and client markup match.

## Use — the engine directly

The core is framework-agnostic building blocks, so you can write an adapter for any framework:

```ts
import { combobox } from '@oriui/headless';
// combobox.machine · combobox.connect · combobox.anatomy — the contract every adapter implements
```

## Reading tokens from JS

Canvas/WebGL/chart renderers (Konva, ECharts, …) paint outside the CSS cascade but should still follow
the active skin. The token bridge resolves `--ori-*` tokens to their **computed** values —
`getComputedStyle().getPropertyValue('--x')` only returns the unresolved `var()` chain — and re-resolves
on theme changes. Colors-only MVP: the token must resolve to a `<color>`. The value is `''` during SSR
and before mount (the first client frame renders without it); in dev builds, a token that genuinely
fails to resolve warns once per token.

```ts
import { useThemeColor } from '@oriui/headless/vue'; // or /svelte — same surface, stores instead of refs

const brand = useThemeColor('primary'); // resolves --ori-color-primary, e.g. 'rgb(25, 118, 210)'
onMounted(() => {
    engine = createEngine(canvasEl.value);
    engine.setColor(brand.value || null); // seed the initial resolved color
});
watch(brand, (c) => engine?.setColor(c || null)); // theme/skin flips re-push automatically
```

The core exports the primitives directly: `resolveToken('--ori-color-primary')` (one-shot) and
`observeTheme(callback)` (skin class/style mutations + OS scheme flips; returns an unsubscribe).

**[Full docs → oriui.vercel.app](https://oriui.vercel.app)**

> **Alpha** (`1.0.0-alpha.*`, `alpha` dist-tag). APIs may shift before `1.0.0`.

## License

[MIT](https://github.com/markgrushevski/oriui/blob/main/LICENSE) © Leonid
