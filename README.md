# oriUI 織り

[![CI](https://github.com/markgrushevski/oriui/actions/workflows/ci.yml/badge.svg)](https://github.com/markgrushevski/oriui/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@oriui/vue?logo=npm&color=cb3837)](https://www.npmjs.com/package/@oriui/vue)
[![codecov](https://codecov.io/gh/markgrushevski/oriui/branch/main/graph/badge.svg)](https://codecov.io/gh/markgrushevski/oriui)
[![license](https://img.shields.io/npm/l/@oriui/vue?color=blue)](LICENSE)

A layered **Vue 3** UI library — _prototype fast, scale without rewriting_. Three independently
consumable layers woven around shared design tokens, so you can start with styled components and drop
to headless behavior or raw CSS when you need control, without rewriting.

| Package                                                        | Layer    | What you get                                                   |
| -------------------------------------------------------------- | -------- | -------------------------------------------------------------- |
| [`@oriui/vue`](https://npmjs.com/package/@oriui/vue)           | styled   | Ready Vue components — `<OriButton variant="tonal" />`         |
| [`@oriui/headless`](https://npmjs.com/package/@oriui/headless) | behavior | Headless composables for focus / keyboard / ARIA               |
| [`@oriui/css`](https://npmjs.com/package/@oriui/css)           | style    | Standalone `.ori-*` classes + design tokens — **no framework** |

Zero-runtime theming via CSS custom properties · no Tailwind dependency · **29 components** · WCAG-AA
token contrast (executably tested) · fully typed · htmx / Astro / plain-HTML friendly through the CSS
layer.

## Install

```bash
npm install @oriui/vue      # styled Vue components (pulls in @oriui/css + @oriui/headless)
# or just the layer you need:
npm install @oriui/css     # standalone CSS — no framework
npm install @oriui/headless     # headless composables
```

> **Alpha.** The line is `1.0.0-alpha.*` on both the `next` and `latest` dist-tags — `npm i @oriui/vue`
> works today; APIs may still shift before `1.0.0`.

## Use it — Vue

```ts
import '@oriui/css'; // the stylesheet, once (e.g. in your entry file)
import { OriButton } from '@oriui/vue';
```

```vue
<OriButton text="Save" variant="tonal" color="primary" size="lg" />
```

## Use it — standalone CSS (htmx / Astro / Svelte / plain HTML)

```html
<!-- same tokens, no Vue — one class repoints one token -->
<button class="ori-button ori-button_lg ori-variant_tonal ori-color_primary">Save</button>
```

## Documentation

- **[oriui.vercel.app](https://oriui.vercel.app)** — full docs, a page per component (live demos,
  props, a11y), guides, and the headless contract.
- **[Cheat sheet](https://oriui.vercel.app/overview/cheat-sheet)** — install + the class model + every
  component on one page.
- Machine-readable for AI consumers: **[`/llms.txt`](https://oriui.vercel.app/llms.txt)** (index) and
  **[`/llms-full.txt`](https://oriui.vercel.app/llms-full.txt)** (every page concatenated).

## The class model

A **block class** plus **single-class token utilities** — one class repoints one token, no paired base
class. The block bakes sensible defaults, so a bare block is valid; add a class only to override an
axis. Dynamic state is real **attributes** (`disabled`, `aria-busy`), never classes.

| Axis    | Class               | Values                                                               |
| ------- | ------------------- | -------------------------------------------------------------------- |
| Color   | `ori-color_*`       | `primary` · `secondary` · `success` · `warn` · `danger` · `info` · … |
| Variant | `ori-variant_*`     | `fill` · `tonal` · `outline` · `text` · `plain`                      |
| Size    | `ori-<name>_<size>` | `xs` · `sm` · `md` · `lg` · `xl` · `xxl`                             |
| Radius  | `ori-size-radius_*` | `zero` · `xs` · `sm` · `md` · `lg` · `xl` · `rounded`                |

`color` is the **role**, `variant` is the **mapping** — so there is no separate `bg-color`. Theme and
skin are attributes on `<html>` (`class="dark"`, `data-ori-skin="cyber"`), reskinning everything
through CSS variables with zero runtime.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch / commit / release workflow,
[ROADMAP.md](ROADMAP.md) for the plan, and [DECISIONS.md](DECISIONS.md) / [NOTES.md](NOTES.md) /
[REVIEW.md](REVIEW.md) for the rationale, gotchas, and the per-change bar.

## License

[MIT](LICENSE) © Leonid
