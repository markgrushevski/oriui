---
title: Dialog
---

# Dialog

A modal dialog — the library's first genuinely **interactive** headless component. The styled
`OriDialog` provides markup and tokens; focus trap, scroll lock, `Esc`-to-close, click-outside
dismissal, and the full WAI-ARIA keyboard contract come from whichever dialog adapter the app wires
via `OriHeadless`.

Every example is live; flip its source between **Vue** (the styled component) and **HTML** (the
standalone `oriui/css` classes — the same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

A dialog is a set of part classes — there is no single block class that drives variant tokens. Each
part class maps to a structural element produced by the component.

:class-table{:rows='[{"class":"ori-dialog__backdrop","type":"Part","description":"Fixed overlay behind the content panel."},{"class":"ori-dialog__positioner","type":"Layout","description":"Flex centring wrapper; holds the content panel inside the viewport."},{"class":"ori-dialog__content","type":"Block","description":"The visible panel: max-width 460 px, rounded, surface-coloured."},{"class":"ori-dialog__header","type":"Part","description":"Flex row — title on the left, close button on the right."},{"class":"ori-dialog__title","type":"Part","description":"<code>h2</code> heading; its <code>id</code> is wired to <code>aria-labelledby</code> by the adapter."},{"class":"ori-dialog__close","type":"Part","description":"Bare close button (<code>aria-label=Close</code>); styled via opacity."},{"class":"ori-dialog__body","type":"Part","description":"Body copy region below the header."}]'}

## Examples

### Basic

Open the dialog, tab through its controls, press `Esc`, and observe that focus returns to the
trigger. Page scroll is locked while it is open.

::example
:dialog-demo

#vue

```vue
<OriDialog title="Hello, oriUI">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Open dialog" />
    </template>
    <p>This modal traps focus, closes on Escape, and locks page scroll.</p>
</OriDialog>
```

#html

```html
<!-- Backdrop -->
<div class="ori-dialog__backdrop"></div>
<!-- Positioner -->
<div class="ori-dialog__positioner">
    <div role="dialog" aria-modal="true" aria-labelledby="dlg-title" class="ori-dialog__content">
        <header class="ori-dialog__header">
            <h2 id="dlg-title" class="ori-dialog__title">Hello, oriUI</h2>
            <button class="ori-dialog__close" aria-label="Close">×</button>
        </header>
        <div class="ori-dialog__body">
            <p>This modal traps focus, closes on Escape, and locks page scroll.</p>
        </div>
    </div>
</div>
```

::

### Non-modal

Set `modal` to `false` for a non-modal dialog (no scroll lock, no click-outside dismiss). The
adapter is still responsible for `aria-modal="false"` and any positioning.

::example
:dialog-demo

#vue

```vue
<OriDialog title="Non-modal hint" :modal="false">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Open non-modal" variant="outline" />
    </template>
    <p>Page is still scrollable and click-outside does not close this dialog.</p>
</OriDialog>
```

#html

```html
<div role="dialog" aria-modal="false" aria-labelledby="dlg-title" class="ori-dialog__content">
    <!-- header + body -->
</div>
```

::

### Initially open

Pass `defaultOpen` to render the dialog open on first mount — useful for confirmation prompts that
appear on page load.

::example
:dialog-demo

#vue

```vue
<OriDialog title="Welcome back" :defaultOpen="true">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Re-open" variant="tonal" />
    </template>
    <p>This dialog was open on first render.</p>
</OriDialog>
```

#html

```html
<!-- Same HTML structure; the adapter opens the dialog on mount via its own state. -->
<div role="dialog" aria-modal="true" aria-labelledby="dlg-title" class="ori-dialog__content">
    <!-- header + body -->
</div>
```

::

### Custom title via slot

Omit the `title` prop and supply markup in the `#title` slot when you need rich heading content.

::example
:dialog-demo

#vue

```vue
<OriDialog>
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Rich title" variant="tonal" color="info" />
    </template>
    <template #title>
        <span>Delete <strong>project-x</strong>?</span>
    </template>
    <p>This action is permanent and cannot be undone.</p>
</OriDialog>
```

#html

```html
<h2 id="dlg-title" class="ori-dialog__title">Delete <strong>project-x</strong>?</h2>
```

::

### Real-world recipe — confirm destructive action

A confirm / cancel pair inside a dialog, wired to an async action.

::example
:dialog-demo

#vue

```vue
<OriDialog title="Delete account?">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Delete account" variant="tonal" color="danger" />
    </template>
    <p>This will permanently delete your account and all its data. This cannot be undone.</p>
    <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem">
        <!-- Close via the adapter's close mechanism or a custom event -->
        <OriButton text="Cancel" variant="text" />
        <OriButton text="Yes, delete" color="danger" variant="fill" />
    </div>
</OriDialog>
```

#html

```html
<div role="dialog" aria-modal="true" aria-labelledby="dlg-title" class="ori-dialog__content">
    <header class="ori-dialog__header">
        <h2 id="dlg-title" class="ori-dialog__title">Delete account?</h2>
        <button class="ori-dialog__close" aria-label="Close">×</button>
    </header>
    <div class="ori-dialog__body">
        <p>This will permanently delete your account and all its data.</p>
        <div style="display:flex; justify-content:flex-end; gap:.5rem; margin-top:1rem">
            <button class="ori-button … ori-variant ori-variant_text …">Cancel</button>
            <button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_danger …">Yes, delete</button>
        </div>
    </div>
</div>
```

::

## Anatomy

The component renders its parts in this order:

```
#trigger slot (caller-supplied open control)
  └─ Teleport → <body>
       ├─ .ori-dialog__backdrop        (fixed overlay)
       └─ .ori-dialog__positioner      (flex centring wrapper)
            └─ .ori-dialog__content    (the visible panel)
                 ├─ .ori-dialog__header
                 │    ├─ .ori-dialog__title  (h2; #title slot or `title` prop)
                 │    └─ .ori-dialog__close  (× button, aria-label="Close")
                 └─ .ori-dialog__body        (default slot — body copy)
```

The entire overlay is rendered into `<body>` via `<Teleport>`, gated on a `mounted` ref so SSR
markup stays stable.

## Headless

`OriDialog` calls `useDialog()` from `@oriui/vue`. That composable reads the dialog adapter the
app registers via `OriHeadless`. The adapter owns focus trap, scroll lock, `Esc` handling, and all
ARIA wiring — the component supplies only the markup.

**Register the adapter once at app entry:**

```ts
// main.ts
import { createApp } from 'vue';
import { OriHeadless } from '@oriui/vue';
import { zagDialog } from './headless/zag-dialog'; // your adapter

const app = createApp(App);
app.use(OriHeadless, { dialog: zagDialog });
app.mount('#app');
```

`useDialog` has **no native fallback** — it throws with a descriptive error if no adapter is
provided. That is deliberate: a dialog is exactly the class of widget oriUI delegates rather than
hand-rolls, so it fails loud instead of shipping a half-correct focus trap.

## Props

| Prop          | Type      | Default | Description                                                                           |
| ------------- | --------- | ------- | ------------------------------------------------------------------------------------- |
| `defaultOpen` | `boolean` | `false` | Whether the dialog is open on first mount.                                            |
| `modal`       | `boolean` | `true`  | Modal mode: enables scroll lock, backdrop, and click-outside dismiss via the adapter. |
| `title`       | `string`  | —       | Heading text. Overridden by the `#title` slot when provided.                          |

## Events & attributes

`OriDialog` declares **no custom emits**. Open/close state is owned by the adapter (wired through
`useDialog()`). The `#trigger` slot exposes `props` and `open` — bind `v-bind="props"` on the
trigger element; `open` reflects the current open state if you need it in the template.

Attributes placed directly on `<OriDialog>` fall through to the root element in the template,
which is the `#trigger` slot's wrapper — for most usages you will not need to add attributes to the
component itself.

## Slots

| Slot      | Scope                              | Description                                                                                |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `trigger` | `{ props: object, open: boolean }` | The control that opens the dialog. Bind `:props` on your trigger element.                  |
| `title`   | —                                  | Replaces the heading text; receives no scope. Falls back to the `title` prop when omitted. |
| `default` | —                                  | Body content rendered inside `.ori-dialog__body`.                                          |

## Accessibility

- Content is `role="dialog"`, `aria-modal="true"`, and labelled by the title element via
  `aria-labelledby` — wired by the adapter.
- The close button has `aria-label="Close"`.
- The `#trigger` slot's `props` object includes all required `aria-*` and `id` attributes for the
  trigger element; bind them with `v-bind="props"`.
- The entire overlay is rendered into `<body>` via `<Teleport>`, gated on a `mounted` ref so SSR
  hydration is stable and the panel escapes any stacking context.

| Key         | Action                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| `Escape`    | Closes the dialog and returns focus to the trigger (provided by the adapter). |
| `Tab`       | Cycles focus among interactive elements inside the dialog (focus trap).       |
| `Shift+Tab` | Cycles focus backwards inside the dialog.                                     |
