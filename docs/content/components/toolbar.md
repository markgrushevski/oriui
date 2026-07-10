---
title: Toolbar
---

# Toolbar

A WAI-ARIA toolbar: a set of related controls that share a **single Tab stop**, navigated internally
with the arrow keys via **roving tabindex** (real DOM focus, not `aria-activedescendant`). Five
components make it up — `OriToolbar` (the root, `role="toolbar"`), `OriToolbarButton` (an item —
composes `OriButton`), `OriToolbarSeparator` (a perpendicular divider), and a paired
`OriToolbarToggleGroup` / `OriToolbarToggleItem` for a segmented single- or multi-select toggle.
Unlike the data-driven `OriMenu` (an `items` array plus a machine), a toolbar is **compositional** —
you assemble it from slotted components in whatever order and combination you need — so the behaviour
underneath, [`useToolbar`](#headless-usetoolbar) from `@oriui/headless`, is a provide/inject
roving-focus context rather than a state machine over an array.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default. Because the roving-tabindex focus movement is real
JavaScript (there is no CSS-only affordance for it), the **HTML** tab in every example below is
**structure only** — a snapshot of the markup `OriToolbar` renders — while the **Vue** tab is the live,
fully interactive version.

## Classes

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-toolbar","type":"Block","description":"Required base class (OriToolbar). Unstyled flex grouping container - row layout, gap - with no variant or color axis of its own; all visual weight lives on the buttons inside it."},{"class":"ori-toolbar_vertical","type":"Modifier","description":"Column layout instead of row; children stretch on the cross axis. Pair with the orientation prop (or aria-orientation=vertical by hand) for correct semantics."},{"class":"ori-toolbar__group","type":"Part","description":"OriToolbarToggleGroup - a tighter cluster of related toggle buttons; same flex and gap as the bar, column instead of row when the toolbar is vertical."},{"class":"ori-toolbar__separator","type":"Part","description":"OriToolbarSeparator - a hairline rule, perpendicular to the bar: a vertical line inside a horizontal toolbar, a horizontal line inside a vertical one."},{"class":"ori-button","type":"Part","description":"OriToolbarButton and OriToolbarToggleItem render the same ori-button classes documented on the Button page. Toolbar items default to ori-variant_text - a low-emphasis look - rather than the fill default OriButton itself uses standalone."},{"class":"data-ori-toolbar-item","type":"State","description":"Internal marker attribute the roving-focus script uses to find items in DOM order. OriToolbarButton and OriToolbarToggleItem carry it automatically - not meant to be set or styled by hand."},{"class":"role=toolbar / role=group / role=separator","type":"Semantics","description":"role=toolbar on the root, role=group on a toggle group, role=separator on the separator - always present, real attributes, not classes."},{"class":"tabindex / aria-pressed / aria-disabled","type":"State","description":"Real attributes, not classes. Exactly one item is tabindex=0 at a time (roving); aria-pressed on a toggle item reflects the toggle group selection; aria-disabled keeps an item focusable while blocking activation."}]'}

## Anatomy

`OriToolbar` is a **compositional** container — there is no fixed per-instance template the way
`OriDialog` has one. The tree below shows a representative composition; assemble the five pieces in
whatever order and combination your toolbar needs.

```
div.ori-toolbar                      [role=toolbar, aria-label|aria-labelledby, aria-orientation]   OriToolbar
  button.ori-button                  [data-ori-toolbar-item, tabindex]                              OriToolbarButton
  button.ori-button                  [data-ori-toolbar-item, tabindex, aria-pressed]                 OriToolbarButton (pressed)
  div.ori-toolbar__separator         [role=separator, aria-orientation]                              OriToolbarSeparator
  div.ori-toolbar__group             [role=group, aria-label]                                        OriToolbarToggleGroup
    button.ori-button                [data-ori-toolbar-item, tabindex, aria-pressed]  × N            OriToolbarToggleItem
```

Every item component requires an ancestor `OriToolbar` — used standalone, there is no roving context
to register with, so its `tabindex` stays `-1` forever (permanently unreachable by keyboard); the
orientation-only pieces (the separator, the toggle group) degrade gracefully to horizontal instead of
breaking. When `tooltip` is set, `OriToolbarButton` / `OriToolbarToggleItem` additionally wrap the
button in an `OriTooltip` (see the [Tooltip class reference](/components/tooltip#classes)); if a `label`
also names the button, the tooltip is wired as its `aria-describedby` description (otherwise the tooltip
text is the accessible name — see [Accessibility](#accessibility)).

## Basic

A toolbar is one keyboard stop, however many controls it holds. Tab into it once — focus lands on the
first item — then use the arrow keys to move between New, Open, Save, and Delete without Tab ever
leaving the bar; Tab again moves past the whole thing.

::example
::ori-toolbar{label="File"}
:ori-toolbar-button{text="New"}
:ori-toolbar-button{text="Open"}
:ori-toolbar-button{text="Save"}
:ori-toolbar-separator
:ori-toolbar-button{text="Delete" color="danger"}
::

#vue

```vue
<OriToolbar label="File">
    <OriToolbarButton text="New" />
    <OriToolbarButton text="Open" />
    <OriToolbarButton text="Save" />
    <OriToolbarSeparator />
    <OriToolbarButton text="Delete" color="danger" />
</OriToolbar>
```

#html

```html
<!-- Structure only — the roving-tabindex focus movement is JavaScript, not shown here. -->
<div class="ori-toolbar" role="toolbar" aria-label="File">
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="0">New</button>
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="-1">Open</button>
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="-1">Save</button>
    <div class="ori-toolbar__separator" role="separator" aria-orientation="vertical"></div>
    <button class="ori-button ori-variant_text ori-color_danger" data-ori-toolbar-item tabindex="-1">Delete</button>
</div>
```

::

## Orientation, loop & direction

Three props reshape the roving keyboard model without touching a single item component.
`orientation` switches the arrow axis (and the flex direction) between horizontal (Left/Right) and
vertical (Up/Down); `loop` decides whether navigation wraps at the ends; `dir` swaps which physical
arrow key means "next" in a horizontal bar.

::example
::ori-toolbar{label="View" orientation="vertical"}
:ori-toolbar-button{text="List"}
:ori-toolbar-button{text="Grid"}
:ori-toolbar-button{text="Table"}
::

#vue

```vue
<OriToolbar label="View" orientation="vertical">
    <OriToolbarButton text="List" />
    <OriToolbarButton text="Grid" />
    <OriToolbarButton text="Table" />
</OriToolbar>
```

#html

```html
<!-- Structure only. -->
<div class="ori-toolbar ori-toolbar_vertical" role="toolbar" aria-label="View" aria-orientation="vertical">
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="0">List</button>
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="-1">Grid</button>
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="-1">Table</button>
</div>
```

::

`loop` (default `true`) wraps arrow navigation from the last item back to the first, and vice versa —
matching the WAI-ARIA APG reference toolbar. Set it to `false` to stop at the ends instead.

::example
::ori-toolbar{label="Wraps by default"}
:ori-toolbar-button{text="1"}
:ori-toolbar-button{text="2"}
:ori-toolbar-button{text="3"}
::
::ori-toolbar{label="Stops at the ends" :loop="false"}
:ori-toolbar-button{text="1"}
:ori-toolbar-button{text="2"}
:ori-toolbar-button{text="3"}
::

#vue

```vue
<!-- default: loop is true — End then ArrowRight wraps back to item 1 -->
<OriToolbar label="Wraps by default">
    <OriToolbarButton text="1" />
    <OriToolbarButton text="2" />
    <OriToolbarButton text="3" />
</OriToolbar>

<!-- loop is false — ArrowRight stops at item 3 instead of wrapping -->
<OriToolbar label="Stops at the ends" :loop="false">
    <OriToolbarButton text="1" />
    <OriToolbarButton text="2" />
    <OriToolbarButton text="3" />
</OriToolbar>
```

#html

```html
<!-- Structure only — loop is a JavaScript-only behaviour flag; no class or attribute marks it. -->
<div class="ori-toolbar" role="toolbar" aria-label="Stops at the ends">…</div>
```

::

`dir="rtl"` swaps which physical arrow key means "next" in a horizontal bar (`ArrowLeft` becomes
next, `ArrowRight` becomes previous) — it is a purely JavaScript signal. Vue excludes a declared prop
from attrs fallthrough, so `dir` never becomes a native `dir` HTML attribute on the rendered element;
pair it with your own RTL layout (an ancestor `dir="rtl"`, or `direction: rtl` in your CSS) so the
keyboard direction matches what is visually left and right.

```vue
<!-- Visual mirroring is your own HTML/CSS dir — the component prop only swaps the JS key mapping. -->
<div dir="rtl">
    <OriToolbar label="RTL toolbar" dir="rtl">
        <OriToolbarButton text="One" />
        <OriToolbarButton text="Two" />
        <OriToolbarButton text="Three" />
    </OriToolbar>
</div>
```

## Separator

`OriToolbarSeparator` is `role="separator"`, non-focusable, and always perpendicular to the bar it
sits in — a vertical rule inside a horizontal toolbar, a horizontal rule inside a vertical one. It
never claims a roving stop (no `data-ori-toolbar-item`), so arrow navigation skips straight over it.

::example
::ori-toolbar{label="Horizontal, with a separator"}
:ori-toolbar-button{text="A"}
:ori-toolbar-button{text="B"}
:ori-toolbar-separator
:ori-toolbar-button{text="C"}
:ori-toolbar-button{text="D"}
::
::ori-toolbar{label="Vertical, with a separator" orientation="vertical"}
:ori-toolbar-button{text="A"}
:ori-toolbar-button{text="B"}
:ori-toolbar-separator
:ori-toolbar-button{text="C"}
:ori-toolbar-button{text="D"}
::

#vue

```vue
<OriToolbar label="Horizontal, with a separator">
    <OriToolbarButton text="A" />
    <OriToolbarButton text="B" />
    <OriToolbarSeparator />
    <OriToolbarButton text="C" />
    <OriToolbarButton text="D" />
</OriToolbar>

<OriToolbar label="Vertical, with a separator" orientation="vertical">
    <OriToolbarButton text="A" />
    <OriToolbarButton text="B" />
    <OriToolbarSeparator />
    <OriToolbarButton text="C" />
    <OriToolbarButton text="D" />
</OriToolbar>
```

#html

```html
<!-- Structure only. The separator orientation is always the opposite of the toolbar orientation. -->
<div class="ori-toolbar" role="toolbar" aria-label="Horizontal, with a separator">
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="0">A</button>
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="-1">B</button>
    <div class="ori-toolbar__separator" role="separator" aria-orientation="vertical"></div>
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="-1">C</button>
    <button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="-1">D</button>
</div>
```

::

## Toggle buttons (pressed)

`OriToolbarButton` takes a plain `pressed` boolean for a standalone toggle — for controls like Bold
and Italic that are not mutually exclusive, and so do not belong in a group. `aria-pressed` is
omitted entirely when `pressed` is not passed at all, so a genuinely plain action button never gets
it; pass `true` or `false` explicitly to make an item a toggle.

::example
::ori-toolbar{label="Text style"}
:ori-toolbar-button{icon="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" label="Bold" :pressed="true"}
:ori-toolbar-button{icon="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" label="Italic" :pressed="false"}
:ori-toolbar-separator
:ori-toolbar-button{text="Clear formatting"}
::

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue';

const bold = ref(true);
const italic = ref(false);
</script>

<template>
    <OriToolbar label="Text style">
        <!-- `pressed` is a plain prop — wire your own ref + @click to make it interactive -->
        <OriToolbarButton :icon="boldIcon" label="Bold" :pressed="bold" @click="bold = !bold" />
        <OriToolbarButton :icon="italicIcon" label="Italic" :pressed="italic" @click="italic = !italic" />
        <OriToolbarSeparator />
        <!-- no `pressed` prop at all — a plain action button, aria-pressed is never rendered -->
        <OriToolbarButton text="Clear formatting" @click="clearFormatting" />
    </OriToolbar>
</template>
```

#html

```html
<!-- Structure only. -->
<button
    class="ori-button ori-button_icon ori-variant_text"
    data-ori-toolbar-item
    tabindex="0"
    aria-pressed="true"
    aria-label="Bold"
>
    …
</button>
<button
    class="ori-button ori-button_icon ori-variant_text"
    data-ori-toolbar-item
    tabindex="-1"
    aria-pressed="false"
    aria-label="Italic"
>
    …
</button>
<div class="ori-toolbar__separator" role="separator" aria-orientation="vertical"></div>
<!-- a plain action button — no aria-pressed attribute at all -->
<button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="-1">Clear formatting</button>
```

::

## Disabled item

A disabled button or toggle item is `aria-disabled`, not the native `disabled` attribute — the
WAI-ARIA toolbar pattern keeps disabled controls focusable and reachable by roving navigation, and
only blocks activation. Tab to it, or arrow onto it, and it is still the roving stop; clicking it, or
pressing `Enter` / `Space` on it, does nothing.

::example
::ori-toolbar{label="Edit"}
:ori-toolbar-button{text="Cut"}
:ori-toolbar-button{text="Copy"}
:ori-toolbar-button{text="Paste" :disabled="true"}
::

#vue

```vue
<OriToolbar label="Edit">
    <OriToolbarButton text="Cut" />
    <OriToolbarButton text="Copy" />
    <OriToolbarButton text="Paste" :disabled="true" />
</OriToolbar>
```

#html

```html
<!-- Structure only — the click/Enter/Space block is JavaScript; CSS pointer-events alone only stops the mouse. -->
<button class="ori-button ori-variant_text" data-ori-toolbar-item tabindex="-1" aria-disabled="true">Paste</button>
```

::

## Tooltip-wired buttons

Pass `tooltip` and `OriToolbarButton` (or `OriToolbarToggleItem`) wraps itself in an `OriTooltip`. When
the button also carries a `label`, the tooltip is wired as its **description** (`aria-describedby` on the
real button) — the manual step the standalone [Tooltip](/components/tooltip#accessibility) component
normally asks of a consumer, done for you. When there is **no** `label`, the tooltip text becomes the
button's accessible **name** instead, and `aria-describedby` is omitted so a screen reader doesn't
announce the same text twice.

::example
::ori-toolbar{label="Actions"}
:ori-toolbar-button{icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" tooltip="Add item"}
:ori-toolbar-button{icon="M12 8a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4z" tooltip="More options"}
::

#vue

```vue
<OriToolbar label="Actions">
    <!-- no `label` — the accessible name falls back to the tooltip text -->
    <OriToolbarButton icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" tooltip="Add item" />
    <OriToolbarButton
        icon="M12 8a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4z"
        tooltip="More options"
    />
</OriToolbar>
```

#html

```html
<!-- Structure only. -->
<span class="ori-tooltip">
    <!-- OriTooltip's own wrapper always carries aria-describedby, but it is not focusable — inert alone -->
    <span class="ori-tooltip__trigger" aria-describedby="tip-1">
        <!-- OriToolbarButton additionally wires the SAME id onto the real, focusable button — this is what announces -->
        <button
            class="ori-button ori-button_icon ori-variant_text"
            data-ori-toolbar-item
            tabindex="0"
            aria-label="Add item"
            aria-describedby="tip-1"
        >
            …
        </button>
    </span>
    <span id="tip-1" class="ori-tooltip__bubble ori-anchored ori-anchored_top" role="tooltip">Add item</span>
</span>
```

::

## Single-select toggle group

`type="single"` keeps at most one value selected, and is deselectable — clicking the pressed item
again clears it, like a Radix-style single toggle group. A natural fit for paragraph alignment, where
"none" can also be a valid state — try it below: click Align left again and every item reports
`aria-pressed="false"`. Items stay part of the same flat roving order as everything else in the bar —
the group itself does not add a stop.

::example
::ori-toolbar{label="Paragraph"}
::ori-toolbar-toggle-group{type="single" label="Text alignment"}
:ori-toolbar-toggle-item{value="left" icon="M4 6h16v2H4z M4 11h10v2H4z M4 16h13v2H4z" tooltip="Align left"}
:ori-toolbar-toggle-item{value="center" icon="M4 6h16v2H4z M7 11h10v2H7z M5.5 16h13v2H5.5z" tooltip="Align center"}
:ori-toolbar-toggle-item{value="right" icon="M4 6h16v2H4z M10 11h10v2H10z M7 16h13v2H7z" tooltip="Align right"}
::
::

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue';

const align = ref('left');
</script>

<template>
    <OriToolbar label="Paragraph">
        <OriToolbarToggleGroup v-model="align" type="single" label="Text alignment">
            <OriToolbarToggleItem value="left" :icon="alignLeftIcon" tooltip="Align left" />
            <OriToolbarToggleItem value="center" :icon="alignCenterIcon" tooltip="Align center" />
            <OriToolbarToggleItem value="right" :icon="alignRightIcon" tooltip="Align right" />
        </OriToolbarToggleGroup>
    </OriToolbar>
</template>
```

#html

```html
<!-- Structure only. -->
<div class="ori-toolbar" role="toolbar" aria-label="Paragraph">
    <div class="ori-toolbar__group" role="group" aria-label="Text alignment">
        <button
            class="ori-button ori-button_icon ori-variant_text"
            data-ori-toolbar-item
            tabindex="0"
            aria-pressed="true"
            aria-label="Align left"
        >
            …
        </button>
        <button
            class="ori-button ori-button_icon ori-variant_text"
            data-ori-toolbar-item
            tabindex="-1"
            aria-pressed="false"
            aria-label="Align center"
        >
            …
        </button>
        <button
            class="ori-button ori-button_icon ori-variant_text"
            data-ori-toolbar-item
            tabindex="-1"
            aria-pressed="false"
            aria-label="Align right"
        >
            …
        </button>
    </div>
</div>
```

::

## Multi-select toggle group

`type="multiple"` keeps a set instead of a single value — any number of items can be pressed at
once. Bold, italic, and underline are the canonical case: independent, freely combinable styles.

::example
::ori-toolbar{label="Character"}
::ori-toolbar-toggle-group{type="multiple" label="Text style"}
:ori-toolbar-toggle-item{value="bold" icon="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" tooltip="Bold"}
:ori-toolbar-toggle-item{value="italic" icon="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" tooltip="Italic"}
:ori-toolbar-toggle-item{value="underline" icon="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" tooltip="Underline"}
::
::

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue';

const styles = ref<string[]>([]);
</script>

<template>
    <OriToolbar label="Character">
        <OriToolbarToggleGroup v-model="styles" type="multiple" label="Text style">
            <OriToolbarToggleItem value="bold" :icon="boldIcon" tooltip="Bold" />
            <OriToolbarToggleItem value="italic" :icon="italicIcon" tooltip="Italic" />
            <OriToolbarToggleItem value="underline" :icon="underlineIcon" tooltip="Underline" />
        </OriToolbarToggleGroup>
    </OriToolbar>
    <!-- styles is e.g. ['bold', 'underline'] -->
</template>
```

#html

```html
<!-- Structure only. -->
<div class="ori-toolbar__group" role="group" aria-label="Text style">
    <button
        class="ori-button ori-button_icon ori-variant_text"
        data-ori-toolbar-item
        tabindex="0"
        aria-pressed="false"
        aria-label="Bold"
    >
        …
    </button>
    <!-- repeat for Italic, Underline -->
</div>
```

::

## Color & size passthrough

`color`, `variant`, `size`, and `radius` are not toolbar concerns — `OriToolbarButton` and
`OriToolbarToggleItem` forward them straight to the underlying `OriButton` (see the
[Button](/components/button) page for the full axis reference).

::example
::ori-toolbar{label="Quick actions"}
:ori-toolbar-button{text="Export" variant="outline" size="sm"}
:ori-toolbar-button{text="Delete" variant="tonal" color="danger"}
::

#vue

```vue
<OriToolbar label="Quick actions">
    <OriToolbarButton text="Export" variant="outline" size="sm" />
    <OriToolbarButton text="Delete" variant="tonal" color="danger" />
</OriToolbar>
```

#html

```html
<!-- Structure only. -->
<button class="ori-button ori-variant_outline ori-button_sm" data-ori-toolbar-item tabindex="0">Export</button>
<button class="ori-button ori-variant_tonal ori-color_danger" data-ori-toolbar-item tabindex="-1">Delete</button>
```

::

## Common patterns

A formatting toolbar: two independent `pressed` toggles for Bold and Italic (not mutually exclusive,
so a plain `OriToolbarButton` and your own ref is the right tool, not a group), a separator, and a
single-select `OriToolbarToggleGroup` for paragraph alignment — every piece on this page composed
into one bar with a single Tab stop.

::example
:toolbar-demo

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue';

const bold = ref(false);
const italic = ref(false);
const align = ref('left');
</script>

<template>
    <OriToolbar label="Formatting">
        <OriToolbarButton
            :pressed="bold"
            tooltip="Bold"
            icon="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"
            @click="bold = !bold"
        />
        <OriToolbarButton
            :pressed="italic"
            tooltip="Italic"
            icon="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"
            @click="italic = !italic"
        />

        <OriToolbarSeparator />

        <OriToolbarToggleGroup v-model="align" type="single" label="Text alignment">
            <OriToolbarToggleItem value="left" tooltip="Align left" icon="M4 6h16v2H4z M4 11h10v2H4z M4 16h13v2H4z" />
            <OriToolbarToggleItem
                value="center"
                tooltip="Align center"
                icon="M4 6h16v2H4z M7 11h10v2H7z M5.5 16h13v2H5.5z"
            />
            <OriToolbarToggleItem
                value="right"
                tooltip="Align right"
                icon="M4 6h16v2H4z M10 11h10v2H10z M7 16h13v2H7z"
            />
        </OriToolbarToggleGroup>
    </OriToolbar>
</template>
```

#html

```html
<!-- Structure only — the interactive Bold/Italic state and the alignment selection are JavaScript. -->
<div class="ori-toolbar" role="toolbar" aria-label="Formatting">
    <button class="ori-button ori-button_icon ori-variant_text" aria-pressed="false" aria-label="Bold">…</button>
    <button class="ori-button ori-button_icon ori-variant_text" aria-pressed="false" aria-label="Italic">…</button>
    <div class="ori-toolbar__separator" role="separator" aria-orientation="vertical"></div>
    <div class="ori-toolbar__group" role="group" aria-label="Text alignment">
        <button class="ori-button ori-button_icon ori-variant_text" aria-pressed="true" aria-label="Align left">
            …
        </button>
        <button class="ori-button ori-button_icon ori-variant_text" aria-pressed="false" aria-label="Align center">
            …
        </button>
        <button class="ori-button ori-button_icon ori-variant_text" aria-pressed="false" aria-label="Align right">
            …
        </button>
    </div>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue components
render the same attributes and keyboard behaviour, though the roving-tabindex focus movement itself
is JavaScript (there is no CSS-only affordance for it).

- `role="toolbar"` needs a **required** accessible name — `label` (→ `aria-label`) or your own
  `aria-labelledby` attribute (falls through). A nameless toolbar fails axe / WCAG 4.1.2; in
  development, omitting both logs a console warning.
- `aria-orientation` reflects `orientation`, omitted for the implicit horizontal default and set
  only for `vertical` — the same convention as the separator below.
- Roving tabindex: exactly one item is `tabindex="0"` at a time (the last-focused one, defaulting to
  the first registered item); every other item is `tabindex="-1"`. Real DOM focus moves as you
  navigate — there is no `aria-activedescendant`. Navigation is resolved by DOM order
  (`querySelectorAll('[data-ori-toolbar-item]')`), so it stays correct even when items are
  conditionally rendered or reordered.
- Every item component (`OriToolbarButton` / `OriToolbarSeparator` / `OriToolbarToggleGroup` /
  `OriToolbarToggleItem`) requires an ancestor `OriToolbar` — used standalone, there is no roving
  context to register with, so the item's `tabindex` stays `-1` forever (unreachable by keyboard).
  The orientation-only pieces degrade gracefully to horizontal instead of breaking.
- `disabled` on a button or toggle item is `aria-disabled`, **not** the native `disabled` attribute —
  the WAI-ARIA toolbar pattern keeps disabled controls **focusable**, so they stay discoverable by
  roving navigation; only activation (click, `Enter`, `Space`) is blocked. This differs from
  `OriButton`'s own `disabled`, which removes a control from the tab order entirely.
- `pressed` → `aria-pressed` on `OriToolbarButton` is entirely omitted when the prop is not passed —
  a plain action button has no `aria-pressed` at all. `OriToolbarToggleItem`'s `aria-pressed` is
  always rendered (`true` / `false`), derived from the enclosing `OriToolbarToggleGroup`'s selection.
- `tooltip` on `OriToolbarButton` / `OriToolbarToggleItem` renders an `OriTooltip`. The accessible name
  is `label ?? tooltip` — a `label` wins when present, else the tooltip text names the button. When a
  `label` IS present, the tooltip is additionally wired as a supplementary **description**
  (`aria-describedby` on the real `<button>`, done for you — the manual step the standalone Tooltip asks
  of a consumer); when the tooltip is serving as the **name** (no label), `aria-describedby` is omitted so
  name and description aren't the same text (no double-announce). Either way an icon-only item ends up
  named — and in dev, a nameless one (icon, no `label` / `tooltip` / `text`) logs a console warning.
- `OriToolbarSeparator` is `role="separator"`, always perpendicular to the bar, non-focusable, and
  skipped by roving navigation (no `data-ori-toolbar-item` marker).
- `OriToolbarToggleGroup` is `role="group"` with its own `aria-label` — a second, independent
  accessible name from the toolbar's own. It adds no roving stop of its own; its
  `OriToolbarToggleItem` children are ordinary toolbar items, reached by the same flat arrow
  navigation as everything else in the bar.
- A composite child that owns its own arrow keys — a text field, a native range/spin control, or a
  `role=radiogroup` / `menu` / `listbox` / `combobox` / `textbox` widget placed inside the bar — is
  never hijacked; the toolbar's keydown handler yields to it entirely.

| Key                                        | Action                                                                                                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tab`                                      | Moves focus into the toolbar (landing on the roving-active item) or past it — the whole toolbar is a single stop.                                                                              |
| `Shift+Tab`                                | Moves focus out of the toolbar, backwards, as a single stop.                                                                                                                                   |
| `ArrowRight` / `ArrowLeft`                 | Horizontal toolbars: moves the roving stop to the next / previous item (wraps first⇄last when `loop`, the default). Swapped under `dir="rtl"`.                                                 |
| `ArrowDown` / `ArrowUp`                    | Vertical toolbars: moves the roving stop to the next / previous item (wraps when `loop`).                                                                                                      |
| `Home` / `End`                             | Moves the roving stop to the first / last item, in either orientation.                                                                                                                         |
| `Enter` / `Space`                          | Activates the focused button (native); toggles a toggle item's selection; no-ops on an `aria-disabled` item.                                                                                   |
| Arrow keys, focus inside a composite child | Not intercepted — an `input`, `textarea`, `select`, `[contenteditable]`, or an element with role slider/spinbutton/radiogroup/menu/listbox/combobox/textbox keeps its own arrow-key behaviour. |

## Framework API

The props, events, and slots of the **Vue** components — five of them, composed together. The
standalone CSS layer has no component API — its surface is the [classes](#classes) above, and the
roving-tabindex keyboard behaviour is JavaScript you would need to author yourself, or get from
[`useToolbar`](#headless-usetoolbar) in `@oriui/headless/vue`. (Svelte bindings are planned.)

### OriToolbar

**Props**

| Prop          | Type                         | Default        | Description                                                                                                                                                                                      |
| ------------- | ---------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dir`         | `'ltr' \| 'rtl'`             | `'ltr'`        | Text direction for the horizontal arrow mapping — `rtl` swaps `ArrowLeft`/`ArrowRight`. A purely JavaScript signal; pair it with your own RTL layout (see [above](#orientation-loop-direction)). |
| `label`       | `string`                     | —              | Accessible name → `aria-label`. **Required**, unless you supply your own `aria-labelledby` attribute instead (it falls through onto the root element) — a nameless `role="toolbar"` fails axe.   |
| `loop`        | `boolean`                    | `true`         | Whether arrow navigation wraps first⇄last at the ends.                                                                                                                                           |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout and arrow-key axis. `horizontal` = row, Left/Right; `vertical` = column, Up/Down.                                                                                                         |

**Events & attributes**

`OriToolbar` declares no custom emits. It does not set `inheritAttrs: false`, so extra attributes —
most notably `aria-labelledby`, but also `class`, `id`, `data-*` — fall through to the root
`div.ori-toolbar` alongside its own `role` / `aria-label` / `aria-orientation`. In development, a
toolbar with neither `label` nor an `aria-label` / `aria-labelledby` attribute logs a console
warning.

**Slots**

| Slot      | Scope | Description                                                                                              |
| --------- | ----- | -------------------------------------------------------------------------------------------------------- |
| `default` | —     | The toolbar's items — any mix of `OriToolbarButton`, `OriToolbarSeparator`, and `OriToolbarToggleGroup`. |

### OriToolbarButton

**Props**

| Prop       | Type         | Default  | Description                                                                                                                                                                                                            |
| ---------- | ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`    | `ThemeColor` | —        | Semantic color, forwarded to the underlying `OriButton`. Unset falls back to `OriButton`'s own default (`primary`).                                                                                                    |
| `disabled` | `boolean`    | `false`  | `aria-disabled`, **not** the native `disabled` attribute — the item stays focusable and reachable by roving navigation; only activation (click, `Enter`, `Space`) is blocked.                                          |
| `icon`     | `string`     | —        | SVG path, forwarded to `OriButton`. `icon` with no `text` renders an icon-only square.                                                                                                                                 |
| `label`    | `string`     | —        | Accessible name for an icon-only button (→ `aria-label`); falls back to `tooltip` when omitted.                                                                                                                        |
| `pressed`  | `boolean`    | —        | Toggle state → `aria-pressed`. Omit entirely for a plain action button (no `aria-pressed` rendered); pass `true` / `false` for a standalone toggle (e.g. Bold, Italic) that is not part of an `OriToolbarToggleGroup`. |
| `radius`   | `RadiusSize` | —        | Corner radius, forwarded. Unset falls back to `OriButton`'s own default (`rounded`).                                                                                                                                   |
| `size`     | `ActionSize` | —        | Height and text scale, forwarded. Unset falls back to `OriButton`'s own default (`md`).                                                                                                                                |
| `text`     | `string`     | —        | Visible label, forwarded to `OriButton`.                                                                                                                                                                               |
| `tooltip`  | `string`     | —        | Wraps the button in an `OriTooltip`; wires `aria-describedby` onto the real `<button>` when a `label` also names it, otherwise the tooltip text becomes the accessible name.                                           |
| `variant`  | `Variant`    | `'text'` | Visual style, forwarded. Toolbar items default to the low-emphasis `text` look rather than `OriButton`'s own `fill` default.                                                                                           |

**Events & attributes**

`OriToolbarButton` sets `inheritAttrs: false` and manually re-merges `$attrs` alongside its own
computed bindings onto the real `OriButton` (and, in turn, the `<button>`), so a native listener like
`@click` reaches the real element and fires normally. It declares no custom emits of its own.

**Slots**

None — unlike the base `OriButton`, content is driven entirely by the `icon` / `text` props; there is
no default slot.

### OriToolbarSeparator

**Props**

None. Orientation is not a prop — it is read from the enclosing `OriToolbar` via
`useToolbarOrientation()`, so the separator is automatically perpendicular to the bar with no wiring
required.

**Events & attributes**

No custom emits. Does not set `inheritAttrs: false`, so extra attributes fall through to the root
`div.ori-toolbar__separator`.

**Slots**

None.

### OriToolbarToggleGroup

**Props**

| Prop    | Type                     | Default    | Description                                                                                                                                                       |
| ------- | ------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label` | `string`                 | —          | Accessible name for the group (→ `aria-label`) — a `role="group"` needs one.                                                                                      |
| `type`  | `'single' \| 'multiple'` | `'single'` | `single` keeps at most one value, and is deselectable (clicking the pressed item clears it). `multiple` keeps a set — any number of items can be pressed at once. |

**v-model**

`v-model` binds the selection via `defineModel<string \| string[]>()` — a `string` (or `undefined`)
for `type="single"`, a `string[]` for `type="multiple"`. Selecting an item emits
`update:modelValue`. Used standalone with no `v-model` bound at all, as in the bare examples on this
page, `defineModel` falls back to a local ref, so the group still manages its own selection.

**Events & attributes**

No manually-declared emits beyond the `v-model`-generated `update:modelValue`. Does not set
`inheritAttrs: false`, so extra attributes fall through to the root `div.ori-toolbar__group`
alongside its own `role` / `aria-label`. (`role="group"` takes no `aria-orientation` — it isn't in that
role's ARIA contract; the group is a named cluster over the toolbar's flat roving order.)

**Slots**

| Slot      | Scope | Description                                  |
| --------- | ----- | -------------------------------------------- |
| `default` | —     | The group's `OriToolbarToggleItem` children. |

### OriToolbarToggleItem

**Props**

| Prop       | Type         | Default      | Description                                                                      |
| ---------- | ------------ | ------------ | -------------------------------------------------------------------------------- |
| `color`    | `ThemeColor` | —            | Same forwarding as `OriToolbarButton`.                                           |
| `disabled` | `boolean`    | `false`      | Same `aria-disabled`, still-focusable semantics as `OriToolbarButton`.           |
| `icon`     | `string`     | —            | SVG path, forwarded to `OriButton`.                                              |
| `label`    | `string`     | —            | Accessible name for an icon-only item (→ `aria-label`); falls back to `tooltip`. |
| `radius`   | `RadiusSize` | —            | Forwarded; falls back to `OriButton`'s own default (`rounded`).                  |
| `size`     | `ActionSize` | —            | Forwarded; falls back to `OriButton`'s own default (`md`).                       |
| `text`     | `string`     | —            | Visible label, forwarded.                                                        |
| `tooltip`  | `string`     | —            | Same baked `aria-describedby` wiring as `OriToolbarButton`.                      |
| `value`    | `string`     | **required** | The value this item contributes to the enclosing group's `v-model`.              |
| `variant`  | `Variant`    | `'text'`     | Forwarded; same `text` default as `OriToolbarButton`.                            |

There is no `pressed` prop — unlike `OriToolbarButton`, press state is always derived from the
enclosing `OriToolbarToggleGroup`'s selection, so `aria-pressed` is always rendered (`true` / `false`),
never omitted.

**Events & attributes**

`OriToolbarToggleItem` sets `inheritAttrs: false`; its bindings are merged with your `$attrs` via Vue's
`mergeProps`.

> A caller's `@click` / `@focus` **compose** with the item's internal handlers — the toggle (which flips
> the value in the group) and the roving-active tracker — because they're combined with `mergeProps`, so
> both run. Prefer reacting to a selection change through the group's `v-model` / `update:modelValue`; an
> extra `@click` is additive, not a replacement, and `disabled` still blocks activation (a separate
> capture-phase guard).

**Slots**

None.

## Headless (`useToolbar`)

`OriToolbar` and its four companions are a thin styled shell around `useToolbar` (and
`useToolbarItem` / `useToolbarOrientation` / `useToolbarToggleGroup` / `useToolbarToggleItem`) from
`@oriui/headless/vue` — the same roving-tabindex engine, so you can build a fully custom-styled
toolbar UI on the same keyboard contract. Unlike `useDialog` / `useCombobox` / `useMenu`, `useToolbar`
does not go through the swappable `OriHeadless` adapter contract — a toolbar's behaviour is DOM order
plus Vue `provide` / `inject` composition, not a state machine, so there is nothing to swap.

```vue
<script setup lang="ts">
import { useToolbar, useToolbarItem } from '@oriui/headless/vue';

// The same engine OriToolbar / OriToolbarButton are built on — useToolbarItem() registers the
// calling component with the roving context and returns its tabindex plus the DOM marker the root's
// keydown handler navigates by.
const { toolbarRef, toolbarProps } = useToolbar({ label: () => 'Custom toolbar' });
</script>

<template>
    <div ref="toolbarRef" v-bind="toolbarProps">
        <MyToolbarButton text="Cut" />
        <MyToolbarButton text="Copy" />
        <MyToolbarButton text="Paste" />
    </div>
</template>
```

```vue
<!-- MyToolbarButton.vue -->
<script setup lang="ts">
import { useToolbarItem } from '@oriui/headless/vue';

defineProps<{ text: string }>();
const { itemProps } = useToolbarItem();
</script>

<template>
    <button v-bind="itemProps">{{ text }}</button>
</template>
```

`useToolbarItem` is inert outside a `useToolbar` root (see [Anatomy](#anatomy)) — `itemProps.tabindex`
stays `-1` forever with no context to register with. `useToolbarOrientation()` reads the enclosing
orientation for a custom separator or group (defaults to `horizontal` outside a toolbar).
`useToolbarToggleGroup` / `useToolbarToggleItem` layer selection state on top of the same roving
context — see the [OriToolbarToggleGroup](#oritoolbartogglegroup) /
[OriToolbarToggleItem](#oritoolbartoggleitem) sections above for the exact shape, or read the
component source directly (`packages/vue/src/components/toolbar/`).

The pure index/key math — `rovingIntent(key, orientation, dir)` and
`resolveRovingIndex(intent, from, count, loop)` — lives in the framework-agnostic core
(`@oriui/headless`, no framework import) and is reusable for any roving-tabindex widget; it is the
same helper a future Svelte adapter would share.
