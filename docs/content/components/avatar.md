---
title: Avatar
---

# Avatar

A data-display component that shows an image, or initials derived from `name` when there is no
image (or while it loads). Supports a title / subtitle column for list and profile UIs.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default.

## Classes

An avatar is a block class plus single-class token utilities — one class repoints one token; no
separate base class is needed. The Vue props in [Framework API](#framework-api) mirror these — font
size and the titled layout are derived from `size` and `title` / `subtitle`. There is no variant;
an optional `color` tints the initials backdrop.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-avatar","type":"Block","description":"Required base class."},{"class":"ori-color_*","type":"Color","description":"primary · secondary · success · warning · danger · info · surface · background — tints the initials backdrop"},{"class":"ori-avatar_* (size)","type":"Size","description":"xs · sm · md · <b>lg</b> · xl · xxl"},{"class":"ori-size-action-space_*","type":"Size","description":"adds margin around the avatar when <code>spaced</code> is set"},{"class":"ori-size-radius_*","type":"Radius","description":"none · xs · sm · md · lg · xl · <b>full</b>"},{"class":"ori-font-size_*","type":"Font","description":"scales the initials text with the avatar size"},{"class":"ori-avatar__image · ori-avatar__backdrop · ori-avatar__text · ori-avatar__title · ori-avatar__subtitle","type":"Part","description":"image / initials fallback / text column / title / subtitle"},{"class":"ori-avatar_inline · ori-avatar_titled · ori-avatar_reverse","type":"Layout","description":"inline flow · title+subtitle layout · reversed image/text order"}]'}

**À la carte:** the classes above ship in `@oriui/css/components/avatar.css`. Import a foundation
(`@oriui/css/base.css` or `@oriui/css/tokens.css`) first — the token utilities (`ori-color_*`,
`ori-size-radius_*`, …) live there, not in the component file. The full bundle `@oriui/css` is the default and
already carries both; see [à-la-carte imports](/guides/css).

## Image & initials

`src` (and any other image attribute) falls through via `$attrs` to the `<img>` element. When no
`src` is present — or while the image loads — the initials backdrop is shown instead, computing up
to two letters from the first two words of `name`.

::example
:ori-avatar{src="/image-example.jpg" name="Marcus Tullius Cicero"}
:ori-avatar{name="Marcus Tullius Cicero"}
:ori-avatar{name="Ada Lovelace"}

#vue

```vue
<OriAvatar src="/portrait.jpg" name="Marcus Tullius Cicero" />
<!-- no src — initials "MT" are derived from text -->
<OriAvatar name="Marcus Tullius Cicero" />
<!-- two words — initials "AL" -->
<OriAvatar name="Ada Lovelace" />
```

#html

```html
<!-- with image — bare .ori-avatar is already lg + rounded (defaults baked in) -->
<div class="ori-avatar">
    <img class="ori-avatar__image" src="/portrait.jpg" alt="Marcus Tullius Cicero" />
</div>

<!-- initials fallback: backdrop is aria-hidden -->
<div class="ori-avatar">
    <div class="ori-avatar__backdrop" aria-hidden="true">MT</div>
</div>
```

::

## Colors

An optional `color` tints the initials backdrop using the standard semantic token. Has no effect
when an image is showing.

::example
:ori-avatar{name="Primary" color="primary"}
:ori-avatar{name="Secondary" color="secondary"}
:ori-avatar{name="Success" color="success"}
:ori-avatar{name="Warn Color" color="warning"}
:ori-avatar{name="Danger" color="danger"}
:ori-avatar{name="Info" color="info"}
:ori-avatar{name="Surface" color="surface"}
:ori-avatar{name="Background" color="background"}

#vue

```vue
<OriAvatar name="Primary" color="primary" />
<OriAvatar name="Danger" color="danger" />
<OriAvatar name="Info" color="info" />
<OriAvatar name="Surface" color="surface" />
<OriAvatar name="Background" color="background" />
```

#html

```html
<div class="ori-avatar ori-color_danger">
    <div class="ori-avatar__backdrop" aria-hidden="true">D</div>
</div>
```

::

## Sizes

`xs` → `xxl`. The size drives the box dimensions (`ori-avatar_*`) and the initials scale
(`ori-font-size_*`). Default is `lg`.

::example
:ori-avatar{name="Extra Small" size="xs"}
:ori-avatar{name="Small" size="sm"}
:ori-avatar{name="Medium" size="md"}
:ori-avatar{name="Large" size="lg"}
:ori-avatar{name="Extra Large" size="xl"}
:ori-avatar{name="Double Extra" size="xxl"}

#vue

```vue
<OriAvatar name="Small" size="sm" />
<OriAvatar name="Large" size="lg" />
<OriAvatar name="Extra Large" size="xl" />
```

#html

```html
<div class="ori-avatar ori-avatar_sm ori-font-size_sm">
    <div class="ori-avatar__backdrop" aria-hidden="true">S</div>
</div>
<div class="ori-avatar ori-avatar_xl ori-font-size_xl">
    <div class="ori-avatar__backdrop" aria-hidden="true">EL</div>
</div>
```

::

## Radius

From `none` (square) to the default `full` (full pill / circle).

::example
:ori-avatar{name="None" radius="none"}
:ori-avatar{name="Small" radius="sm"}
:ori-avatar{name="Medium" radius="md"}
:ori-avatar{name="Large" radius="lg"}
:ori-avatar{name="Full" radius="full"}

#vue

```vue
<OriAvatar name="None" radius="none" />
<OriAvatar name="Full" radius="full" />
```

#html

```html
<div class="ori-avatar ori-size-radius_none">
    <div class="ori-avatar__backdrop" aria-hidden="true">Z</div>
</div>
```

::

## With title & subtitle

Pass `title` and/or `subtitle` to show a text column beside the image or initials. The root
element switches to `max-content` width via `ori-avatar_titled`.

::example
:ori-avatar{src="/image-example.jpg" name="Marcus Tullius Cicero" title="Marcus Tullius Cicero" subtitle="statesman · lawyer · writer · orator"}
:ori-avatar{name="Ada Lovelace" color="secondary" title="Ada Lovelace" subtitle="mathematician · first programmer"}

#vue

```vue
<OriAvatar
    src="/portrait.jpg"
    name="Marcus Tullius Cicero"
    title="Marcus Tullius Cicero"
    subtitle="statesman · lawyer · writer · orator"
/>
<!-- initials with title -->
<OriAvatar name="Ada Lovelace" color="secondary" title="Ada Lovelace" subtitle="mathematician · first programmer" />
```

#html

```html
<!-- ori-avatar_titled activates the text column layout -->
<div class="ori-avatar ori-avatar_titled">
    <img class="ori-avatar__image" src="/portrait.jpg" alt="Marcus Tullius Cicero" />
    <div class="ori-avatar__text">
        <div class="ori-avatar__title">Marcus Tullius Cicero</div>
        <div class="ori-avatar__subtitle">statesman · lawyer · writer · orator</div>
    </div>
</div>
```

::

## Reversed

`reverse` flips the layout so the text column appears before the image.

::example
:ori-avatar{name="Ada Lovelace" color="primary" title="Ada Lovelace" subtitle="mathematician" :reverse="true"}

#vue

```vue
<OriAvatar name="Ada Lovelace" color="primary" title="Ada Lovelace" subtitle="mathematician" reverse />
```

#html

```html
<div class="ori-avatar ori-avatar_titled ori-avatar_reverse ori-color_primary">
    <div class="ori-avatar__text">
        <div class="ori-avatar__title">Ada Lovelace</div>
        <div class="ori-avatar__subtitle">mathematician</div>
    </div>
    <div class="ori-avatar__backdrop" aria-hidden="true">AL</div>
</div>
```

::

## Inline

`inline` renders the avatar as `inline-flex` with a small margin, so it flows inside a sentence or
a tag list.

::example
:ori-avatar{name="Ada Lovelace" size="xs" :inline="true"}
:ori-avatar{name="Marcus Tullius" size="xs" color="secondary" :inline="true"}

#vue

```vue
<OriAvatar name="Ada Lovelace" size="xs" inline />
<OriAvatar name="Marcus Tullius" size="xs" color="secondary" inline />
```

#html

```html
<div class="ori-avatar ori-avatar_inline ori-avatar_xs ori-font-size_xs">
    <div class="ori-avatar__backdrop" aria-hidden="true">AL</div>
</div>
```

::

## Spaced

`spaced` adds padding around the avatar via `ori-size-action-space`, useful when the avatar sits
inside a container that provides no gap of its own.

::example
:ori-avatar{name="Ada Lovelace" :spaced="true"}
:ori-avatar{name="Marcus Tullius" color="secondary" :spaced="true"}

#vue

```vue
<OriAvatar name="Ada Lovelace" spaced />
<OriAvatar name="Marcus Tullius" color="secondary" spaced />
```

#html

```html
<div class="ori-avatar ori-size-action-space_lg">
    <div class="ori-avatar__backdrop" aria-hidden="true">AL</div>
</div>
```

::

## Common patterns

A user-list row and a comment header — the everyday compositions.

::example
:ori-avatar{src="/image-example.jpg" name="Marcus Tullius Cicero" title="Marcus Tullius Cicero" subtitle="Admin"}
:ori-avatar{name="Ada Lovelace" color="secondary" title="Ada Lovelace" subtitle="Editor"}
:ori-avatar{name="Unknown User" color="surface" title="Unknown User" subtitle="Guest"}

#vue

```vue
<!-- user list row -->
<ul style="display: flex; flex-direction: column; gap: 0.75rem; list-style: none; padding: 0">
    <li v-for="user in users" :key="user.id">
        <OriAvatar
            :src="user.avatar"
            :name="user.name"
            :title="user.name"
            :subtitle="user.role"
        />
    </li>
</ul>
```

#html

```html
<ul style="display: flex; flex-direction: column; gap: 0.75rem; list-style: none; padding: 0">
    <li>
        <div class="ori-avatar ori-avatar_titled">
            <img class="ori-avatar__image" src="/portrait.jpg" alt="Marcus Tullius Cicero" />
            <div class="ori-avatar__text">
                <div class="ori-avatar__title">Marcus Tullius Cicero</div>
                <div class="ori-avatar__subtitle">Admin</div>
            </div>
        </div>
    </li>
</ul>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- The `<img>` `alt` is always set — to the `name` prop value, or `''` (empty, decorative) when
  `name` is omitted. Do not pass a separate `alt` via `$attrs`; it will be overridden.
- The initials backdrop is `aria-hidden="true"` — it is a visual fallback, not semantic content.
- The `<img>` is revealed only after the `load` event fires (`v-show`), preventing a flash of a
  broken-image icon while the initials are still visible.
- There is no interactive behaviour; the component has no keyboard contract of its own. Wrap it in a
  `<button>` or `<a>` when it needs to be activatable, and supply an `aria-label` on the wrapper.

| Attribute            | Element      | Notes                                                            |
| -------------------- | ------------ | ---------------------------------------------------------------- |
| `alt` (from `name`)  | `<img>`      | Set automatically; omit `alt` in `$attrs` — it will be replaced. |
| `aria-hidden="true"` | `__backdrop` | Initials are decorative; screen readers read the image `alt`.    |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop       | Type         | Default  | Description                                                                                                                  |
| ---------- | ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `color`    | `ThemeColor` | —        | Tints the initials backdrop: `primary` · `secondary` · `success` · `warning` · `danger` · `info` · `surface` · `background`. |
| `inline`   | `boolean`    | `false`  | Renders as `inline-flex` with a small margin for flowing inside text.                                                        |
| `name`     | `string`     | —        | Drives the initials (up to two letters from the first two words) and the image `alt`.                                        |
| `radius`   | `RadiusSize` | `'full'` | Corner radius (`none` · `xs` · `sm` · `md` · `lg` · `xl` · `full`).                                                          |
| `reverse`  | `boolean`    | `false`  | Reverses the flex direction so the text column appears before the image.                                                     |
| `size`     | `ActionSize` | `'lg'`   | Box size and initials scale (`xs` · `sm` · `md` · `lg` · `xl` · `xxl`).                                                      |
| `spaced`   | `boolean`    | `false`  | Adds padding around the avatar via `ori-size-action-space`.                                                                  |
| `subtitle` | `string`     | —        | Secondary line in the text column; rendered whenever `title` or `subtitle` is set.                                           |
| `title`    | `string`     | —        | Primary line in the text column; the text column appears when either `title` or `subtitle` is set.                           |

### Events & attributes

OriAvatar declares **no custom events**. It sets `inheritAttrs: false` and applies `v-bind="$attrs"`
directly to the `<img>` element — so `src`, `alt`, `width`, `height`, `loading`, `decoding`, and
any other image attribute or listener fall through to the image, not the wrapper `<div>`. Native
event listeners (`@error`, `@load`, …) follow the same path.

The `alt` attribute is overridden internally to the value of `name` (or `''` when `name` is not set)
so there is a single source of truth for the accessible name.

### Slots

Each slot overrides the content it names; leave it out and the component falls back to the derived
value or prop. The image itself is not slotted — it comes through `$attrs` (see above).

| Slot       | Falls back to                    | Description                                                                                                   |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `fallback` | the initials derived from `name` | Imageless fallback content — e.g. a person icon or monogram — shown when there is no image or while it loads. |
| `title`    | `title` prop                     | Primary line in the text column.                                                                              |
| `subtitle` | `subtitle` prop                  | Secondary line in the text column.                                                                            |

The text column appears when any of `title` / `subtitle` (prop **or** slot) is set. The `#fallback`
slot fills the `aria-hidden` backdrop, so keep its content decorative — the accessible name still
comes from the image `alt`.
