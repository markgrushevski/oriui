---
title: Card
---

# Card

A surface container for grouping related content — a header (prepend slot · title · subtitle ·
append slot), a body, and optional action rows. It is the most _composed_ styled component, yet the
standalone markup is just nested `.ori-card__*` elements, so it works without Vue.

Every example is live and shows the standalone **HTML / `@oriui/css`** markup by default — the same
nested `.ori-card__*` classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to
**Vue** for the styled component.

## Classes

A card is a block class plus single-class token utilities — one class repoints one token, no base
class needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-card","type":"Block","description":"Required base class. Defaults bake in fill variant, surface color, and lg radius — a bare ori-card is valid."},{"class":"ori-variant_*","type":"Style","description":"<b>fill</b> · tonal · outline · text · plain"},{"class":"ori-color_*","type":"Color","description":"primary · secondary · success · warn · danger · info · <b>surface</b> · background"},{"class":"ori-size-radius_*","type":"Radius","description":"zero · xs · sm · md · <b>lg</b> · xl · rounded"},{"class":"ori-card_fluid","type":"Layout","description":"full-width card"},{"class":"ori-card_row","type":"Layout","description":"horizontal layout — header and body side by side"},{"class":"ori-card__header · ori-card__header-prepend · ori-card__headline · ori-card__title · ori-card__subtitle · ori-card__header-append · ori-card__body · ori-card__actions","type":"Part","description":"structural BEM elements — header row · leading area · headline wrapper · title · subtitle · trailing area · body · action row"},{"class":"ori-card__actions_reverse","type":"Layout","description":"reverses the flex direction of an action row"},{"class":"aria-disabled · aria-busy","type":"State","description":"real attributes, not classes (disabled / loading props)"}]'}

## Anatomy

The card's slot structure from top to bottom. Each named slot falls back to a corresponding prop, so
simple use stays one-liner and complex layouts plug in via slots.

```
ori-card
  └── [slot: actions-prepend]   ← prepended action row (order flipped by reversePrependedActions)
  └── ori-card__header
        └── ori-card__header-prepend  ← [slot: header-prepend] / prependAvatar / prependIcon
        └── ori-card__headline
              └── ori-card__title     ← [slot: title] / title prop
              └── ori-card__subtitle  ← [slot: subtitle] / subtitle prop
        └── ori-card__header-append   ← [slot: header-append] / appendAvatar / appendIcon
  └── ori-card__body            ← [slot: body] / text prop
  └── [slot: actions-append]    ← appended action row (order flipped by reverseAppendedActions)
```

## Variants

Five visual styles, all driven by the `ori-variant_*` utilities. The default is `fill` on `surface`.

::example
:ori-card{variant="fill" color="surface" title="Fill" text="Default fill on surface."}
:ori-card{variant="tonal" color="surface" title="Tonal" text="Soft tonal wash."}
:ori-card{variant="outline" color="surface" title="Outline" text="Bordered, transparent."}
:ori-card{variant="text" color="surface" title="Text" text="No border, no background."}
:ori-card{variant="plain" color="surface" title="Plain" text="Fully unstyled variant."}

#vue

```vue
<OriCard variant="fill" title="Fill" text="Default fill on surface." />
<OriCard variant="tonal" title="Tonal" text="Soft tonal wash." />
<OriCard variant="outline" title="Outline" text="Bordered, transparent." />
<OriCard variant="text" title="Text" text="No border, no background." />
<OriCard variant="plain" title="Plain" text="Fully unstyled variant." />
```

#html

```html
<div class="ori-card ori-size-radius_lg ori-variant_fill ori-color_surface">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Fill</div></div>
    </div>
    <div class="ori-card__body">Default fill on surface.</div>
</div>
<!-- swap the variant: ori-variant_fill → ori-variant_tonal / ori-variant_outline / ori-variant_text / ori-variant_plain -->
```

::

## Colors

Every semantic role composes with every variant. `surface` is the default — neutral elevation.

::example
:ori-card{variant="tonal" color="primary" title="primary"}
:ori-card{variant="tonal" color="secondary" title="secondary"}
:ori-card{variant="tonal" color="success" title="success"}
:ori-card{variant="tonal" color="warn" title="warn"}
:ori-card{variant="tonal" color="danger" title="danger"}
:ori-card{variant="tonal" color="info" title="info"}
:ori-card{variant="tonal" color="surface" title="surface (default)"}
:ori-card{variant="tonal" color="background" title="background"}

#vue

