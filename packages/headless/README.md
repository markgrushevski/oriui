# @oriui/headless

[![npm](https://img.shields.io/npm/v/@oriui/headless?logo=npm&color=cb3837)](https://www.npmjs.com/package/@oriui/headless)
[![license](https://img.shields.io/npm/l/@oriui/headless?color=blue)](https://github.com/markgrushevski/oriui/blob/main/LICENSE)

The behavior behind [oriUI](https://oriui.vercel.app)'s (織り) Vue components, without markup or
styles: focus, keyboard and ARIA as small state machines and prop-getters, behind a contract that lets
you swap the engine for one widget.

- **`@oriui/headless`** — the framework-agnostic engine: state machines, prop-getters, anatomy, and the
  `OriHeadless` contract. Components are exposed namespaced, mirroring Zag (`disclosure`, `combobox`).
- **`@oriui/headless/vue`** — the Vue 3 composables (return Vue `ComputedRef`s).

## Install

```bash
npm install @oriui/headless
```

`vue ^3.5` is an **optional** peer: the Vue adapter (`./vue`) needs it, the framework-free core does not.

## Use — Vue

```ts
import { useDisclosure } from '@oriui/headless/vue'

const d = useDisclosure()
// d.open  → ComputedRef<boolean>
// d.setOpen(bool) · d.toggle()
// spread the prop bags onto your own elements:
// d.rootProps · d.triggerProps · d.contentProps
```

Also ships `useDialog` (native `<dialog>`: focus-trap, `Esc`, `::backdrop`, top-layer), `useCombobox`,
`useMenu`, `useToolbar`, and `useColorPicker`, plus the `useToken` / `useTheme` bridges. The
machine-based behaviors (Disclosure / Dialog / Combobox / Menu) each take a swappable engine
(Zag / custom) through `provideHeadless()` / the `OriHeadless` plugin — the component markup never
changes. (`useToolbar` / `useColorPicker` are compositional helpers, not adapter-backed.)

## Use — the engine directly

The core is framework-agnostic building blocks, so you can write an adapter for any framework:

```ts
import { combobox } from '@oriui/headless'
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
import { useThemeColor } from '@oriui/headless/vue'

const brand = useThemeColor('primary') // resolves --ori-color-primary, e.g. 'rgb(25, 118, 210)'
onMounted(() => {
    engine = createEngine(canvasEl.value)
    engine.setColor(brand.value || null) // seed the initial resolved color
})
watch(brand, (c) => engine?.setColor(c || null)) // theme/skin flips re-push automatically
```

The core exports the primitives directly: `resolveToken('--ori-color-primary')` (one-shot) and
`observeTheme(callback)` (skin class/style mutations + OS scheme flips; returns an unsubscribe).

**[Full docs → oriui.vercel.app](https://oriui.vercel.app)**

## License

[MIT](https://github.com/markgrushevski/oriui/blob/main/LICENSE) © Leonid
