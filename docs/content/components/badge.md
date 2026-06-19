---
title: Badge
---

# Badge

A small status or count indicator. Attach it to any element as a floating pip, drop it inline next
to text, or render it standalone — all three modes share the same class surface.

Every example is live and shows the standalone **HTML / `@oriui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component.

## Classes

A badge is a block class plus single-class token utilities — one class repoints one token; no base
class is needed. The Vue props in [Framework API](#framework-api) map 1:1 to these. Two layout
modifiers (`ori-badge_dot`, `ori-badge_floating`) and the wrapper class (`ori-badge-anchor`)
complete the floating pattern.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-badge","type":"Block","description":"Required base class. Defaults baked in: fill variant, primary color, rounded radius."},{"class":"ori-variant_*","type":"Style","description":"<b>fill</b> · tonal · outline · text · plain"},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface · background"},{"class":"ori-size-radius_*","type":"Radius","description":"zero · xs · sm · md · lg · xl · <b>rounded</b>"},{"class":"ori-badge_dot","type":"Layout","description":"collapses the badge to a small filled circle; content is hidden"},{"class":"ori-badge_floating","type":"Layout","description":"positions the badge in the top-end corner of its anchor wrapper"},{"class":"ori-badge-anchor","type":"Wrapper","description":"position:relative wrapper required for floating badges"}]'}

## Variants

Five visual styles, driven by the `ori-variant_*` single-class token.

::example
:ori-badge{content="Fill" variant="fill"}
:ori-badge{content="Tonal" variant="tonal"}
:ori-badge{content="Outline" variant="outline"}
:ori-badge{content="Text" variant="text"}
:ori-badge{content="Plain" variant="plain"}

#vue

```vue
<OriBadge content="Fill" variant="fill" />
<OriBadge content="Tonal" variant="tonal" />
<OriBadge content="Outline" variant="outline" />
<OriBadge content="Text" variant="text" />
<OriBadge content="Plain" variant="plain" />
```

#html

```html
<span class="ori-badge">Fill</span>
<!-- swap the variant: ori-variant_tonal / _outline / _text / _plain -->
<span class="ori-badge ori-variant_tonal">Tonal</span>
```

::

## Colors

All semantic roles. The badge inherits the shared `ori-color_*` token, so variant × color compose freely.

::example
:ori-badge{content="primary" color="primary"}
:ori-badge{content="secondary" color="secondary"}
:ori-badge{content="success" color="success"}
:ori-badge{content="warn" color="warn"}
:ori-badge{content="danger" color="danger"}
:ori-badge{content="info" color="info"}
:ori-badge{content="surface" color="surface"}

#vue

```vue
<OriBadge content="primary" color="primary" />
<OriBadge content="danger" color="danger" />
<OriBadge content="info" color="info" />
```

#html

```html
<span class="ori-badge ori-color_danger">danger</span>
```

::

Variant × color compose freely — e.g. a tonal success badge or an outline danger badge:

::example
:ori-badge{content="Approved" variant="tonal" color="success"}
:ori-badge{content="Error" variant="outline" color="danger"}
:ori-badge{content="Beta" variant="tonal" color="info"}

#vue

```vue
<OriBadge content="Approved" variant="tonal" color="success" />
<OriBadge content="Error" variant="outline" color="danger" />
<OriBadge content="Beta" variant="tonal" color="info" />
```

#html

```html
<span class="ori-badge ori-variant_tonal ori-color_success">Approved</span>
<span class="ori-badge ori-variant_outline ori-color_danger">Error</span>
```

::

## Radius

From `zero` (square) to the default `rounded` (pill).

::example
:ori-badge{content="zero" radius="zero"}
:ori-badge{content="sm" radius="sm"}
:ori-badge{content="md" radius="md"}
:ori-badge{content="lg" radius="lg"}
:ori-badge{content="rounded" radius="rounded"}

#vue

```vue
<OriBadge content="zero" radius="zero" />
<OriBadge content="rounded" radius="rounded" />
```

#html

```html
<span class="ori-badge ori-size-radius_zero">zero</span> <span class="ori-badge">rounded</span>
```

::

## Count & max

Pass a number to `content`. Set `max` to cap the display value — any number exceeding `max` renders
as `{max}+`.

::example
:ori-badge{:content="5"}
:ori-badge{:content="42"}
:ori-badge{:content="130" :max="99" color="danger"}
:ori-badge{:content="9" :max="9" color="success"}

#vue

```vue
<OriBadge :content="5" />
<OriBadge :content="42" />
<!-- 130 > 99 → renders "99+" -->
<OriBadge :content="130" :max="99" color="danger" />
```

#html

```html
<span class="ori-badge">5</span>
<!-- cap manually in your template when not using Vue -->
<span class="ori-badge ori-color_danger">99+</span>
```

::

## Dot

`dot` collapses the badge to a small filled circle. Content is hidden; it is always decorative
(`aria-hidden="true"`) unless you provide a `label`.

::example
:ori-badge{:dot="true"}
:ori-badge{:dot="true" color="danger"}
:ori-badge{:dot="true" color="success"}
:ori-badge{:dot="true" color="warn"}

#vue

```vue
<OriBadge dot />
<OriBadge dot color="danger" />
<OriBadge dot color="success" />
```

#html

```html
<!-- dot is always aria-hidden unless a label is provided -->
<span class="ori-badge ori-badge_dot ori-color_danger" aria-hidden="true"></span>
```

::

## Floating

The badge floats over **wrapped content** — `floating` needs the badge to wrap an anchor. In Vue, pass
the anchor into the **default slot** and add the `floating` prop (without a default slot `floating` has
nothing to position against and is ignored). In HTML, wrap the anchor in `ori-badge-anchor` and add
`ori-badge_floating` to the badge itself.

::example
:badge-demo

#vue

```vue
<!-- floating over a button -->
<OriBadge :content="3" floating color="danger">
    <button class="ori-button ori-variant_tonal ori-color_primary ori-size-radius_rounded">
        Inbox
    </button>
