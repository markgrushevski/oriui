---
title: Accordion
---

# Accordion

A disclosure list built entirely on native `<details>`/`<summary>` elements — zero JavaScript, zero
ARIA reinvention. The browser supplies the disclosure role, `aria-expanded`, Enter/Space toggling,
focus, and find-in-page expansion for free. Single-open (exclusive) mode uses the platform
exclusive-accordion feature (Baseline 2024): every `<details>` shares one auto-generated `name`, so
the browser closes siblings when one opens. `multiple` drops the shared `name` so each item opens
independently.

Every example is live and shows the standalone **HTML / `@oriui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component.

## Classes

The accordion is a block class plus single-class token utilities — one class repoints one token, no
base class needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-accordion","type":"Block","description":"The accordion container — a wrapper <code>&lt;div&gt;</code> that carries the colour and optional radius utilities; hairline border with clipped corners."},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface"},{"class":"ori-size-radius_*","type":"Radius","description":"zero · xs · sm · md · lg · xl · rounded"},{"class":"ori-accordion__item","type":"Part","description":"A native <code>&lt;details&gt;</code> element, one per item. Open state is the native <code>open</code> attribute, styled via <code>details[open]</code>."},{"class":"ori-accordion__trigger","type":"Part","description":"The native <code>&lt;summary&gt;</code>; the default marker is suppressed and a custom chevron added; focus ring via <code>:focus-visible</code>."},{"class":"ori-accordion__title","type":"Part","description":"The item title text; takes the accent colour when its item is open."},{"class":"ori-accordion__icon","type":"Part","description":"The decorative chevron <code>&lt;svg&gt;</code> (<code>aria-hidden</code>); rotates when its item is open."},{"class":"ori-accordion__panel","type":"Part","description":"The disclosure body wrapper that holds the panel content."},{"class":"aria-disabled + tabindex","type":"State","description":"A disabled trigger carries real <code>aria-disabled</code> and <code>tabindex=-1</code> attributes, not classes."}]'}

## Anatomy

```
div.ori-accordion                     (wrapper; carries the color + optional radius utilities)
  details.ori-accordion__item         (one per item; browser owns open attribute)
    summary.ori-accordion__trigger
      span.ori-accordion__title       (heading text)
      svg.ori-accordion__icon         (decorative chevron; aria-hidden)
    div.ori-accordion__panel          (default scoped slot body)
```

## Basic

A single-open accordion (default). Opening one item closes the previous one — enforced natively by
the shared `name` attribute, no JavaScript required.

::example
:ori-accordion{:items='[{"value":"one","title":"What is oriUI?"},{"value":"two","title":"How do I install it?"},{"value":"three","title":"Does it work without Vue?"}]'}

#vue

```vue
<OriAccordion
    :items="[
        { value: 'one', title: 'What is oriUI?' },
        { value: 'two', title: 'How do I install it?' },
        { value: 'three', title: 'Does it work without Vue?' }
    ]"
>
    <template #default="{ item }">
        <p v-if="item.value === 'one'">oriUI is a layered Vue 3 component library.</p>
        <p v-else-if="item.value === 'two'">Run <code>npm i @oriui/ui</code>.</p>
        <p v-else>Yes — import <code>@oriui/css</code> and use the ori-* classes anywhere.</p>
    </template>
</OriAccordion>
```

#html

```html
<!-- Single-open: give every <details> the same name. -->
<div class="ori-accordion ori-color_primary">
    <details class="ori-accordion__item" name="faq">
        <summary class="ori-accordion__trigger">
            <span class="ori-accordion__title">What is oriUI?</span>
            <svg class="ori-accordion__icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <path d="m6 9 6 6 6-6" />
            </svg>
        </summary>
        <div class="ori-accordion__panel">
            <p>oriUI is a layered Vue 3 component library.</p>
        </div>
    </details>
    <!-- repeat for each item, same name="faq" -->
</div>
```

::

## Multiple open

`multiple` lets any number of items be open simultaneously — each `<details>` opens and closes
independently.

::example
:ori-accordion{:multiple="true" :items='[{"value":"step1","title":"Step 1 — Install"},{"value":"step2","title":"Step 2 — Configure"},{"value":"step3","title":"Step 3 — Deploy"}]'}

#vue

```vue
<OriAccordion
    multiple
    :items="[
        { value: 'step1', title: 'Step 1 — Install' },
        { value: 'step2', title: 'Step 2 — Configure' },
        { value: 'step3', title: 'Step 3 — Deploy' }
    ]"
