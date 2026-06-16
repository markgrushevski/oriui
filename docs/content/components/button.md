---
title: Button
---

# Button

A styled, accessible button. Dynamic state is expressed through real attributes — `disabled`
becomes a true `disabled` (or `aria-disabled` for link buttons), `loading` sets `aria-busy`, and
it ships a visible `:focus-visible` ring.

Every example below is live, with its source switchable between **Vue** (the styled component) and
**Svelte** (the framework-agnostic `oriui/css` classes) — flip the tabs.

## Variants

::example
:ori-button{text="Fill" variant="fill" color="primary"}
:ori-button{text="Tonal" variant="tonal" color="primary"}
:ori-button{text="Outline" variant="outline" color="primary"}
:ori-button{text="Text" variant="text" color="primary"}
:ori-button{text="Plain" variant="plain" color="primary"}

#vue

```vue
<OriButton text="Fill" variant="fill" color="primary" />
<OriButton text="Tonal" variant="tonal" color="primary" />
<OriButton text="Outline" variant="outline" color="primary" />
<OriButton text="Text" variant="text" color="primary" />
<OriButton text="Plain" variant="plain" color="primary" />
```

#svelte

```svelte
<button class="ori-button ori-variant ori-variant_fill ori-color ori-color_primary">Fill</button>
<button class="ori-button ori-variant ori-variant_tonal ori-color ori-color_primary">Tonal</button>
<button class="ori-button ori-variant ori-variant_outline ori-color ori-color_primary">Outline</button>
<button class="ori-button ori-variant ori-variant_text ori-color ori-color_primary">Text</button>
<button class="ori-button ori-variant ori-variant_plain ori-color ori-color_primary">Plain</button>
```

::

## Colors

::example
:ori-button{text="primary" color="primary"}
:ori-button{text="secondary" color="secondary"}
:ori-button{text="success" color="success"}
:ori-button{text="warn" color="warn"}
:ori-button{text="danger" color="danger"}
:ori-button{text="info" color="info"}

#vue

```vue
<OriButton text="primary" color="primary" />
<OriButton text="danger" color="danger" />
<OriButton text="info" color="info" />
```

#svelte

```svelte
<button class="ori-button ori-variant ori-variant_fill ori-color ori-color_primary">primary</button>
<button class="ori-button ori-variant ori-variant_fill ori-color ori-color_danger">danger</button>
<button class="ori-button ori-variant ori-variant_fill ori-color ori-color_info">info</button>
```

::

## States

::example
:ori-button{text="loading" loading="true" color="primary"}
:ori-button{text="disabled" disabled="true" color="primary"}

#vue

```vue
<OriButton text="loading" loading color="primary" />
<OriButton text="disabled" disabled color="primary" />
```

#svelte

```svelte
<button class="ori-button ori-variant ori-variant_fill ori-color ori-color_primary" aria-busy="true">loading</button>
<button class="ori-button ori-variant ori-variant_fill ori-color ori-color_primary" disabled>disabled</button>
```

::

## Accessibility

- Renders a real `<button type="button">` by default; `as="a"` (or a router link) switches the tag
  and uses `aria-disabled` + `tabindex` instead of the boolean `disabled`.
- `loading` sets `aria-busy="true"`; the spinner is `aria-hidden`.
- Visible `:focus-visible` outline; state lives in attributes, not classes.
