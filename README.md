# oriUI 織り

[![CI](https://github.com/markgrushevski/oriui/actions/workflows/ci.yml/badge.svg)](https://github.com/markgrushevski/oriui/actions/workflows/ci.yml)
[![Release](https://github.com/markgrushevski/oriui/actions/workflows/release.yml/badge.svg)](https://github.com/markgrushevski/oriui/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@oriui/vue?logo=npm&color=cb3837)](https://www.npmjs.com/package/@oriui/vue)
[![minzip](https://img.shields.io/bundlephobia/minzip/@oriui/vue?label=minzip&color=44cc11)](https://bundlephobia.com/package/@oriui/vue)
[![codecov](https://codecov.io/gh/markgrushevski/oriui/branch/main/graph/badge.svg)](https://codecov.io/gh/markgrushevski/oriui)
[![license](https://img.shields.io/npm/l/@oriui/vue?color=blue)](LICENSE)

A design system in plain CSS, with accessible Vue components built on it.

| Package                                                        | What it is                                                                                          |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`@oriui/css`](https://npmjs.com/package/@oriui/css)           | Design tokens and a stylesheet per component. No JavaScript, no build step; works in any stack.     |
| [`@oriui/vue`](https://npmjs.com/package/@oriui/vue)           | 38 Vue 3 components that render those classes and handle keyboard, focus, ARIA and forms.           |
| [`@oriui/headless`](https://npmjs.com/package/@oriui/headless) | The components' behavior on its own, for your own markup: a framework-free core with a Vue adapter. |

- **Theming is CSS.** Skins, dark mode, sizes and variants are custom properties switched by a class or
  an attribute. No colors are computed in JavaScript, and there is no Tailwind dependency.
- **State is real attributes** — `disabled`, `aria-pressed`, `aria-invalid` — so the CSS reads the same
  state with or without the Vue components.
- **Accessibility is tested.** axe runs against every component, every color pair passes WCAG AA contrast
  in every skin, and keyboard behavior is exercised in real Chromium.
- **Behavior is replaceable.** Dialog, disclosure, combobox and menu run through a contract, so you can
  plug in another engine for one widget without changing its markup.

## Install

```bash
npm install @oriui/vue   # the components; @oriui/css and @oriui/headless come as peers
npm install @oriui/css   # or only the CSS
```

## Use with Vue

```ts
import '@oriui/css' // once, in your entry file
import { OriButton } from '@oriui/vue'
```

```vue
<OriButton label="Save" variant="soft" color="primary" size="lg" />
```

## Use the CSS anywhere

```html
<link rel="stylesheet" href="https://unpkg.com/@oriui/css/dist/styles.css" />

<button class="ori-button ori-button_lg ori-variant_soft ori-color_primary">Save</button>
```

## The class model

A **block class** plus **single-class token utilities**: one class repoints one token. The block has
defaults, so a bare block is valid; add a class only to change an axis. Dynamic state is an
**attribute** (`disabled`, `aria-busy`), never a class.

| Axis    | Class               | Values                                                                  |
| ------- | ------------------- | ----------------------------------------------------------------------- |
| Color   | `ori-color_*`       | `primary` · `secondary` · `success` · `warning` · `danger` · `info` · … |
| Variant | `ori-variant_*`     | `solid` · `soft` · `outline` · `text` · `quiet`                         |
| Size    | `ori-<name>_<size>` | `xs` · `sm` · `md` · `lg` · `xl` · `xxl`                                |
| Radius  | `ori-size-radius_*` | `none` · `xs` · `sm` · `md` · `lg` · `xl` · `full`                      |

`color` is the **role** and `variant` the **mapping**, so there is no separate background color. Theme
and skin are set on `<html>` (`class="dark"`, `data-ori-skin="cyber"`) and reskin everything through CSS
variables.

## Documentation

- **[oriui.vercel.app](https://oriui.vercel.app)** — a page per component with live demos, props and
  accessibility notes, plus guides and the headless API.
- **[Cheat sheet](https://oriui.vercel.app/overview/cheat-sheet)** — install, the class model and every
  component on one page.
- For AI tools: **[`/llms.txt`](https://oriui.vercel.app/llms.txt)** (index) and
  **[`/llms-full.txt`](https://oriui.vercel.app/llms-full.txt)** (every page in one file).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branches, commits and releases. The conventions are in
[CLAUDE.md](CLAUDE.md), the reasons behind them in [DECISIONS.md](DECISIONS.md), and known problems in
[ISSUES-INNER.md](ISSUES-INNER.md).

## License

[MIT](LICENSE) © Leonid
