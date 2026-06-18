---
title: Dialog
---

# Dialog

A modal dialog — the library's first genuinely **interactive** component, built on the native
`<dialog>` element. Unlike the styled-only components, a dialog _needs behaviour_: focus trap, scroll
lock, `Esc`-to-close, click-outside dismissal, and the full WAI-ARIA keyboard contract. All of it comes
from the platform via `showModal()` — no state-machine dependency and no adapter to wire. The styled
`OriDialog` supplies only the markup and tokens.

Every example is live and shows the standalone **HTML / `@oriui/css`** markup by default — the part
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component. Note that the HTML tabs are **structure only — not functional on their own**: a static
`<dialog>` has no focus trap, scroll lock, or dismissal until `showModal()` drives it (the styled
component, or your own script).

## Classes

A dialog is a set of part classes hung on a native `<dialog>` element — there is no single block class
that drives variant tokens. Each part class maps to a structural element produced by the component.

:class-table{:rows='[{"class":"ori-dialog","type":"Block","description":"The native <code>&lt;dialog&gt;</code> panel: max-width 460 px, rounded, surface-coloured. Its <code>::backdrop</code> pseudo-element is the dimmed overlay."},{"class":"ori-dialog__content","type":"Layout","description":"Padding wrapper inside the dialog that holds the header and body."},{"class":"ori-dialog__header","type":"Part","description":"Flex row — title on the left, close button on the right."},{"class":"ori-dialog__title","type":"Part","description":"<code>h2</code> heading; its <code>id</code> is wired to <code>aria-labelledby</code> on the dialog."},{"class":"ori-dialog__close","type":"Part","description":"Bare close button (<code>aria-label=Close</code>); styled via opacity."},{"class":"ori-dialog__body","type":"Part","description":"Body copy region below the header."}]'}

## Anatomy

The component renders its parts in this order:

```
#trigger slot (caller-supplied open control)
  └─ <dialog class="ori-dialog">         (native element; ::backdrop is the overlay)
       └─ .ori-dialog__content           (padding wrapper)
            ├─ .ori-dialog__header
            │    ├─ .ori-dialog__title    (h2; #title slot or `title` prop)
            │    └─ .ori-dialog__close    (× button, aria-label="Close")
            └─ .ori-dialog__body          (default slot — body copy)
```

The `<dialog>` is rendered inline; `showModal()` promotes it to the browser's top layer, so it escapes
any stacking context without `<Teleport>`. A closed `<dialog>` is hidden, so SSR markup stays stable.

## Basic

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
<!-- Structure only — drive it with dialog.showModal() to get the trap / ::backdrop. -->
<dialog class="ori-dialog" aria-labelledby="dlg-title">
    <div class="ori-dialog__content">
        <header class="ori-dialog__header">
            <h2 id="dlg-title" class="ori-dialog__title">Hello, oriUI</h2>
            <button class="ori-dialog__close" aria-label="Close">×</button>
        </header>
        <div class="ori-dialog__body">
            <p>This modal traps focus, closes on Escape, and locks page scroll.</p>
        </div>
    </div>
</dialog>
```

::

## Non-modal

Set `modal` to `false` for a non-modal dialog (opened with `show()` instead of `showModal()` — no scroll
lock, no focus trap, no `::backdrop`, no click-outside dismiss).

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
<!-- Structure only — open with dialog.show() for non-modal. -->
<dialog class="ori-dialog" aria-modal="false" aria-labelledby="dlg-title">
    <!-- content -->
</dialog>
```

::

## Initially open

Pass `defaultOpen` to open the dialog on first mount — useful for confirmation prompts that appear on
page load.

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
<!-- Structure only — call dialog.showModal() on mount to open it. -->
<dialog class="ori-dialog" aria-labelledby="dlg-title" open>
    <!-- content -->
</dialog>
```

::

## Custom title via slot

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
<!-- Structure only — not functional on its own. -->
<h2 id="dlg-title" class="ori-dialog__title">Delete <strong>project-x</strong>?</h2>
```

::

