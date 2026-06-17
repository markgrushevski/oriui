---
title: Avatar
---

# Avatar

A data-display component that shows an image, or initials derived from `text` when there is no
image (or while it loads). Supports a title / subtitle column for list and profile UIs.

Every example is live; flip its source between **Vue** (the styled component) and **HTML** (the
standalone `oriui/css` classes — the same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

An avatar is a block class plus paired token utilities — each pair is a base class
(`ori-size-action`) and a scale value (`ori-size-action_lg`), so one class repoints one token.
The Vue props below map 1:1 to these. There is no variant; an optional `color` tints the initials
backdrop.

:class-table{:rows='[{"class":"ori-avatar","type":"Block","description":"Required base class."},{"class":"ori-color + ori-color_*","type":"Color","description":"primary · secondary · success · warn · danger · info · surface · background — tints the initials backdrop"},{"class":"ori-size-action + ori-size-action_*","type":"Size","description":"xs · sm · md · <b>lg</b> · xl · xxl"},{"class":"ori-size-action-space + ori-size-action-space_*","type":"Size","description":"adds padding around the avatar when <code>spaced</code> is set"},{"class":"ori-size-radius + ori-size-radius_*","type":"Radius","description":"zero · xs · sm · md · lg · xl · <b>rounded</b>"},{"class":"ori-font-size + ori-font-size_*","type":"Font","description":"scales the initials text with the avatar size"},{"class":"ori-avatar__image · ori-avatar__backdrop · ori-avatar__text · ori-avatar__title · ori-avatar__subtitle","type":"Part","description":"image / initials fallback / text column / title / subtitle"},{"class":"ori-avatar_inline · ori-avatar_titled · ori-avatar_reverse","type":"Layout","description":"inline flow · title+subtitle layout · reversed image/text order"}]'}

## Image & initials

`src` (and any other image attribute) falls through via `$attrs` to the `<img>` element. When no
`src` is present — or while the image loads — the initials backdrop is shown instead, computing up
to two letters from the first two words of `text`.

::example
:ori-avatar{src="/image-example.jpg" text="Marcus Tullius Cicero"}
:ori-avatar{text="Marcus Tullius Cicero"}
:ori-avatar{text="Ada Lovelace"}

#vue

```vue
<OriAvatar src="/portrait.jpg" text="Marcus Tullius Cicero" />
<!-- no src — initials "MT" are derived from text -->
<OriAvatar text="Marcus Tullius Cicero" />
<!-- two words — initials "AL" -->
<OriAvatar text="Ada Lovelace" />
```

#html

```html
<!-- with image -->
<div
    class="ori-avatar ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_lg"
>
    <img class="ori-avatar__image" src="/portrait.jpg" alt="Marcus Tullius Cicero" />
</div>

<!-- initials fallback: backdrop is aria-hidden -->
<div
    class="ori-avatar ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_lg"
>
    <div class="ori-avatar__backdrop" aria-hidden="true">MT</div>
</div>
```

::

## Colors

An optional `color` tints the initials backdrop using the standard semantic token. Has no effect
when an image is showing.

::example
:ori-avatar{text="Primary" color="primary"}
:ori-avatar{text="Secondary" color="secondary"}
:ori-avatar{text="Success" color="success"}
:ori-avatar{text="Warn Color" color="warn"}
:ori-avatar{text="Danger" color="danger"}
:ori-avatar{text="Info" color="info"}
:ori-avatar{text="Surface" color="surface"}
:ori-avatar{text="Background" color="background"}

#vue

```vue
<OriAvatar text="Primary" color="primary" />
<OriAvatar text="Danger" color="danger" />
<OriAvatar text="Info" color="info" />
<OriAvatar text="Surface" color="surface" />
<OriAvatar text="Background" color="background" />
```

#html

```html
<div
    class="ori-avatar ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_lg ori-color ori-color_danger"
>
    <div class="ori-avatar__backdrop" aria-hidden="true">D</div>
</div>
```

::

## Sizes

`xs` → `xxl`. The size drives the box dimensions (`ori-size-action`) and the initials scale
(`ori-font-size`). Default is `lg`.

::example
:ori-avatar{text="Extra Small" size="xs"}
:ori-avatar{text="Small" size="sm"}
:ori-avatar{text="Medium" size="md"}
:ori-avatar{text="Large" size="lg"}
:ori-avatar{text="Extra Large" size="xl"}
:ori-avatar{text="Double Extra" size="xxl"}

#vue

```vue
<OriAvatar text="Small" size="sm" />
<OriAvatar text="Large" size="lg" />
<OriAvatar text="Extra Large" size="xl" />
```

#html

```html
<div
    class="ori-avatar ori-size-action ori-size-action_sm ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_sm"
>
    <div class="ori-avatar__backdrop" aria-hidden="true">S</div>
</div>
<div
    class="ori-avatar ori-size-action ori-size-action_xl ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_xl"
>
    <div class="ori-avatar__backdrop" aria-hidden="true">EL</div>
</div>
```

::

## Radius

From `zero` (square) to the default `rounded` (full pill / circle).

::example
:ori-avatar{text="Zero" radius="zero"}
:ori-avatar{text="Small" radius="sm"}
:ori-avatar{text="Medium" radius="md"}
:ori-avatar{text="Large" radius="lg"}
:ori-avatar{text="Rounded" radius="rounded"}

#vue

```vue
<OriAvatar text="Zero" radius="zero" />
<OriAvatar text="Rounded" radius="rounded" />
```

#html

```html
<div
    class="ori-avatar ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_zero ori-font-size ori-font-size_lg"
>
    <div class="ori-avatar__backdrop" aria-hidden="true">Z</div>
</div>
```

::

## With title & subtitle

Pass `title` and/or `subtitle` to show a text column beside the image or initials. The root
element switches to `max-content` width via `ori-avatar_titled`.

::example
:ori-avatar{src="/image-example.jpg" text="Marcus Tullius Cicero" title="Marcus Tullius Cicero" subtitle="statesman · lawyer · writer · orator"}
:ori-avatar{text="Ada Lovelace" color="secondary" title="Ada Lovelace" subtitle="mathematician · first programmer"}

#vue

```vue
<OriAvatar
    src="/portrait.jpg"
    text="Marcus Tullius Cicero"
    title="Marcus Tullius Cicero"
    subtitle="statesman · lawyer · writer · orator"
/>
<!-- initials with title -->
<OriAvatar text="Ada Lovelace" color="secondary" title="Ada Lovelace" subtitle="mathematician · first programmer" />
```

#html

```html
<!-- ori-avatar_titled activates the text column layout -->
<div
    class="ori-avatar ori-avatar_titled ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_lg"
>
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
:ori-avatar{text="Ada Lovelace" color="primary" title="Ada Lovelace" subtitle="mathematician" :reverse="true"}

#vue

```vue
<OriAvatar text="Ada Lovelace" color="primary" title="Ada Lovelace" subtitle="mathematician" reverse />
```

#html

```html
<div
    class="ori-avatar ori-avatar_titled ori-avatar_reverse ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_lg"
>
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
:ori-avatar{text="Ada Lovelace" size="xs" :inline="true"}
:ori-avatar{text="Marcus Tullius" size="xs" color="secondary" :inline="true"}

#vue

```vue
<OriAvatar text="Ada Lovelace" size="xs" inline />
<OriAvatar text="Marcus Tullius" size="xs" color="secondary" inline />
```

#html

```html
<div
    class="ori-avatar ori-avatar_inline ori-size-action ori-size-action_xs ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_xs"
>
    <div class="ori-avatar__backdrop" aria-hidden="true">AL</div>
</div>
```

::

## Spaced

`spaced` adds padding around the avatar via `ori-size-action-space`, useful when the avatar sits
inside a container that provides no gap of its own.

::example
:ori-avatar{text="Ada Lovelace" :spaced="true"}
:ori-avatar{text="Marcus Tullius" color="secondary" :spaced="true"}

#vue

```vue
<OriAvatar text="Ada Lovelace" spaced />
<OriAvatar text="Marcus Tullius" color="secondary" spaced />
```

#html

```html
<div
    class="ori-avatar ori-size-action ori-size-action_lg ori-size-action-space ori-size-action-space_lg ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_lg"
>
    <div class="ori-avatar__backdrop" aria-hidden="true">AL</div>
</div>
```

::

## Common patterns

A user-list row and a comment header — the everyday compositions.

::example
:ori-avatar{src="/image-example.jpg" text="Marcus Tullius Cicero" title="Marcus Tullius Cicero" subtitle="Admin"}
:ori-avatar{text="Ada Lovelace" color="secondary" title="Ada Lovelace" subtitle="Editor"}
:ori-avatar{text="Unknown User" color="surface" title="Unknown User" subtitle="Guest"}

#vue

```vue
<!-- user list row -->
<ul style="display: flex; flex-direction: column; gap: 0.75rem; list-style: none; padding: 0">
    <li v-for="user in users" :key="user.id">
        <OriAvatar
            :src="user.avatar"
            :text="user.name"
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
        <div
            class="ori-avatar ori-avatar_titled ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_lg"
        >
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

## Props

| Prop       | Type         | Default     | Description                                                                                                               |
| ---------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `color`    | `ThemeColor` | —           | Tints the initials backdrop: `primary` · `secondary` · `success` · `warn` · `danger` · `info` · `surface` · `background`. |
| `inline`   | `boolean`    | —           | Renders as `inline-flex` with a small margin for flowing inside text.                                                     |
| `radius`   | `RadiusSize` | `'rounded'` | Corner radius (`zero` · `xs` · `sm` · `md` · `lg` · `xl` · `rounded`).                                                    |
| `reverse`  | `boolean`    | —           | Reverses the flex direction so the text column appears before the image.                                                  |
| `size`     | `ActionSize` | `'lg'`      | Box size and initials scale (`xs` · `sm` · `md` · `lg` · `xl` · `xxl`).                                                   |
| `spaced`   | `boolean`    | —           | Adds padding around the avatar via `ori-size-action-space`.                                                               |
| `subtitle` | `string`     | —           | Secondary line in the text column; rendered whenever `title` or `subtitle` is set.                                        |
| `text`     | `string`     | —           | Drives the initials (up to two letters from the first two words) and the image `alt`.                                     |
| `title`    | `string`     | —           | Primary line in the text column; the text column appears when either `title` or `subtitle` is set.                        |

## Events & attributes

OriAvatar declares **no custom events**. It sets `inheritAttrs: false` and applies `v-bind="$attrs"`
directly to the `<img>` element — so `src`, `alt`, `width`, `height`, `loading`, `decoding`, and
any other image attribute or listener fall through to the image, not the wrapper `<div>`. Native
event listeners (`@error`, `@load`, …) follow the same path.

The `alt` attribute is overridden internally to the value of `text` (or `''` when `text` is not set)
so there is a single source of truth for the accessible name.

## Slots

OriAvatar exposes **no slots**. All content (image, initials backdrop, title, subtitle) is driven by
props and `$attrs`.

## Accessibility

- The `<img>` `alt` is always set — to the `text` prop value, or `''` (empty, decorative) when
  `text` is omitted. Do not pass a separate `alt` via `$attrs`; it will be overridden.
- The initials backdrop is `aria-hidden="true"` — it is a visual fallback, not semantic content.
- The `<img>` is revealed only after the `load` event fires (`v-show`), preventing a flash of a
  broken-image icon while the initials are still visible.
- There is no interactive behaviour; the component has no keyboard contract of its own. Wrap it in a
  `<button>` or `<a>` when it needs to be activatable, and supply an `aria-label` on the wrapper.

| Attribute            | Element      | Notes                                                            |
| -------------------- | ------------ | ---------------------------------------------------------------- |
| `alt` (from `text`)  | `<img>`      | Set automatically; omit `alt` in `$attrs` — it will be replaced. |
| `aria-hidden="true"` | `__backdrop` | Initials are decorative; screen readers read the image `alt`.    |
