---
title: Dialog
---

# Dialog

A modal dialog — and the library's first genuinely **complex** behavior. Rather than reimplement a
focus trap, scroll lock, and the full WAI-ARIA keyboard contract, oriUI delegates the behavior to
[Zag](https://zagjs.com) through a **swappable headless contract**. The styled `OriDialog` only
provides markup + tokens; everything hard comes from the adapter.

## Live

Open it, then try <kbd>Tab</kbd> (focus stays inside), <kbd>Esc</kbd> (closes), and scrolling the
page behind it (locked).

::example
:dialog-demo

#vue

```vue
<OriDialog title="Weave a dialog">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Open dialog" color="primary" />
    </template>
    <p>This modal traps focus, closes on Escape, and locks page scroll.</p>
</OriDialog>
```

::

## Swappable behavior

`OriDialog` depends on the `useDialog()` **contract**, not on Zag directly. The app picks the engine
once at the root; every dialog uses it. Swap that one line — to a different engine, or your own
adapter — and the component markup is untouched.

```ts
// app entry — choose the dialog engine once.
import { OriHeadless } from '@oriui/vue';
import { zagDialog } from './headless/zag-dialog';

app.use(OriHeadless, { dialog: zagDialog });
```

Unlike `useDisclosure` (which ships a tiny native default), **`useDialog` has no native fallback** —
it throws with guidance if no adapter is provided. That is deliberate: a dialog is exactly the
class of widget oriUI chooses to _delegate_ rather than hand-roll, so it fails loud instead of
shipping a half-correct focus trap. (See [the headless decision](/) — native for simple, Zag for
complex.)

## What the adapter provides

- **Focus trap + return** — focus moves into the dialog on open and back to the trigger on close.
- **`Esc` to close** and click-outside dismissal (for `modal`).
- **Scroll lock** on the page behind the backdrop.
- **`role="dialog"` + `aria-modal="true"`**, wired to the title via `aria-labelledby`.
- Correct **pointer vs. touch** handling and document focus management.

## Accessibility

- The content is `role="dialog"`, `aria-modal="true"`, labelled by its `aria-labelledby` title.
- The close button has an `aria-label`; the trigger's `aria-*` and `id` wiring come from the adapter.
- Rendered via `<Teleport to="body">` inside `<ClientOnly>` so the overlay escapes any stacking
  context and only mounts client-side.
