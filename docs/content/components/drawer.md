---
title: Drawer
---

# Drawer

A panel docked to one edge of the viewport: a filter sheet, a settings pane, a cart, the navigation on a phone.
It runs on the same `useDialog` engine and the same native `<dialog>` element as [OriDialog](/components/dialog),
so what a dialog gets from the platform, a drawer gets too. Opened **modally** (the default) it uses
`showModal()`: a backdrop, a focus trap, an inert page, `Esc` to close and focus returned to whatever opened it.
Opened **non-modally** it is a manual popover, so it still sits in the top layer while the page behind stays
live. Swipe to dismiss, snap points and nested drawers are not in this version.

The examples are organized by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / plain-HTML
usage) and **Vue**; the first example also shows the **Svelte** and **React** bindings of `@oriui/headless`
(in development). HTML is the default.

## Classes

A drawer is a block class plus one side modifier, hung on a native `<dialog>` element. Each part class maps to
a structural element produced by the component.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-drawer","type":"Block","description":"The native <code>dialog</code> docked to a viewport edge: fixed, surface-colored, shadowed, and scrolling when its content is taller. Its <code>::backdrop</code> is the dimmed overlay; a modal drawer also locks the page scroll."},{"class":"ori-drawer_start · ori-drawer_end","type":"Modifier","description":"Dock to the inline start or end edge, full height. Width is <code>min(var(--ori-drawer-size), 100% - 3rem)</code>, 20rem by default. Logical: they swap sides in RTL."},{"class":"ori-drawer_top · ori-drawer_bottom","type":"Modifier","description":"Dock to the top or bottom edge. Height is the content height, up to <code>--ori-drawer-size</code> (85dvh by default); at most 40rem wide, centered."},{"class":"--ori-drawer-size","type":"Custom prop","description":"Width of a side drawer, maximum height of a top or bottom one. Set it on the element."},{"class":"ori-drawer__content","type":"Layout","description":"Flex column that fills the drawer: 24 px padding, 12 px gap, and extra padding for the safe-area insets on the edges the drawer touches."},{"class":"ori-drawer__header","type":"Part","description":"Flex row: the title at the start, the close button at the end."},{"class":"ori-drawer__title","type":"Part","description":"<code>h2</code> heading; its <code>id</code> is wired to <code>aria-labelledby</code> on the drawer."},{"class":"ori-drawer__close","type":"Part","description":"Bare close button (<code>aria-label=Close</code>); styled via opacity."},{"class":"ori-drawer__body","type":"Part","description":"Body region: fills the space between the header and the footer, and is the one part that scrolls."},{"class":"ori-drawer__footer","type":"Part","description":"Actions row, end-aligned and wrapping, below the body."},{"class":"open · popover","type":"State","description":"A modal drawer is a <code>dialog</code> opened with <code>showModal()</code>; a non-modal one carries <code>popover=manual</code> and is opened with <code>showPopover()</code>. Real attributes, not classes."}]'}

**À la carte:** the classes above ship in `@oriui/css/components/drawer.css`. Import a foundation
(`@oriui/css/base.css` or `@oriui/css/tokens.css`) first — the tokens the drawer reads (`--ori-color-surface`,
`--ori-shadow-lg`, the radius scale) live there, not in the component file. The full bundle `@oriui/css` is the
default and already carries both; see [à-la-carte imports](/guides/css).

## Anatomy

The component renders its parts in this order:

```
#trigger slot (caller-supplied toggle)
  └─ <dialog class="ori-drawer ori-drawer_end">   (native element; modal → showModal(), non-modal → popover="manual")
       └─ .ori-drawer__content                    (padded flex column)
            ├─ .ori-drawer__header
            │    ├─ .ori-drawer__title             (h2; #title slot or `title` prop — omitted when neither is set)
            │    └─ .ori-drawer__close             (× button, aria-label="Close")
            ├─ .ori-drawer__body                   (default slot)
            └─ .ori-drawer__footer                 (#footer slot — rendered only when provided)
```

The `<dialog>` is rendered inline; opening it promotes it to the browser's top layer, so it escapes any stacking
context, `transform` or `overflow` of its ancestors without `<Teleport>`. A closed drawer is hidden, so SSR
markup stays stable.

