# @oriui/vue

[![npm](https://img.shields.io/npm/v/@oriui/vue?logo=npm&color=cb3837)](https://www.npmjs.com/package/@oriui/vue)
[![license](https://img.shields.io/npm/l/@oriui/vue?color=blue)](https://github.com/markgrushevski/oriui/blob/main/LICENSE)

Styled **Vue 3** components for [oriUI](https://oriui.vercel.app) (織り) — ready `<Ori*>` components
composed from the headless behavior ([`@oriui/headless`](https://npmjs.com/package/@oriui/headless)) +
standalone CSS ([`@oriui/css`](https://npmjs.com/package/@oriui/css)) layers. This is the
batteries-included **styled** layer: _prototype fast, scale without rewriting_.

## Install

```bash
npm install @oriui/vue
```

Pulls in `@oriui/css` + `@oriui/headless` automatically; `vue ^3` is a peer dependency.

## Use

Import the stylesheet once (e.g. in your entry file), then the components:

```ts
import '@oriui/css'; // tokens + .ori-* classes, once
import { OriButton } from '@oriui/vue';
```

```vue
<OriButton text="Save" variant="tonal" color="primary" size="lg" />
```

Dynamic state is driven by real **attributes** (`disabled`, `aria-busy`), never classes — the
a11y-correct source of truth. Theme + skin are attributes on `<html>` (`class="dark"`,
`data-ori-skin="…"`), reskinning everything through CSS variables with zero runtime.

## Make it yours

Same components, your brand — through a small, stable surface, ordered safest → most manual. You rarely
need custom CSS; reach for these first:

- **Props** — `variant` (`fill` / `tonal` / `outline` / `text` / `plain`), `color` (semantic roles with
  a built-in contrast guarantee), `size`, `radius`. Say _what_ you mean; the accessible
  background/text pairing is handled for you, and it follows every theme + skin for free.
- **Rebrand with tokens** — repoint a few CSS custom properties in your own `:root` (e.g.
  `--ori-color-primary-light`). oriUI ships every rule inside `@layer`, so your unlayered override wins
  with **no `!important`** and no specificity fight.
- **A whole palette** — author a named **skin**, or flip light/dark at runtime with
  [`useTheme`](https://oriui.vercel.app/headless/use-theme).
- **One-off** — repoint `--ori-color` / `--ori-color-on` on a single element (the escape hatch).

Reaching for a prop or token instead of overriding `.ori-*` rules is also **upgrade-safe** — props and
tokens are the stable public API; internal component styles can change between versions.

**Recipes →** [Customization](https://oriui.vercel.app/guides/customization) ·
[Theming & skins](https://oriui.vercel.app/guides/theming) ·
[Design tokens](https://oriui.vercel.app/guides/design-tokens)

## Layers

Start here; drop a layer when you need more control, without rewriting — the token contract is shared:

- [`@oriui/headless`](https://npmjs.com/package/@oriui/headless) — behavior only (focus / keyboard /
  ARIA), your own markup.
- [`@oriui/css`](https://npmjs.com/package/@oriui/css) — standalone `.ori-*` classes + tokens, no
  framework.

**[Full docs → oriui.vercel.app](https://oriui.vercel.app)** — a page per component with live demos,
props, and a11y notes.

## TypeScript & editor support

Every component and composable ships hand-checked `.d.ts` types, so prop names, unions (`variant`,
`color`, `size`…) and composable signatures autocomplete and type-check out of the box. The package
also ships its `src`, so **go-to-definition lands on the real, commented source** and sourcemaps
resolve. Editors need a Vue language service for template prop hints — **VS Code:** the
[Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension;
**WebStorm:** the bundled Vue plugin. If hints don't appear right after installing/upgrading, the
editor's dependency index is usually stale — reload the TS server (VS Code) or _Invalidate Caches /
Restart_ (WebStorm).

> **Alpha** (`1.0.0-alpha.*`, `alpha` dist-tag). `npm i @oriui/vue` works today; APIs may shift before
> `1.0.0`.

## License

[MIT](https://github.com/markgrushevski/oriui/blob/main/LICENSE) © Leonid
