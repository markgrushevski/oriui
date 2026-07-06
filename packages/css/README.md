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

## À-la-carte imports

Don't need every component? Import a foundation once, then only the component blocks you use —
**foundation first** (`base.css` or `tokens.css`), it declares the cascade-layer order the component
files rely on. What each entry contains:

| Entry                           | Layer order | Reset | Tokens + skins | Utilities | Component styles   |
| ------------------------------- | :---------: | :---: | :------------: | :-------: | ------------------ |
| `@oriui/css` (= `styles.css`)   |     yes     |  yes  |      yes       |    yes    | all                |
| `@oriui/css/base.css`           |     yes     |  yes  |      yes       |    yes    | —                  |
| `@oriui/css/tokens.css`         |     yes     |   —   |      yes       |    yes    | —                  |
| `@oriui/css/reset.css`          |      —      |  yes  |       —        |     —     | —                  |
| `@oriui/css/components/<n>.css` |      —      |   —   |       —        |     —     | one (deps inlined) |

`reset.css` is border-box + Meyer-style margin/padding/border zeroing for **your page**, nothing more
(it no longer pins `html { font-size }` — the rem base follows the user's browser setting). The
components don't need it: each block declares its own box-sizing / UA neutralization.

```js
import '@oriui/css/base.css';
import '@oriui/css/components/button.css';
import '@oriui/css/components/card.css';
```

Per-component files are **self-contained**: the blocks a component renders are inlined (`button.css`
carries the icon + spinner styles, `combobox.css` the input field + the `anchored` placement
primitive), so no component ships half-styled. Importing files with overlapping dependencies
duplicates those rules — harmlessly: identical rules in the same `@layer` resolve identically, and
gzip eats most of the byte cost.

`import '@oriui/css'` (the full bundle, also `@oriui/css/styles.css`) is unchanged and includes everything.

> The components are **reset-independent**: they render identically with `base.css` or with
> `tokens.css` alone (bring-your-own-reset), guarded by a computed-style diff over every component in
> real Chromium (`e2e/reset-independence.spec.ts`).

> TypeScript note: under TypeScript 6's `noUncheckedSideEffectImports`, bare CSS subpath imports
> (`import '@oriui/css/base.css'`) are errors unless the compiler can type them. Either set
> `noUncheckedSideEffectImports: false`, or add an ambient declaration:
> `declare module '@oriui/css/*.css';` (most bundler-first setups ship one already).

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