## Basic

Pick an edge, open the drawer, tab through its controls, press `Esc`, and observe that focus returns to the
trigger. Page scroll is locked while it is open.

::example
:drawer-demo

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OriButton, OriDrawer } from '@oriui/vue'

const open = ref(false)
</script>

<template>
    <OriDrawer v-model:open="open" title="Filters">
        <template #trigger="{ props }">
            <OriButton v-bind="props" label="Open drawer" />
        </template>
        <p>Narrow the list by status, owner or date.</p>
        <template #footer>
            <OriButton label="Cancel" variant="text" @click="open = false" />
            <OriButton label="Apply" @click="open = false" />
        </template>
    </OriDrawer>
</template>
```

#html

```html
<!-- Structure only — open it with dialog.showModal() to get the trap, the ::backdrop and the page scroll lock. -->
<button class="ori-button" onclick="document.getElementById('filters').showModal()">Open drawer</button>

<dialog id="filters" class="ori-drawer ori-drawer_end" aria-labelledby="filters-title">
    <div class="ori-drawer__content">
        <header class="ori-drawer__header">
            <h2 id="filters-title" class="ori-drawer__title">Filters</h2>
            <button class="ori-drawer__close" aria-label="Close" onclick="this.closest('dialog').close()">×</button>
        </header>
        <div class="ori-drawer__body">
            <p>Narrow the list by status, owner or date.</p>
        </div>
        <footer class="ori-drawer__footer">
            <button class="ori-button ori-variant_text" onclick="this.closest('dialog').close()">Cancel</button>
            <button class="ori-button ori-variant_solid ori-color_primary" onclick="this.closest('dialog').close()">
                Apply
            </button>
        </footer>
    </div>
</dialog>
```

#svelte

```svelte
<script>
    import { useDialog } from '@oriui/headless/svelte';

    // No styled Svelte component yet — drive a native <dialog> with @oriui/headless/svelte.
    let drawerEl;
    const { open, triggerProps, dialogProps, titleProps, closeTriggerProps } = useDialog({ id: 'filters' });

    // The platform gives the focus trap, Esc and ::backdrop; we only toggle showModal()/close() on `open`.
    $effect(() => {
        if (!drawerEl) return;
        if ($open && !drawerEl.open) drawerEl.showModal();
        else if (!$open && drawerEl.open) drawerEl.close();
    });
</script>

<button {...$triggerProps} class="ori-button">Open drawer</button>

<dialog {...$dialogProps} bind:this={drawerEl} class="ori-drawer ori-drawer_end">
    <div class="ori-drawer__content">
        <header class="ori-drawer__header">
            <h2 {...$titleProps} class="ori-drawer__title">Filters</h2>
            <button {...$closeTriggerProps} class="ori-drawer__close" aria-label="Close">×</button>
        </header>
        <div class="ori-drawer__body">
            <p>Narrow the list by status, owner or date.</p>
        </div>
        <footer class="ori-drawer__footer">
            <button {...$closeTriggerProps} class="ori-button ori-variant_text">Cancel</button>
            <button {...$closeTriggerProps} class="ori-button">Apply</button>
        </footer>
    </div>
</dialog>
```

#react

```tsx
import { useEffect, useRef } from 'react'
import { useDialog } from '@oriui/headless/react'