>
    <template #default="{ item }">
        <p>Details for {{ item.title }}.</p>
    </template>
</OriAccordion>
```

#html

```html
<!-- Multiple: omit the shared name so items open independently. -->
<div class="ori-accordion ori-color_primary">
    <details class="ori-accordion__item">
        <summary class="ori-accordion__trigger">
            <span class="ori-accordion__title">Step 1 — Install</span>
            <svg class="ori-accordion__icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <path d="m6 9 6 6 6-6" />
            </svg>
        </summary>
        <div class="ori-accordion__panel"><p>Details for Step 1 — Install.</p></div>
    </details>
    <!-- repeat without name for each item -->
</div>
```

::

## Colors

Every semantic role. The accent color is applied to the open item's title and the rotating chevron.

::example
:ori-accordion{color="primary" :items='[{"value":"a","title":"Primary accent"}]'}
:ori-accordion{color="secondary" :items='[{"value":"a","title":"Secondary accent"}]'}
:ori-accordion{color="success" :items='[{"value":"a","title":"Success accent"}]'}
:ori-accordion{color="danger" :items='[{"value":"a","title":"Danger accent"}]'}
:ori-accordion{color="info" :items='[{"value":"a","title":"Info accent"}]'}

#vue

```vue
<OriAccordion color="primary" :items="items" />
<OriAccordion color="secondary" :items="items" />
<OriAccordion color="success" :items="items" />
<OriAccordion color="danger" :items="items" />
<OriAccordion color="info" :items="items" />
```

#html

```html
<!-- swap the color class: ori-color_primary → _secondary / _success / _danger / _info -->
<div class="ori-accordion ori-color_success">…</div>
```

::

## Radius

Corner rounding via the `radius` prop. When omitted, the container uses the baked default `md` (the
`.ori-accordion` block bakes `--ori-size-radius: md`, so a bare block is never square).

::example
:ori-accordion{radius="zero" :items='[{"value":"a","title":"zero — no rounding"}]'}
:ori-accordion{radius="sm" :items='[{"value":"a","title":"sm — subtle rounding"}]'}
:ori-accordion{radius="md" :items='[{"value":"a","title":"md — medium rounding"}]'}
:ori-accordion{radius="lg" :items='[{"value":"a","title":"lg — large rounding"}]'}
:ori-accordion{radius="xl" :items='[{"value":"a","title":"xl — extra-large rounding"}]'}

#vue

```vue
<OriAccordion radius="zero" :items="items" />
<OriAccordion radius="md" :items="items" />
<OriAccordion radius="xl" :items="items" />
```

#html

```html
<!-- attach the radius class: ori-size-radius_md -->
<div class="ori-accordion ori-color_primary ori-size-radius_md">…</div>
```

::

## Disabled items

Set `disabled: true` on individual items in the `items` array to block interaction on those
triggers. Disabled items render `aria-disabled="true"` and `tabindex="-1"` on their `<summary>`.

::example
:ori-accordion{:items='[{"value":"billing","title":"Billing"},{"value":"security","title":"Security (restricted)","disabled":true},{"value":"notifications","title":"Notifications"}]'}

#vue

```vue
<OriAccordion
    :items="[
        { value: 'billing', title: 'Billing' },
        { value: 'security', title: 'Security (restricted)', disabled: true },
        { value: 'notifications', title: 'Notifications' }
    ]"
/>
```

#html

```html
<!-- disabled trigger: aria-disabled + tabindex=-1 on the <summary> -->
<details class="ori-accordion__item" name="settings">
    <summary class="ori-accordion__trigger" aria-disabled="true" tabindex="-1">
        <span class="ori-accordion__title">Security (restricted)</span>
        <svg class="ori-accordion__icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="m6 9 6 6 6-6" />
        </svg>
    </summary>
    <div class="ori-accordion__panel"></div>
