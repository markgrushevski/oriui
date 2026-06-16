---
title: Icon
---

# Icon

An inline SVG icon driven by a path string. Decorative by default (`aria-hidden`); pass a `label`
to expose it to assistive tech as an image. Flip its source between **Vue** (the styled component)
and **HTML** (the standalone `oriui/css` classes — the same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

An icon composes a block class plus paired token utilities — each pair is a base class (`ori-color`)
plus a scale value (`ori-color_primary`). The Vue `<OriIcon>` props map 1:1 to these. There is no
variant or radius — an icon only takes a size and an optional color.

| Class                                   | Category | Values (default in **bold**)                                                                    |
| --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `ori-icon`                              | Block    | required base class                                                                             |
| `ori-size-action` + `ori-size-action_*` | Size     | `xs` · `sm` · `md` · `lg` · `xl` · `xxl` (default inherits text)                                |
| `ori-color` + `ori-color_*`             | Color    | `primary` · `secondary` · `success` · `warn` · `danger` · `info` · `surface` · `background`     |
| `ori-icon_inline`                       | Modifier | inline flow (`inline` prop)                                                                     |
| `aria-hidden` · `role="img"`            | State    | decorative by default (`aria-hidden="true"`); a `label` switches to `role="img"` + `aria-label` |

## Sizes

::example
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="sm"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="md"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="xl"}

#vue

```vue
<OriIcon :icon="plusPath" size="sm" />
<OriIcon :icon="plusPath" size="xl" />
```

#html

```html
<!-- ori-size-action drives the icon box; aria-hidden because it is decorative -->
<i class="ori-icon ori-size-action ori-size-action_sm" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
<i class="ori-icon ori-size-action ori-size-action_xl" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
```

::

## Colors

::example
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="primary" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="danger" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="success" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="warn" size="lg"}

#vue

```vue
<OriIcon :icon="plusPath" color="primary" size="lg" />
<OriIcon :icon="plusPath" color="danger" size="lg" />
```

#html

```html
<!-- add the ori-color pair: ori-color ori-color_<color> -->
<i class="ori-icon ori-size-action ori-size-action_lg ori-color ori-color_primary" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
<i class="ori-icon ori-size-action ori-size-action_lg ori-color ori-color_danger" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
```

::

## Accessibility

- Decorative by default: `aria-hidden="true"`, no role.
- Pass `label` to announce it: renders `role="img"` + `aria-label`.