// No styled React component yet — drive a native <dialog> with @oriui/headless/react.
function Filters() {
    const drawerRef = useRef<HTMLDialogElement>(null)
    const { open, triggerProps, dialogProps, titleProps, closeTriggerProps } = useDialog({ id: 'filters' })

    // The platform gives the focus trap, Esc and ::backdrop; we only toggle showModal()/close() on `open`.
    useEffect(() => {
        const el = drawerRef.current
        if (!el) return
        if (open && !el.open) el.showModal()
        else if (!open && el.open) el.close()
    }, [open])

    return (
        <>
            <button {...triggerProps} className="ori-button">
                Open drawer
            </button>

            <dialog {...dialogProps} ref={drawerRef} className="ori-drawer ori-drawer_end">
                <div className="ori-drawer__content">
                    <header className="ori-drawer__header">
                        <h2 {...titleProps} className="ori-drawer__title">
                            Filters
                        </h2>
                        <button {...closeTriggerProps} className="ori-drawer__close" aria-label="Close">
                            ×
                        </button>
                    </header>
                    <div className="ori-drawer__body">
                        <p>Narrow the list by status, owner or date.</p>
                    </div>
                    <footer className="ori-drawer__footer">
                        <button {...closeTriggerProps} className="ori-button ori-variant_text">
                            Cancel
                        </button>
                        <button {...closeTriggerProps} className="ori-button">
                            Apply
                        </button>
                    </footer>
                </div>
            </dialog>
        </>
    )
}
```

::

A modal drawer needs the CSS layer for the page scroll lock: `showModal()` makes the page inert but leaves it
scrollable (a wheel over the backdrop still scrolls it), so `drawer.css` sets `overflow: hidden` on the root
while a modal drawer is open. Where scrollbars take up space (Windows, most Linux desktops), the dimmed page
shifts by the scrollbar's width while the drawer is open.

## Sides

`side` picks the edge: `start`, `end` (the default), `top` or `bottom`. Side drawers span the full height and are
`min(var(--ori-drawer-size), 100% - 3rem)` wide: 20rem by default, and never wider than the viewport minus 3rem,
so on a phone a strip of the page stays in view. That strip is the backdrop, and tapping it closes the drawer.
Top and bottom drawers take the height of their content, up to `--ori-drawer-size` (85dvh by default), and are at
most 40rem wide, centered.

::example
:drawer-demo{side="start" label="Start"}
:drawer-demo{side="end" label="End"}
:drawer-demo{side="top" label="Top"}
:drawer-demo{side="bottom" label="Bottom"}

#vue

```vue
<!-- `end` is the default; `start` and `end` are logical and swap sides in RTL. -->
<OriDrawer side="start" title="Start">…</OriDrawer>
<OriDrawer side="end" title="End">…</OriDrawer>
<OriDrawer side="top" title="Top">…</OriDrawer>
<OriDrawer side="bottom" title="Bottom">…</OriDrawer>
```

#html

```html
<!-- Swap the side modifier: ori-drawer_start / _end / _top / _bottom. -->
<dialog class="ori-drawer ori-drawer_start" aria-label="Start">…</dialog>
<dialog class="ori-drawer ori-drawer_end" aria-label="End">…</dialog>
<dialog class="ori-drawer ori-drawer_top" aria-label="Top">…</dialog>
<dialog class="ori-drawer ori-drawer_bottom" aria-label="Bottom">…</dialog>
```

::

## Right-to-left

`start` and `end` follow the writing direction, and the slide follows them: in a right-to-left layout `start`
docks to the right edge and slides in from the right. `top` and `bottom` do not change. Nothing to configure —
the drawer reads the direction it inherits (see [Right-to-left](/guides/rtl)).

::example
:drawer-demo{side="start" label="Start, in RTL" dir="rtl"}
:drawer-demo{side="end" label="End, in RTL" dir="rtl"}

#vue

```vue
<!-- dir="rtl" on any ancestor, usually <html>: `start` is now the right edge. -->
<div dir="rtl">
    <OriDrawer side="start" title="القائمة">…</OriDrawer>
</div>
```

#html

```html
<div dir="rtl">
    <dialog class="ori-drawer ori-drawer_start" aria-label="القائمة">…</dialog>
</div>
```

::

## Sizing

`--ori-drawer-size` is the one size knob: the width of a side drawer, the maximum height of a top or bottom one.
Set it on the element, inline or from a class of your own (an unlayered rule beats the layered default). A side
drawer is still capped at the viewport minus 3rem, so a wide value is safe on a phone.

::example
:drawer-demo{side="end" size="32rem" label="32rem wide"}
:drawer-demo{side="end" size="14rem" label="14rem wide"}

#vue

```vue
<!-- Stray attributes land on the <dialog>, so an inline custom property reaches it. -->
<OriDrawer title="Details" style="--ori-drawer-size: 32rem">…</OriDrawer>