</details>
```

::

## Common patterns

Colors, radius, and rich slot content together — a common FAQ or settings pattern.

::example
:ori-accordion{color="secondary" radius="md" :items='[{"value":"cost","title":"Is oriUI free to use?"},{"value":"framework","title":"Which frameworks are supported?"},{"value":"theming","title":"How does theming work?"}]'}

#vue

```vue
<OriAccordion
    color="secondary"
    radius="md"
    :items="[
        { value: 'cost', title: 'Is oriUI free to use?' },
        { value: 'framework', title: 'Which frameworks are supported?' },
        { value: 'theming', title: 'How does theming work?' }
    ]"
>
    <template #default="{ item }">
        <p v-if="item.value === 'cost'">
            Yes — MIT licensed. Use it in personal and commercial projects.
        </p>
        <p v-else-if="item.value === 'framework'">
            Vue 3 via <code>@oriui/ui</code>; any framework or plain HTML via
            <code>@oriui/css</code>.
        </p>
        <p v-else>
            Zero-runtime: toggle a class or attribute and a CSS custom property does the rest.
        </p>
    </template>
</OriAccordion>
```

#html

```html
<div class="ori-accordion ori-color_secondary ori-size-radius_md">
    <details class="ori-accordion__item" name="faq">
        <summary class="ori-accordion__trigger">
            <span class="ori-accordion__title">Is oriUI free to use?</span>
            <svg class="ori-accordion__icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <path d="m6 9 6 6 6-6" />
            </svg>
        </summary>
        <div class="ori-accordion__panel">
            <p>Yes — MIT licensed. Use it in personal and commercial projects.</p>
        </div>
    </details>
    <!-- repeat for each item -->
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes and keyboard behaviour.

- Built entirely on native `<details>`/`<summary>`: the browser supplies `role="group"` on the
  `<details>` and `role="button"` with `aria-expanded` on the `<summary>` — no ARIA reinvention.
- Single-open mode is enforced by the platform exclusive-accordion (shared `name` attribute,
  Baseline 2024), not script — the browser closes siblings automatically.
- Disabled items use `aria-disabled="true"` and `tabindex="-1"` on the `<summary>` (state via real
  attributes, styled with attribute selectors).
- The chevron SVG is `aria-hidden="true"` — it is purely decorative; the title text is the
  accessible name for each section.
- Focus is always visible via `:focus-visible` on the `<summary>` trigger (inset outline so it
  shows on the row); hover is gated behind `@media (hover: hover)`.

| Key     | Action                                                                   |
| ------- | ------------------------------------------------------------------------ |
| `Enter` | Toggles the focused disclosure item open or closed (native).             |
| `Space` | Toggles the focused disclosure item open or closed (native).             |
| `Tab`   | Moves focus to the next focusable element inside or after the accordion. |

## Framework API

The props, events, slots, and standalone CSS surface of the **Vue** component. The standalone CSS
layer has no component API — its surface is the [classes](#classes) above. (Svelte bindings are
planned.)

### Props

| Prop       | Type                                                                    | Default     | Description                                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`    | `ThemeColor`                                                            | `'primary'` | Accent color for the open item's title and the rotating chevron. Repoints `--ori-color` via the `ori-color_<color>` utility class on the wrapper.                                                   |
| `items`    | `Array<{ value: string \| number; title: string; disabled?: boolean }>` | —           | **Required.** The disclosure items. `value` is used as the `:key`; `title` is the summary text; `disabled` sets `aria-disabled="true"` + `tabindex="-1"` and blocks pointer events on that trigger. |
| `multiple` | `boolean`                                                               | `false`     | `false` = exclusive single-open (shared `name`, browser closes siblings). `true` = each item opens/closes independently (no shared `name`).                                                         |
| `radius`   | `RadiusSize`                                                            | `'md'`      | Optional corner radius for the accordion container. Attaches `ori-size-radius_<radius>` when set; the bare block bakes in `md` as its default.                                                      |

### Events & attributes

`OriAccordion` declares **no custom emits**. Open state is owned by the browser's native
`<details>` mechanism — there is no `v-model` and no Vue toggle. The component does not set
`inheritAttrs: false`, so extra attributes (`class`, `data-*`, `id`, …) fall through to the root
`div.ori-accordion`.

### Slots

| Slot      | Scope                                                                      | Description                                                                                                                                         |
| --------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | `{ item: { value: string \| number; title: string; disabled?: boolean } }` | Scoped per-item panel body, rendered inside each item's `.ori-accordion__panel`. Receives the current item; falls back to an empty panel if unused. |
