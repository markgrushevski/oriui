---
title: Icon
---

# Icon

An inline SVG icon driven by a path string. Decorative by default (`aria-hidden`); pass a `label`
to expose it to assistive tech as an image. Flip the source between **Vue** and **Svelte** (the
standalone `.ori-*` classes — the same markup you'd use in htmx, Astro, or plain HTML).

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

#svelte

```svelte
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

#svelte

```svelte
<i class="ori-icon ori-size-action ori-size-action_lg ori-color ori-color_primary" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="…" /></svg>
</i>
```

::

## Accessibility

- Decorative by default: `aria-hidden="true"`, no role.
- Pass `label` to announce it: renders `role="img"` + `aria-label`.