<OriDrawer title="Details" class="details-drawer">…</OriDrawer>
```

```css
.details-drawer {
    --ori-drawer-size: 14rem;
}
```

#html

```html
<dialog class="ori-drawer ori-drawer_end" style="--ori-drawer-size: 32rem" aria-label="Details">…</dialog>
```

::

## Non-modal

Set `modal` to `false` to leave the page live: nothing is dimmed, inert or scroll-locked, so the page behind
keeps scrolling and taking clicks. The drawer is opened as a `popover="manual"`, which still puts it in the top
layer (no clipping by a `transform` or `overflow` ancestor). A manual popover closes on nothing by itself, so
the component wires the dismissals: `Esc` closes it, and so does a press outside it. The trigger is excepted,
so pressing it again toggles the drawer instead of closing and reopening it. Focus moves in on open (the first
`[autofocus]` element, else the first focusable one) and, when the drawer closes with focus inside it, returns
to where it was.

::example
:drawer-demo{:modal="false"}

#vue

```vue
<OriDrawer :modal="false" side="start" title="Layers">
    <template #trigger="{ props }">
        <OriButton v-bind="props" label="Layers" variant="outline" />
    </template>
    <p>The canvas behind stays live while this is open.</p>
</OriDrawer>
```

#html

```html
<!-- popover="manual" keeps it in the top layer but closes on nothing by itself: Esc, a press outside
     and focus return are yours to wire (the component does it for you). -->
<button class="ori-button" onclick="document.getElementById('layers').togglePopover()">Layers</button>

<dialog id="layers" class="ori-drawer ori-drawer_start" popover="manual" aria-labelledby="layers-title">
    <div class="ori-drawer__content">
        <header class="ori-drawer__header">
            <h2 id="layers-title" class="ori-drawer__title">Layers</h2>
            <button class="ori-drawer__close" aria-label="Close" onclick="this.closest('dialog').hidePopover()">
                ×
            </button>
        </header>
        <div class="ori-drawer__body">
            <p>The canvas behind stays live while this is open.</p>
        </div>
    </div>
</dialog>
```

::

The two modes side by side:

|               | Modal (default)                                  | Non-modal (`:modal="false"`)                                      |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| Opened with   | `showModal()`                                    | `showPopover()` on `popover="manual"`                             |
| Top layer     | yes                                              | yes                                                               |
| Backdrop      | dimmed                                           | none                                                              |
| Page behind   | inert, scroll locked                             | live: focus, clicks and scroll all work                           |
| Focus         | trapped; moves in on open, returns to the opener | moves in on open; not trapped; returns on close if it was inside  |
| `Esc`         | closes (native)                                  | closes, unless a control inside (a menu, a combobox) took the key |
| Press outside | a click on the backdrop closes                   | a press outside closes, the trigger excepted                      |
| `aria-modal`  | `"true"`                                         | omitted                                                           |

`closeOnEscape` and `closeOnInteractOutside` turn the `Esc` and the outside dismissals off in either mode.
Where the browser has no Popover API, a non-modal drawer still opens (as a plain non-modal `<dialog>`), but in
the page instead of the top layer.

Open a non-modal drawer from the `#trigger` slot. An outside control that merely sets `open = true` receives
the press-outside first, closes the drawer, then reopens it with its click.

## Controlled open

Bind `v-model:open` to drive the drawer from your own state — a cart opened by a host action, with no `#trigger`
slot. It works exactly as in [OriDialog](/components/dialog#controlled-open): the drawer emits `update:open` on
every open and close (keeping `v-model` in sync when the user closes it with `Esc`, the backdrop or the ×) and
`close` for one-shot reactions. A user-initiated close always closes first and then emits, so mirror the event
into your state rather than trying to veto it. Pass `defaultOpen` for an uncontrolled drawer that starts open.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OriButton, OriDrawer } from '@oriui/vue'

const cartOpen = ref(false)

function checkout() {
    // …start checkout…
    cartOpen.value = false
}
</script>

<template>
    <OriButton label="Cart (3)" variant="outline" @click="cartOpen = true" />

    <OriDrawer v-model:open="cartOpen" title="Your cart">
        <p>Three items, ready to check out.</p>
        <template #footer>
            <OriButton label="Keep shopping" variant="text" @click="cartOpen = false" />
            <OriButton label="Check out" @click="checkout" />
        </template>
    </OriDrawer>