```vue
<OriCard variant="tonal" color="primary" title="primary" />
<OriCard variant="tonal" color="secondary" title="secondary" />
<OriCard variant="tonal" color="success" title="success" />
<OriCard variant="tonal" color="warn" title="warn" />
<OriCard variant="tonal" color="danger" title="danger" />
<OriCard variant="tonal" color="info" title="info" />
<OriCard variant="tonal" color="surface" title="surface (default)" />
<OriCard variant="tonal" color="background" title="background" />
```

#html

```html
<div class="ori-card ori-size-radius_lg ori-variant_tonal ori-color_danger">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">danger</div></div>
    </div>
</div>
<!-- swap the color: ori-color_danger → ori-color_primary / ori-color_secondary / ori-color_success / ori-color_warn / ori-color_info / ori-color_surface / ori-color_background -->
```

::

Variant × color compose freely — e.g. a filled danger card or an outlined info card:

::example
:ori-card{variant="fill" color="danger" title="Delete zone" text="This action is irreversible."}
:ori-card{variant="outline" color="info" title="Note" text="Extra context lives here."}
:ori-card{variant="tonal" color="success" title="All clear" text="Everything looks good."}

#vue

```vue
<OriCard variant="fill" color="danger" title="Delete zone" text="This action is irreversible." />
<OriCard variant="outline" color="info" title="Note" text="Extra context lives here." />
<OriCard variant="tonal" color="success" title="All clear" text="Everything looks good." />
```

#html

```html
<div class="ori-card ori-size-radius_lg ori-variant_fill ori-color_danger">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Delete zone</div></div>
    </div>
    <div class="ori-card__body">This action is irreversible.</div>
</div>
```

::

## Radius

From `zero` (sharp) to `rounded` (pill-like). The default is `lg`.

::example
:ori-card{radius="zero" title="zero" text="No corner radius."}
:ori-card{radius="sm" title="sm" text="Subtle rounding."}
:ori-card{radius="lg" title="lg (default)" text="Default rounding."}
:ori-card{radius="xl" title="xl" text="Generous rounding."}
:ori-card{radius="rounded" title="rounded" text="Maximum radius."}

#vue

```vue
<OriCard radius="zero" title="zero" text="No corner radius." />
<OriCard radius="lg" title="lg (default)" text="Default rounding." />
<OriCard radius="rounded" title="rounded" text="Maximum radius." />
```

#html

```html
<div class="ori-card ori-size-radius_zero ori-variant_fill ori-color_surface">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">zero</div></div>
    </div>
    <div class="ori-card__body">No corner radius.</div>
</div>
```

::

## With header media

`prependIcon` / `prependAvatar` populate the leading slot; `appendIcon` / `appendAvatar` populate
the trailing slot. Pass an SVG path to `prependIcon` or a URL to `prependAvatar`.

