---
title: Avatar
---

# Avatar

Shows an image, or initials derived from `text` when there is no image (or while it loads). Flip its
source between **Vue** (the styled component) and **HTML** (the standalone `oriui/css` classes — the
same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

An avatar composes a block class plus paired token utilities — each pair is a base class
(`ori-size-radius`) plus a scale value (`ori-size-radius_rounded`). The Vue `<OriAvatar>` props map
1:1 to these. There is no variant; an optional `color` tints the initials backdrop.

| Class                                                                                                            | Category | Values (default in **bold**)                                                                |
| ---------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `ori-avatar`                                                                                                     | Block    | required base class                                                                         |
| `ori-size-action` + `ori-size-action_*`                                                                          | Size     | `xs` · `sm` · `md` · **`lg`** · `xl` · `xxl`                                                |
| `ori-size-radius` + `ori-size-radius_*`                                                                          | Radius   | `zero` · `xs` · `sm` · `md` · `lg` · `xl` · **`rounded`**                                   |
| `ori-font-size` + `ori-font-size_*`                                                                              | Font     | scales the initials with the size (default `lg`)                                            |
| `ori-color` + `ori-color_*`                                                                                      | Color    | `primary` · `secondary` · `success` · `warn` · `danger` · `info` · `surface` · `background` |
| `ori-avatar_titled` · `ori-avatar_inline` · `ori-avatar_reverse`                                                 | Modifier | titled (title/subtitle present) · inline flow · reversed text/image order                   |
| `ori-avatar__image` · `ori-avatar__backdrop` · `ori-avatar__text` · `ori-avatar__title` · `ori-avatar__subtitle` | Parts    | image / initials fallback / text column / title / subtitle                                  |
| `aria-hidden`                                                                                                    | State    | the initials backdrop is `aria-hidden`; the image `alt` comes from `text`                   |

## Image & initials

::example
:ori-avatar{src="/image-example.jpg" text="Marcus Tullius Cicero"}
:ori-avatar{text="Marcus Tullius Cicero"}
:ori-avatar{text="Ada Lovelace"}

#vue

```vue
<OriAvatar src="/portrait.jpg" text="Marcus Tullius Cicero" />
<OriAvatar text="Marcus Tullius Cicero" />
```

#html

```html
<!-- image: ori-size-action sizes the box, ori-size-radius rounds it, ori-font-size scales the fallback -->
<div
    class="ori-avatar ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_lg"
>
    <img class="ori-avatar__image" src="/portrait.jpg" alt="Marcus Tullius Cicero" />
</div>

<!-- initials fallback: same classes, the backdrop is aria-hidden -->
<div
    class="ori-avatar … ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_lg"
>
    <div class="ori-avatar__backdrop" aria-hidden="true">MT</div>
</div>
```

::

## With title & subtitle

::example
:ori-avatar{src="/image-example.jpg" text="Marcus Tullius Cicero" title="Marcus Tullius Cicero" subtitle="statesman · lawyer · writer · orator"}

#vue

```vue
<OriAvatar
    src="/portrait.jpg"
    text="Marcus Tullius Cicero"
    title="Marcus Tullius Cicero"
    subtitle="statesman · lawyer · writer · orator"
/>
```

#html

```html
<!-- ori-avatar_titled places the text column beside the image; the full token set still applies -->
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

## Accessibility

- The image's `alt` comes from `text`; the initials fallback is `aria-hidden`.
