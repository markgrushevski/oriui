---
title: Cheat sheet
---

# Cheat sheet

Everything in one page — install, the class model, every component, and the design tokens. For the
machine-readable version (e.g. to paste into an AI), fetch [`/llms.txt`](/llms.txt) (index) or
[`/llms-full.txt`](/llms-full.txt) (every page concatenated).

## Install

```bash
npm install @oriui/vue      # styled Vue components
npm install @oriui/css     # standalone CSS layer (no framework)
npm install @oriui/headless     # headless composables (focus / keyboard / ARIA)
```

```ts
import '@oriui/css'; // the stylesheet, once (e.g. in your entry file)
import { OriButton } from '@oriui/vue';
```

## Two ways to use it

```vue
<!-- Vue component -->
<OriButton text="Save" variant="tonal" color="primary" size="lg" />
```

```html
<!-- Standalone CSS (htmx / Astro / Svelte / plain HTML) — same tokens, no Vue -->
<button class="ori-button ori-button_lg ori-variant_tonal ori-color_primary">Save</button>
```

## The class model

A **block class** plus **single-class token utilities** — one class repoints one token, no paired base
class. The block bakes sensible defaults, so a **bare block is valid**; add a class only to override an
axis. Dynamic state is real **attributes** (`disabled`, `aria-busy="true"`, `aria-pressed`), never
classes.

| Axis                   | Class               | Values                                                                                      |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| Color (the role)       | `ori-color_*`       | `primary` · `secondary` · `success` · `warn` · `danger` · `info` · `surface` · `background` |
| Variant (the mapping)  | `ori-variant_*`     | `fill` · `tonal` · `outline` · `text` · `plain`                                             |
| Size (component sugar) | `ori-<name>_<size>` | `xs` · `sm` · `md` · `lg` · `xl` · `xxl`                                                    |
| Radius                 | `ori-size-radius_*` | `zero` · `xs` · `sm` · `md` · `lg` · `xl` · `rounded`                                       |
| Font                   | `ori-font-size_*`   | `xs` · `sm` · `md` · `lg` · `xl` · `xxl`                                                    |

`color` is the **role**, `variant` is the **mapping** — `fill` paints the accent as background (with the
on-color text), `outline`/`text` paint it as border/text — so there is no separate `bg-color`. The
low-level size utility `ori-size-action_<size>` works too; the `ori-<name>_<size>` sugar is the friendly
shape. Full detail: [Using the CSS layer](/guides/css).

## Components at a glance

Each links to its full page (class table, props, slots, a11y). Props listed are the common ones — see
the page for the complete set.

| Component                          | Vue               | Key props                                                                                         |
| ---------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| [Button](/components/button)       | `<OriButton>`     | `text` `icon` `variant` `color` `size` `radius` `as` `loading` `disabled` `fluid`                 |
| [Card](/components/card)           | `<OriCard>`       | `variant` `color` `radius` `title` `prependIcon` `row` `fluid` `disabled` `loading`               |
| [Avatar](/components/avatar)       | `<OriAvatar>`     | `src` `text` `size` `radius` `color` `title` `subtitle` `inline` `spaced`                         |
| [Icon](/components/icon)           | `<OriIcon>`       | `icon` `size` `color` `label` `inline` `spaced`                                                   |
| [Spinner](/components/spinner)     | `<OriSpinner>`    | `size` `color` `inline`                                                                           |
| [Badge](/components/badge)         | `<OriBadge>`      | `color` `variant` `radius` `dot` (default slot is the anchor)                                     |
| [Tag](/components/tag)             | `<OriTag>`        | `text` `color` `variant` `radius` `size` `closable` `prependIcon` `disabled`                      |
| [Alert](/components/alert)         | `<OriAlert>`      | `title` `text` `color` `variant` `radius` `size` `icon` `closable` `live`                         |
| [Progress](/components/progress)   | `<OriProgress>`   | `value` `color` `radius` `size` `indeterminate` `label`                                           |
| [Tooltip](/components/tooltip)     | `<OriTooltip>`    | `content` `placement` `color`                                                                     |
| [Accordion](/components/accordion) | `<OriAccordion>`  | `items` `multiple` `radius` `color`                                                               |
| [Tabs](/components/tabs)           | `<OriTabs>`       | `tabs` `color` `orientation` (`v-model` = selected)                                               |
| [Divider](/components/divider)     | `<OriDivider>`    | `color` `text` `vertical` (default slot = centered label)                                         |
| [Stack](/components/stack)         | `<OriStack>`      | `align` `as` `cluster` `gap` `justify` (`.ori-stack` column · `.ori-cluster` wrapping row)        |
| [Join](/components/join)           | `<OriJoin>`       | `as` `vertical` — collapses children's shared radii/borders (add `aria-label`)                    |
| [Input](/components/input)         | `<OriInput>`      | `label` `type` `color` `size` `radius` `variant` `hint` `error` `required` `disabled` (`v-model`) |
| [Textarea](/components/textarea)   | `<OriTextarea>`   | `label` `color` `size` `radius` `variant` `rows` `hint` `error` `required` (`v-model`)            |
| [Select](/components/select)       | `<OriSelect>`     | `label` `options` `color` `size` `radius` `hint` `error` `required` (`v-model`)                   |
| [Field](/components/field)         | `<OriField>`      | `label` `hint` `error` `required` `disabled` `size` — shared form shell; wraps any control        |
| [Checkbox](/components/checkbox)   | `<OriCheckbox>`   | `label` `color` `size` `value` `disabled` `invalid` `required` (`v-model`)                        |
| [Radio](/components/radio)         | `<OriRadioGroup>` | `label` `options` `color` `size` `inline` `disabled` `required` (`v-model`)                       |
| [Switch](/components/switch)       | `<OriSwitch>`     | `label` `color` `size` `disabled` `invalid` (`v-model` boolean)                                   |
| [Dialog](/components/dialog)       | `<OriDialog>`     | `open` (`v-model`) — native `<dialog>`, focus-trap + `Esc` for free                               |
| [Link](/components/link)           | `<OriLink>`       | `as` `color` `external` `hover` `href` (inline prose link; underline-on-hover)                    |
| [Skeleton](/components/skeleton)   | `<OriSkeleton>`   | `as` `radius` — shimmer placeholder; size via width/height; honors reduced-motion                 |
| [Kbd](/components/kbd)             | `<OriKbd>`        | `as` `text` (default slot = key) — keyboard-key chip                                              |
| [Toast](/components/toast)         | `<OriToaster>`    | imperative `useToast()` push API + `<OriToaster position>` — transient notifications              |
| [Slider](/components/slider)       | `<OriSlider>`     | `color` `disabled` `label` `min` `max` `step` `showValue` (`v-model` number; native range)        |

## Theming & tokens

Theme and skin are attributes on `<html>` — flipping them reskins everything through CSS variables,
zero-runtime:

```html
<html class="dark" data-ori-skin="cyber">
    …
</html>
```

- `class="dark"` → dark mode (omit for light).
- `data-ori-skin="sumi | indigo | tech | health | luxury | cyber"` → a preset skin (omit for the default
  **Ori** skin).

Tokens are two-tier: a raw scale (`--ori-size-action_md`, `--ori-color-primary`) and a resolved alias
(`--ori-size-action`, `--ori-color`) that a utility repoints and the component reads. Override one token
on a scope to retune a whole subtree:

```css
.dense-toolbar {
    --ori-size-action: 32px;
} /* every action-sized control inside shrinks */
```

More: [Design tokens](/guides/design-tokens) · [Theming](/guides/theming) ·
[Customization](/guides/customization).