## Common patterns

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
<!-- Structure only — not functional on its own. -->
<dialog class="ori-dialog" aria-labelledby="dlg-title">
    <div class="ori-dialog__content">
        <header class="ori-dialog__header">
            <h2 id="dlg-title" class="ori-dialog__title">Delete account?</h2>
            <button class="ori-dialog__close" aria-label="Close">×</button>
        </header>
        <div class="ori-dialog__body">
            <p>This will permanently delete your account and all its data.</p>
            <div style="display:flex; justify-content:flex-end; gap:.5rem; margin-top:1rem">
                <button class="ori-button … ori-variant ori-variant_text …">Cancel</button>
                <button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_danger …">
                    Yes, delete
                </button>
            </div>
        </div>
    </div>
</dialog>
```

::

## Accessibility

The accessibility contract holds across both layers — the classes and the Vue component render the
same attributes. The interactive behaviour, however, must be driven by JavaScript: a static HTML
`<dialog>` is markup only until `showModal()` opens it.

- The `<dialog>` is `role="dialog"`, `aria-modal="true"` (modal mode), and labelled by the title
  element via `aria-labelledby`.
- The close button has `aria-label="Close"`.
- The `#trigger` slot's `props` object includes the `aria-*` attributes for the trigger element; bind
  them with `v-bind="props"`.
- `showModal()` provides the live behaviour — focus trap, scroll lock, `::backdrop`, and returning focus
  to the trigger on close — straight from the platform.

| Key         | Action                                                                  |
| ----------- | ----------------------------------------------------------------------- |
| `Escape`    | Closes the dialog and returns focus to the trigger (native `<dialog>`). |
| `Tab`       | Cycles focus among interactive elements inside the dialog (focus trap). |
| `Shift+Tab` | Cycles focus backwards inside the dialog.                               |

## Framework API

The props, events, slots, and headless wiring of the **Vue** component. The standalone CSS layer has
no component API — its surface is the [classes](#classes) above, and the behaviour is yours to wire.
(Svelte bindings are planned.)

### Props

| Prop                     | Type      | Default | Description                                                                |
| ------------------------ | --------- | ------- | -------------------------------------------------------------------------- |
| `closeOnEscape`          | `boolean` | `true`  | Whether `Esc` closes the dialog.                                           |
| `closeOnInteractOutside` | `boolean` | `true`  | Whether a click on the `::backdrop` closes the dialog.                     |
| `defaultOpen`            | `boolean` | `false` | Whether the dialog is open on first mount.                                 |
| `modal`                  | `boolean` | `true`  | Modal mode: `showModal()` (trap + scroll lock + `::backdrop`) vs `show()`. |
| `title`                  | `string`  | —       | Heading text. Overridden by the `#title` slot when provided.               |

### Events & attributes

`OriDialog` declares **no custom emits**. Open/close state is owned by `useDialog()`. The `#trigger`
slot exposes `props` and `open` — bind `v-bind="props"` on the trigger element; `open` reflects the
current open state if you need it in the template.

Attributes placed directly on `<OriDialog>` fall through to the root element in the template,
which is the `#trigger` slot's wrapper — for most usages you will not need to add attributes to the
component itself.

### Slots

| Slot      | Scope                              | Description                                                                                |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `trigger` | `{ props: object, open: boolean }` | The control that opens the dialog. Bind `:props` on your trigger element.                  |
| `title`   | —                                  | Replaces the heading text; receives no scope. Falls back to the `title` prop when omitted. |
| `default` | —                                  | Body content rendered inside `.ori-dialog__body`.                                          |

### Headless & adapter

`OriDialog` calls [`useDialog()`](/headless/use-dialog) from `@oriui/vue`, which defaults to the native
`<dialog>` engine — the focus trap, scroll lock, `Esc` handling, `::backdrop` and focus-return are the
platform's job, so **no adapter and no extra dependency are required**.

The `OriHeadless` contract is still available as a hedge: register a custom engine (e.g. a Zag-backed
adapter for a genuinely hard widget) only if a project needs one — the markup never changes.

```ts
// main.ts — optional; the native engine is used when nothing is registered.
import { createApp } from 'vue';
import { OriHeadless } from '@oriui/vue';
import { myDialog } from './headless/my-dialog'; // optional custom adapter

const app = createApp(App);
app.use(OriHeadless, { dialog: myDialog });
app.mount('#app');
```

See [useDialog](/headless/use-dialog) for the full control contract.