</OriBadge>

<!-- dot variant -->
<OriBadge dot floating color="danger">
    <button class="ori-button …">Notifications</button>
</OriBadge>
```

#html

```html
<!-- wrap anchor content in ori-badge-anchor, add ori-badge_floating to the badge -->
<span class="ori-badge-anchor">
    <button class="ori-button ori-variant_tonal ori-color_primary ori-size-radius_rounded">Inbox</button>
    <span class="ori-badge ori-badge_floating ori-color_danger" aria-label="3 unread">3</span>
</span>
```

::

## Common patterns

A notification bell, an avatar with a status pip, and a tab bar with unread counts.

::example
:badge-demo
:ori-badge{content="New" variant="tonal" color="info"}

#vue

```vue
<!-- notification bell -->
<OriBadge
    :content="notifications"
    :max="99"
    floating
    color="danger"
    aria-label="`${notifications} unread notifications`"
>
    <OriButton icon="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" aria-label="Notifications" />
</OriBadge>

<!-- status dot on an avatar -->
<OriBadge dot floating color="success" label="Online">
    <OriAvatar text="Ada Lovelace" />
</OriBadge>

<!-- tab with unread count -->
<span style="display: inline-flex; align-items: center; gap: 0.5rem">
    Messages
    <OriBadge :content="5" variant="tonal" color="primary" />
</span>
```

#html

```html
<!-- notification bell -->
<span class="ori-badge-anchor">
    <button class="ori-button …" aria-label="Notifications"><!-- bell icon --></button>
    <span class="ori-badge ori-badge_floating ori-color_danger" aria-label="12 unread notifications">12</span>
</span>

<!-- status dot on avatar -->
<span class="ori-badge-anchor">
    <div class="ori-avatar …"><!-- avatar --></div>
    <span class="ori-badge ori-badge_dot ori-badge_floating ori-color_success" aria-label="Online"></span>
</span>

<!-- inline tab counter -->
<span style="display: inline-flex; align-items: center; gap: 0.5rem">
    Messages
    <span class="ori-badge ori-variant_tonal">5</span>
</span>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- A badge with visible text content (`content`) conveys that text to assistive technology directly.
- A pure dot badge — or an empty badge with no `label` — is marked `aria-hidden="true"` because it
  carries no information for screen readers.
- Supply a `label` whenever the badge conveys meaning that a sighted user can read but a screen
  reader cannot (e.g. a dot meaning "online", or a floating count with no textual fallback nearby).
- A floating count that visually annotates an already-labeled control (e.g. "Inbox (3 unread)")
  should carry `aria-label` on the badge element or be hidden with `aria-hidden="true"` if the
  parent label already includes the count.
- The badge is a `<span>` — it has no interactive role and no keyboard contract of its own. When a
  badge and its anchor together form an interactive control, apply focus management and ARIA to the
  outer interactive element.

| Attribute            | Condition                                             | Value       |
| -------------------- | ----------------------------------------------------- | ----------- |
| `aria-hidden="true"` | `dot` with no `label`, or empty badge with no `label` | `"true"`    |
| `aria-label`         | `label` prop is set                                   | label value |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop       | Type               | Default     | Description                                                                                                       |
| ---------- | ------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `color`    | `ThemeColor`       | `'primary'` | Semantic color role: `primary` · `secondary` · `success` · `warn` · `danger` · `info` · `surface` · `background`. |
| `content`  | `string \| number` | —           | Text or number to display. Numbers are capped to `max+` when `max` is set.                                        |
| `dot`      | `boolean`          | `false`     | Collapses the badge to a small filled circle; content is hidden.                                                  |
| `floating` | `boolean`          | `false`     | Positions the badge in the top-end corner of the default-slot anchor (requires a default slot child).             |
| `label`    | `string`           | —           | Accessible name (`aria-label`). Required for dot badges or empty badges that convey meaning to sighted users.     |
| `max`      | `number`           | —           | When `content` is a number and exceeds `max`, the display value is capped to `{max}+`.                            |
| `radius`   | `RadiusSize`       | `'rounded'` | Corner radius: `zero` · `xs` · `sm` · `md` · `lg` · `xl` · `rounded`.                                             |
| `variant`  | `Variant`          | `'fill'`    | Visual style: `fill` · `tonal` · `outline` · `text` · `plain`.                                                    |

### Events & attributes

OriBadge declares **no custom events**. It sets `inheritAttrs: false` and applies `v-bind="$attrs"`
directly to the inner `.ori-badge` element — so `id`, `class`, `data-*`, and event listeners always
land on the badge element regardless of whether a default slot (the anchor wrapper) is present.

### Slots

| Slot      | Description                                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | The element the badge floats over. When provided, the component wraps both the slot content and the badge in an `ori-badge-anchor` span. When absent, the badge renders standalone. |
