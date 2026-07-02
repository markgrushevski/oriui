# @oriui/headless

[![npm](https://img.shields.io/npm/v/@oriui/headless?logo=npm&color=cb3837)](https://www.npmjs.com/package/@oriui/headless)
[![license](https://img.shields.io/npm/l/@oriui/headless?color=blue)](https://github.com/markgrushevski/oriui/blob/main/LICENSE)

Framework-agnostic **headless behavior** for [oriUI](https://oriui.vercel.app) (織り) — tiny state
machines + prop-getters behind a swappable contract. This is the **behavior** layer: focus, keyboard,
and ARIA wiring with no styles and no framework lock-in.

- **`@oriui/headless`** — the framework-agnostic engine: state machines, prop-getters, anatomy, and the
  `OriHeadless` contract. Components are exposed namespaced, mirroring Zag (`disclosure`, `combobox`).
- **`@oriui/headless/vue`** — the Vue 3 composables. _(A Svelte adapter is planned.)_

## Install

```bash
npm install @oriui/headless
```

`vue ^3.5` is an **optional** peer — needed only for the `./vue` adapter.

## Use — Vue

```ts
import { useDisclosure } from '@oriui/headless/vue';

const d = useDisclosure();
// d.open  → ComputedRef<boolean>
// d.setOpen(bool) · d.toggle()
// spread the prop bags onto your own elements:
// d.rootProps · d.triggerProps · d.contentProps
```

Also ships `useDialog` (native `<dialog>`: focus-trap, `Esc`, `::backdrop`, top-layer) and
`useCombobox`. Provide your own engine (Zag / custom) through `provideHeadless()` / the `OriHeadless`
plugin — the component markup never changes.

## Use — the engine directly

The core is framework-agnostic building blocks, so you can write an adapter for any framework:

```ts
import { combobox } from '@oriui/headless';
// combobox.machine · combobox.connect · combobox.anatomy — the contract every adapter implements
```

**[Full docs → oriui.vercel.app](https://oriui.vercel.app)**

> **Alpha** (`1.0.0-alpha.*`, `alpha` dist-tag). APIs may shift before `1.0.0`.

## License

[MIT](https://github.com/markgrushevski/oriui/blob/main/LICENSE) © Leonid
