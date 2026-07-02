# @oriui/css

[![npm](https://img.shields.io/npm/v/@oriui/css?logo=npm&color=cb3837)](https://www.npmjs.com/package/@oriui/css)
[![license](https://img.shields.io/npm/l/@oriui/css?color=blue)](https://github.com/markgrushevski/oriui/blob/main/LICENSE)

Standalone CSS design tokens + `.ori-*` utility classes for [oriUI](https://oriui.vercel.app) (織り).
**No framework, no build step** — just classes and zero-runtime theming through CSS custom properties.
Works with plain HTML, htmx, Astro, Svelte, or any framework. This is the **style** layer.

## Install

```bash
npm install @oriui/css
```

…or drop the stylesheet in directly, no bundler:

```html
<link rel="stylesheet" href="https://unpkg.com/@oriui/css/dist/styles.css" />
```

## Use

Import once (bundler), then use the classes anywhere:

```js
import '@oriui/css';
```

```html
<button class="ori-button ori-variant_tonal ori-color_primary ori-button_lg">Save</button>
```

## The class model

A **block class** plus **single-class token utilities** — one class repoints one token, no paired base
class. A bare block is valid; add a class only to override an axis. Dynamic state is real **attributes**
(`disabled`, `aria-busy`), never classes.

| Axis    | Class               | Values                                                               |
| ------- | ------------------- | -------------------------------------------------------------------- |
| Color   | `ori-color_*`       | `primary` · `secondary` · `success` · `warn` · `danger` · `info` · … |
| Variant | `ori-variant_*`     | `fill` · `tonal` · `outline` · `text` · `plain`                      |
| Size    | `ori-<name>_<size>` | `xs` · `sm` · `md` · `lg` · `xl` · `xxl`                             |

Theme + skin are attributes on `<html>` (`class="dark"`, `data-ori-skin="…"`), reskinning everything
through CSS variables with zero runtime.

## Layers

- [`@oriui/vue`](https://npmjs.com/package/@oriui/vue) — styled Vue components on these tokens.
- [`@oriui/headless`](https://npmjs.com/package/@oriui/headless) — framework-agnostic behavior.

**[Full docs → oriui.vercel.app](https://oriui.vercel.app)**

> **Alpha** (`1.0.0-alpha.*`, `alpha` dist-tag). APIs may shift before `1.0.0`.

## License

[MIT](https://github.com/markgrushevski/oriui/blob/main/LICENSE) © Leonid