</template>
```

## Form with pinned actions

The `#footer` slot renders below the body, outside it, and only the body scrolls, so the header and the actions
stay put while a long form scrolls. A submit button in the footer reaches a form in the body through its `form`
attribute.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OriButton, OriDrawer, OriSwitch } from '@oriui/vue'

const open = ref(false)
const email = ref(true)
const push = ref(false)

function save() {
    // …persist the settings…
    open.value = false
}
</script>

<template>
    <OriDrawer v-model:open="open" title="Notifications">
        <template #trigger="{ props }">
            <OriButton v-bind="props" label="Notifications" variant="outline" />
        </template>

        <form id="notifications" @submit.prevent="save">
            <OriSwitch v-model="email" label="Email digest" />
            <OriSwitch v-model="push" label="Push alerts" />
        </form>

        <template #footer>
            <OriButton label="Cancel" variant="text" @click="open = false" />
            <OriButton type="submit" form="notifications" label="Save" />
        </template>
    </OriDrawer>
</template>
```

## Dialog on desktop, drawer on a phone

The same content reads better as a centered dialog on a wide screen and as a bottom drawer on a phone. The
components do not switch by themselves: your app chooses, from one `matchMedia` check, and shares the `open`
state between the two, so resizing the window with the panel open carries it across.

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { OriButton, OriDialog, OriDrawer } from '@oriui/vue'

const open = ref(false)

// Wide on the server and on first paint, so hydration matches; the real answer lands on mount.
const wide = ref(true)
let query: MediaQueryList | undefined
const sync = () => (wide.value = Boolean(query?.matches))

onMounted(() => {
    query = window.matchMedia('(min-width: 40rem)')
    sync()
    query.addEventListener('change', sync)
})
onBeforeUnmount(() => query?.removeEventListener('change', sync))
</script>

<template>
    <OriButton label="Edit profile" @click="open = true" />

    <OriDialog v-if="wide" v-model:open="open" title="Edit profile">
        <ProfileForm />
    </OriDialog>
    <OriDrawer v-else v-model:open="open" side="bottom" title="Edit profile">
        <ProfileForm />
    </OriDrawer>
</template>
```

## Motion and safe areas

A drawer slides in from its edge — a 0.25 s `translate` transition from a `@starting-style`, with `display` and
`overlay` transitioned too, so it stays in the top layer while it slides back out — and the backdrop fades.
Under `prefers-reduced-motion: reduce` nothing moves or fades: the drawer simply appears.

The content padding grows to clear `env(safe-area-inset-*)` on the edges a drawer touches: top and bottom for a
side drawer, top for a top drawer, bottom for a bottom drawer (the insets are non-zero only when the page opts in
with `viewport-fit=cover`). When the content is taller than the drawer, the body scrolls between the header and
the footer, and that scroll does not chain to the page.

## Accessibility

The accessibility contract holds across both layers — the classes and the Vue component render the same
attributes. The interactive behavior, however, must be driven by JavaScript: a static `<dialog>` is markup only
until `showModal()` or `showPopover()` opens it.

- A modal drawer is a WAI-ARIA **modal dialog**: `role="dialog"`, `aria-modal="true"`, and labeled by the title
  element through `aria-labelledby`. The body is its description (`aria-describedby`) when there is body
  content and you have not set your own.
- A non-modal drawer has the same role and labeling but **no `aria-modal`**: the page behind stays reachable and
  focus is not trapped.
- **Name it.** Pass `title` (or the `#title` slot), or give the drawer an `aria-label` / `aria-labelledby`. The
  title element is rendered only when there is a title, so a drawer named by `aria-label` has no empty heading.
  In development a drawer that opens without any name logs a warning.
- The close button has `aria-label="Close"`.
- The `#trigger` slot's `props` carry `aria-haspopup="dialog"` and `aria-expanded`; bind them with
  `v-bind="props"`.
