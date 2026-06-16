---
title: Card
---

# Card

A surface container for grouping related content — a header (prepend slot · title · subtitle ·
append slot), a body, and optional action rows. It is the most _composed_ styled component, yet the
standalone markup is just nested `.ori-card__*` elements, so it works without Vue. Flip its source
between **Vue** (the styled component) and **HTML** (the standalone `oriui/css` classes — the same
markup for htmx, Astro, Svelte, or plain HTML).

## Classes

A card composes a block class plus paired token utilities — each pair is a base class (`ori-color`)
plus a scale value (`ori-color_surface`). The Vue `<OriCard>` props map 1:1 to these.

| Class                                                                                                                                                                                  | Category | Values (default in **bold**)                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `ori-card`                                                                                                                                                                             | Block    | required base class                                                                             |
| `ori-variant` + `ori-variant_*`                                                                                                                                                        | Variant  | **`fill`** · `tonal` · `outline` · `text` · `plain`                                             |
| `ori-color` + `ori-color_*`                                                                                                                                                            | Color    | `primary` · `secondary` · `success` · `warn` · `danger` · `info` · **`surface`** · `background` |
| `ori-size-radius` + `ori-size-radius_*`                                                                                                                                                | Radius   | `zero` · `xs` · `sm` · `md` · **`lg`** · `xl` · `rounded`                                       |
| `ori-card_row` · `ori-card_fluid` · `ori-card_icon`                                                                                                                                    | Modifier | horizontal layout · full width · icon-only (no `text`)                                          |
| `ori-card__header` · `ori-card__header-prepend` · `ori-card__headline` · `ori-card__title` · `ori-card__subtitle` · `ori-card__header-append` · `ori-card__body` · `ori-card__actions` | Parts    | header row · leading slot · headline · title · subtitle · trailing slot · body · action row     |
| `aria-disabled` · `aria-busy`                                                                                                                                                          | State    | real attributes, not classes (`disabled` / `loading` props)                                     |

## Anatomy

A card with a leading icon, a title + subtitle headline, and a body. The body text uses the
`on-surface` token, so it stays legible on every skin.

::example
:ori-card{title="Card title" subtitle="On the surface color" text="Cards sit on the surface token; the body text uses the matching on-color, so contrast holds across skins." prepend-icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" class="doc-card"}

#vue

```vue
<OriCard
    title="Card title"
    subtitle="On the surface color"
    text="Cards sit on the surface token; the body text uses the matching on-color."
    :prepend-icon="plusPath"
/>
```

#html

```html
<!-- full default class set: radius_lg + variant_fill + color_surface -->
<div class="ori-card ori-size-radius ori-size-radius_lg ori-variant ori-variant_fill ori-color ori-color_surface">
    <div class="ori-card__header">
        <div class="ori-card__header-prepend">
            <i class="ori-icon ori-size-action ori-size-action_sm" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
            </i>
        </div>
        <div class="ori-card__headline">
            <div class="ori-card__title">Card title</div>
            <div class="ori-card__subtitle">On the surface color</div>
        </div>
        <div class="ori-card__header-append"></div>
    </div>
    <div class="ori-card__body">Cards sit on the surface token; the body text uses the matching on-color.</div>
</div>
```

::

## Variants & color

Like every styled component, a card is driven by the `variant` + `color` token pair — `fill` paints
the surface, `tonal` is a soft wash, `outline` is just a border.

::example
:ori-card{variant="fill" color="primary" title="Fill" text="A filled card on the primary color." class="doc-card"}
:ori-card{variant="tonal" color="primary" title="Tonal" text="A soft tonal wash of the color." class="doc-card"}
:ori-card{variant="outline" color="primary" title="Outline" text="A bordered, transparent card." class="doc-card"}

#vue

```vue
<OriCard variant="fill" color="primary" title="Fill" text="A filled card on the primary color." />
<OriCard variant="tonal" color="primary" title="Tonal" text="A soft tonal wash of the color." />
<OriCard variant="outline" color="primary" title="Outline" text="A bordered, transparent card." />
```

#html

```html
<!-- full set once, then just swap the variant pair: ori-variant_fill → _tonal / _outline -->
<div class="ori-card ori-size-radius ori-size-radius_lg ori-variant ori-variant_fill ori-color ori-color_primary">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Fill</div></div>
    </div>
    <div class="ori-card__body">A filled card on the primary color.</div>
</div>

<div class="ori-card … ori-variant ori-variant_tonal ori-color ori-color_primary">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Tonal</div></div>
    </div>
    <div class="ori-card__body">A soft tonal wash of the color.</div>
</div>

<div class="ori-card … ori-variant ori-variant_outline ori-color ori-color_primary">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Outline</div></div>
    </div>
    <div class="ori-card__body">A bordered, transparent card.</div>
</div>
```

::

## Row layout

`row` lays the header and body out horizontally — handy for compact list items.

::example
:ori-card{:row="true" prepend-icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" title="Row layout" subtitle="header and body side by side" class="doc-card"}

#vue

```vue
<OriCard :row="true" :prepend-icon="plusPath" title="Row layout" subtitle="header and body side by side" />
```

#html

```html
<!-- ori-card_row sits alongside the full default token set and lays header + body horizontally -->
<div
    class="ori-card ori-card_row ori-size-radius ori-size-radius_lg ori-variant ori-variant_fill ori-color ori-color_surface"
>
    <div class="ori-card__header">
        <div class="ori-card__header-prepend">
            <i class="ori-icon ori-size-action ori-size-action_sm" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
            </i>
        </div>
        <div class="ori-card__headline">
            <div class="ori-card__title">Row layout</div>
            <div class="ori-card__subtitle">header and body side by side</div>
        </div>
    </div>
</div>
```

::

## States

`disabled` and `loading` are expressed as real attributes — `aria-disabled` and `aria-busy` — not
classes, matching the rest of the library.

::example
:ori-card{:disabled="true" title="Disabled" text="aria-disabled, dimmed, non-interactive." class="doc-card"}
:ori-card{:loading="true" title="Loading" text="aria-busy while content is fetched." class="doc-card"}

#vue

```vue
<OriCard :disabled="true" title="Disabled" text="aria-disabled, dimmed, non-interactive." />
<OriCard :loading="true" title="Loading" text="aria-busy while content is fetched." />
```

#html

```html
<!-- state is real attributes, not classes -->
<div
    class="ori-card ori-size-radius ori-size-radius_lg ori-variant ori-variant_fill ori-color ori-color_surface"
    aria-disabled="true"
>
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Disabled</div></div>
    </div>
    <div class="ori-card__body">aria-disabled, dimmed, non-interactive.</div>
</div>

<div class="ori-card … ori-variant ori-variant_fill ori-color ori-color_surface" aria-busy="true">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Loading</div></div>
    </div>
    <div class="ori-card__body">aria-busy while content is fetched.</div>
</div>
```

::

## Accessibility

- `disabled` → `aria-disabled="true"` + `pointer-events: none` (the card is dimmed, not removed
  from the DOM).
- `loading` → `aria-busy="true"`, so assistive tech announces the pending state.
- The body uses the `on-surface` token paired with the card's surface, keeping text contrast
  WCAG AA on every skin.