::example
:ori-card{title="With icon" subtitle="Leading icon via prependIcon" prependIcon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"}
:ori-card{title="Trailing icon" subtitle="Trailing icon via appendIcon" appendIcon="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"}

#vue

```vue
<OriCard title="With icon" subtitle="Leading icon via prependIcon" prependIcon="M12 2C6.48 2 2 6.48 2 12s4.48 10 …" />
<OriCard title="Trailing icon" subtitle="Trailing icon via appendIcon" appendIcon="M12 8c1.1 0 2-.9 2-2 …" />
```

#html

```html
<div class="ori-card ori-size-radius_lg ori-variant_fill ori-color_surface">
    <div class="ori-card__header">
        <div class="ori-card__header-prepend">
            <i class="ori-icon ori-icon_sm" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 …" /></svg>
            </i>
        </div>
        <div class="ori-card__headline">
            <div class="ori-card__title">With icon</div>
            <div class="ori-card__subtitle">Leading icon via prependIcon</div>
        </div>
        <div class="ori-card__header-append"></div>
    </div>
</div>
```

::

## Row layout

`row` lays the header and body out horizontally — handy for compact list items or media objects.

::example
:ori-card{:row="true" prependIcon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" title="Row layout" subtitle="Header and body side by side"}

#vue

```vue
<OriCard
    :row="true"
    prependIcon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z"
    title="Row layout"
    subtitle="Header and body side by side"
/>
```

#html

```html
<div class="ori-card ori-card_row ori-size-radius_lg ori-variant_fill ori-color_surface">
    <div class="ori-card__header">
        <div class="ori-card__header-prepend">
            <i class="ori-icon ori-icon_sm" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
            </i>
        </div>
        <div class="ori-card__headline">
            <div class="ori-card__title">Row layout</div>
            <div class="ori-card__subtitle">Header and body side by side</div>
        </div>
    </div>
</div>
```

::

## Block (fluid)

`fluid` stretches the card to the full width of its container.

::example
:ori-card{:fluid="true" title="Full width" text="This card fills its container."}

#vue

```vue
<OriCard :fluid="true" title="Full width" text="This card fills its container." />
```

#html

```html
<div class="ori-card ori-card_fluid ori-size-radius_lg ori-variant_fill ori-color_surface">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Full width</div></div>
    </div>
    <div class="ori-card__body">This card fills its container.</div>
</div>
```

::

## States

`disabled` and `loading` are expressed as real attributes — `aria-disabled` and `aria-busy` — not
classes, matching the rest of the library.

::example
:ori-card{:disabled="true" title="Disabled" text="aria-disabled — dimmed, non-interactive."}
:ori-card{:loading="true" title="Loading" text="aria-busy while content is fetched."}

#vue

```vue
<OriCard :disabled="true" title="Disabled" text="aria-disabled — dimmed, non-interactive." />
<OriCard :loading="true" title="Loading" text="aria-busy while content is fetched." />
```

#html

```html
<div class="ori-card ori-size-radius_lg ori-variant_fill ori-color_surface" aria-disabled="true">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Disabled</div></div>
    </div>
    <div class="ori-card__body">aria-disabled — dimmed, non-interactive.</div>
</div>

<div class="ori-card ori-size-radius_lg ori-variant_fill ori-color_surface" aria-busy="true">
    <div class="ori-card__header">
        <div class="ori-card__headline"><div class="ori-card__title">Loading</div></div>
    </div>
    <div class="ori-card__body">aria-busy while content is fetched.</div>
</div>
```

::

## Common patterns

A profile card and a notification card with an action row — everyday compositions using slots.

::example
:ori-card{prependIcon="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" title="Jane Smith" subtitle="Product designer" text="Leading product design at oriUI — focused on accessible, expressive systems."}

#vue

```vue
<!-- Profile card -->
<OriCard
    :prepend-icon="personPath"
    title="Jane Smith"
    subtitle="Product designer"
    text="Leading product design at oriUI — focused on accessible, expressive systems."
/>
```

#html

```html
<div class="ori-card ori-size-radius_lg ori-variant_fill ori-color_surface">
    <div class="ori-card__header">
        <div class="ori-card__header-prepend">
            <i class="ori-icon ori-icon_sm" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4 …" /></svg>
            </i>
        </div>
        <div class="ori-card__headline">
            <div class="ori-card__title">Jane Smith</div>
            <div class="ori-card__subtitle">Product designer</div>
        </div>
    </div>
    <div class="ori-card__body">Leading product design at oriUI — focused on accessible, expressive systems.</div>
</div>
```

::

Notification card with an `actions-append` row. Use `:reverse-appended-actions="true"` to flip
the button order (e.g. destructive action on the right).

::example

#vue

```vue
<!-- Notification card with action row -->
<OriCard
    variant="outline"
    color="warn"
    title="Delete account?"
    text="This will permanently remove your data. This action cannot be undone."
>
    <template #actions-append>
        <OriButton variant="text">Cancel</OriButton>
        <OriButton variant="fill" color="danger">Delete</OriButton>
    </template>
</OriCard>

<!-- Reversed order (confirm on right) -->
<OriCard
    variant="fill"
    color="surface"
    title="Save changes?"
    text="You have unsaved edits. Would you like to save before leaving?"
    :reverse-appended-actions="true"
>
    <template #actions-append>
        <OriButton variant="text">Discard</OriButton>
        <OriButton variant="tonal" color="primary">Save</OriButton>
    </template>
</OriCard>
```

#html

```html
<!-- Notification card with action row -->
<div class="ori-card ori-size-radius_lg ori-variant_outline ori-color_warn">
    <div class="ori-card__header">
        <div class="ori-card__headline">
            <div class="ori-card__title">Delete account?</div>
        </div>
    </div>
    <div class="ori-card__body">This will permanently remove your data. This action cannot be undone.</div>
    <div class="ori-card__actions">
        <button class="ori-button ori-variant_text">Cancel</button>
        <button class="ori-button ori-variant_fill ori-color_danger">Delete</button>
    </div>
</div>

<!-- Reversed order: add ori-card__actions_reverse to flip flex direction -->
<div class="ori-card ori-size-radius_lg ori-variant_fill ori-color_surface">
    <div class="ori-card__header">
        <div class="ori-card__headline">
            <div class="ori-card__title">Save changes?</div>
        </div>
    </div>
    <div class="ori-card__body">You have unsaved edits. Would you like to save before leaving?</div>
    <div class="ori-card__actions ori-card__actions_reverse">
        <button class="ori-button ori-variant_text">Discard</button>
        <button class="ori-button ori-variant_tonal ori-color_primary">Save</button>
    </div>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- `disabled` maps to `aria-disabled="true"` + `pointer-events: none` — the card is dimmed but
  remains in the DOM and in the tab order (suitable for progressive-disclosure UIs).
- `loading` maps to `aria-busy="true"` — assistive technology announces that the region is
  updating. Combine with a visible spinner inside the `body` slot when appropriate.
- Decorative icons (`prependIcon`, `appendIcon`) are rendered via `<OriIcon>` which sets
  `aria-hidden="true"` automatically.
- Card does not manage focus itself. If the card triggers a navigation or dialog, add the
  appropriate role (`role="button"`, `tabindex="0"`) and keyboard handler to the root element via
  attribute fall-through.
- The body uses the `on-surface` token paired with the card's surface color, keeping text contrast
  WCAG AA on every skin.

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop                      | Type         | Default     | Description                                                                                 |
| ------------------------- | ------------ | ----------- | ------------------------------------------------------------------------------------------- |
| `appendAvatar`            | `string`     | —           | URL for an avatar in the trailing header slot.                                              |
| `appendIcon`              | `string`     | —           | SVG path for an icon in the trailing header slot.                                           |
| `color`                   | `ThemeColor` | `'surface'` | Semantic role: primary · secondary · success · warn · danger · info · surface · background. |
| `disabled`                | `boolean`    | —           | Sets `aria-disabled="true"` and `pointer-events: none`.                                     |
| `fluid`                   | `boolean`    | —           | Stretches the card to full container width (`ori-card_fluid`).                              |
| `image`                   | `string`     | —           | Reserved for a hero image URL (not yet rendered by the template).                           |
| `loading`                 | `boolean`    | —           | Sets `aria-busy="true"` and `pointer-events: none`.                                         |
| `prependAvatar`           | `string`     | —           | URL for an avatar in the leading header slot.                                               |
| `prependIcon`             | `string`     | —           | SVG path for an icon in the leading header slot.                                            |
| `radius`                  | `RadiusSize` | `'lg'`      | Corner radius: `zero` · `xs` · `sm` · `md` · `lg` · `xl` · `rounded`.                       |
| `reverseAppendedActions`  | `boolean`    | —           | Reverses the flex direction of the `actions-append` row.                                    |
| `reversePrependedActions` | `boolean`    | —           | Reverses the flex direction of the `actions-prepend` row.                                   |
| `row`                     | `boolean`    | —           | Horizontal layout — header and body side by side (`ori-card_row`).                          |
| `subtitle`                | `string`     | —           | Subtitle below the title; falls back to the `subtitle` slot.                                |
| `text`                    | `string`     | —           | Body text; falls back to the `body` slot.                                                   |
| `title`                   | `string`     | —           | Primary heading; falls back to the `title` slot.                                            |
| `variant`                 | `Variant`    | `'fill'`    | Visual style: `fill` · `tonal` · `outline` · `text` · `plain`.                              |

### Events & attributes

OriCard declares **no custom events** and does not set `inheritAttrs: false`, so native attributes
(`id`, `class`, `style`, `data-*`, `aria-*`, event listeners, etc.) fall through to the root `<div>`.

### Slots

| Slot              | Falls back to                   | Description                                                                       |
| ----------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| `default`         | —                               | Replaces the entire built-in card structure. You own the full interior markup.    |
| `actions-prepend` | _(nothing — slot must be used)_ | Action row rendered before the header. `reversePrependedActions` flips its order. |
| `header-prepend`  | `prependAvatar` / `prependIcon` | Leading area of the header row (avatar, icon, or custom media).                   |
| `title`           | `title` prop                    | Primary heading inside the headline.                                              |
| `subtitle`        | `subtitle` prop                 | Secondary line below the title.                                                   |
| `header-append`   | `appendAvatar` / `appendIcon`   | Trailing area of the header row (avatar, icon, or custom control).                |
| `body`            | `text` prop                     | Main content area below the header.                                               |
| `actions-append`  | _(nothing — slot must be used)_ | Action row rendered after the body. `reverseAppendedActions` flips its order.     |