- Focus moves into the drawer on open (the first `[autofocus]` element, else the first focusable one — the close
  button, unless you place something earlier). A modal drawer returns focus to the element that opened it; a
  non-modal one does the same when it closes with focus inside it.
- A modal drawer makes the rest of the page inert, so assistive technology reaches only the drawer.

| Key                 | Action                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Enter` / `Space`   | On the trigger: opens the drawer; on a non-modal drawer, pressing it again closes it.                             |
| `Escape`            | Closes the drawer and returns focus. Non-modal: not when a control inside it (an open menu) took the key first.   |
| `Tab` / `Shift+Tab` | Modal: cycles through the drawer's controls (the platform's focus trap). Non-modal: follows the page's DOM order. |

## Framework API

The props, events, slots and headless wiring of the **Vue** component. The standalone CSS layer has no
component API — its surface is the [classes](#classes) above, and the behavior is yours to wire.

### Props

| Prop                     | Type                                    | Default | Description                                                                                                |
| ------------------------ | --------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `closeOnEscape`          | `boolean`                               | `true`  | Whether `Esc` closes the drawer.                                                                           |
| `closeOnInteractOutside` | `boolean`                               | `true`  | Whether a click on the backdrop (modal) or a press outside (non-modal) closes the drawer.                  |
| `defaultOpen`            | `boolean`                               | `false` | Whether the drawer is open on first mount.                                                                 |
| `modal`                  | `boolean`                               | `true`  | Modal mode: `showModal()` (trap, inert page, scroll lock, backdrop) vs a manual popover (page stays live). |
| `open`                   | `boolean`                               | —       | Controlled open state for `v-model:open`. Omit for an uncontrolled drawer.                                 |
| `side`                   | `'start' \| 'end' \| 'top' \| 'bottom'` | `'end'` | The viewport edge the drawer docks to; `start` / `end` swap sides in RTL.                                  |
| `title`                  | `string`                                | —       | Heading text. Overridden by the `#title` slot when provided.                                               |

### Events & attributes

| Event         | Payload   | Description                                                                            |
| ------------- | --------- | -------------------------------------------------------------------------------------- |
| `update:open` | `boolean` | Fires on every open/close transition — enables `v-model:open`.                         |
| `close`       | —         | Fires whenever the drawer closes (trigger, `Esc`, backdrop, outside press, × or host). |

Both events fire in the uncontrolled (`defaultOpen` + `#trigger`) mode too, so a host can react to a close
without owning the state. Controlled mode is notify-only, as in [OriDialog](/components/dialog#controlled-open).

`OriDrawer` renders a fragment (the `#trigger` slot _plus_ the `<dialog>`), so stray attributes are forwarded to
the `<dialog>`, not to the trigger: `aria-label`, `class`, `style` (including a `--ori-drawer-size` custom
property), `data-*` and listeners all land there. Put attributes meant for the trigger on the trigger element
through the `#trigger` slot's `props`.

### Slots

| Slot      | Scope                              | Description                                                                                                                                                                         |
| --------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger` | `{ props: object, open: boolean }` | The control that toggles the drawer. Bind `props` on your trigger element: `aria-haspopup`, `aria-expanded`, and a click handler that opens a closed drawer and closes an open one. |
| `title`   | —                                  | Replaces the heading text; receives no scope. Falls back to the `title` prop when omitted.                                                                                          |
| `default` | —                                  | Body content rendered inside `.ori-drawer__body`.                                                                                                                                   |
| `footer`  | —                                  | Actions rendered inside `.ori-drawer__footer`, below the body. The footer is omitted when the slot is not provided.                                                                 |

### Headless & adapter

`OriDrawer` calls [`useDialog()`](/headless/use-dialog) from `@oriui/headless/vue`, the same engine as
`OriDialog`, which defaults to the native `<dialog>` adapter: the focus trap, `Esc`, `::backdrop` and focus
return are the platform's job, so **no adapter and no extra dependency are required**. The engine owns only the
open state and the ARIA prop bags; the component shows and hides the element itself (`showModal()` or
`showPopover()`). A custom engine registered for `dialog` with the `OriHeadless` plugin applies to both
components — the markup never changes.

See [useDialog](/headless/use-dialog) for the full control contract.
