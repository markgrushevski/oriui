---
title: useDisclosure
---

# useDisclosure

A headless **show / hide** primitive for disclosure widgets — expandable panels, accordions, menus,
the collapsible sidebar groups on this very site. It owns the open state, the WAI-ARIA wiring, and the
toggle handler; **you own the markup and the styles**.

This is the **Vue** binding of the headless layer; the framework-agnostic contract lives in
[@oriui/headless](/headless/core). Behaviour is swappable per primitive through the `OriHeadless` adapter,
and a zero-dependency native engine ships as the default — so it works with no setup.

## Import

```ts
import { useDisclosure } from '@oriui/headless/vue';
```

## Options

Pass an options object — or a getter returning one, to keep it reactive:

| Option        | Type      | Default | Description                                    |
| ------------- | --------- | ------- | ---------------------------------------------- |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled).             |
| `disabled`    | `boolean` | `false` | Ignore toggles while true.                     |
| `id`          | `string`  | auto    | Base id for the trigger / content ARIA wiring. |

## Returns

`useDisclosure` returns a `DisclosureControl` — reactive state, ARIA-correct prop bags to spread onto
your markup, and imperative handlers.

| Property        | Type                      | Description                                                                       |
| --------------- | ------------------------- | --------------------------------------------------------------------------------- |
| `open`          | `ComputedRef<boolean>`    | Current open state.                                                               |
| `rootProps`     | `ComputedRef<object>`     | Bind to the root wrapper (`data-state`).                                          |
| `triggerProps`  | `ComputedRef<object>`     | Bind to the toggle control (`aria-expanded`, `aria-controls`, click, `disabled`). |
| `contentProps`  | `ComputedRef<object>`     | Bind to the collapsible content (`id`, `role`, `aria-labelledby`, `hidden`).      |
| `setOpen(open)` | `(open: boolean) => void` | Imperatively set the state.                                                       |
| `toggle()`      | `() => void`              | Flip the state.                                                                   |

## Usage

Spread the prop bags onto your own elements — the primitive supplies the behaviour, you supply the
look:

```vue
<script setup lang="ts">
import { useDisclosure } from '@oriui/headless/vue';

const { open, triggerProps, contentProps } = useDisclosure(() => ({ defaultOpen: false }));
</script>

<template>
    <button v-bind="triggerProps">Details {{ open ? '▲' : '▼' }}</button>
    <div v-bind="contentProps">…content…</div>
</template>
```

The **Svelte** binding is the same primitive as stores — auto-subscribe with `$` and spread the bags:

```svelte
<script>
    import { useDisclosure } from '@oriui/headless/svelte';

    const { open, triggerProps, contentProps } = useDisclosure({ defaultOpen: false });
</script>

<button {...$triggerProps}>Details {$open ? '▲' : '▼'}</button>
<div {...$contentProps}>…content…</div>
```

## Adapter

The behaviour resolves through the `OriHeadless` contract. With nothing wired, `useDisclosure` falls
back to the **native** `@oriui/headless` engine — zero dependencies, no setup. To swap in a different
engine (Zag, or your own), provide a `disclosure` adapter once at the app root:

```ts
import { OriHeadless } from '@oriui/headless/vue';
import { myDisclosureAdapter } from './headless/my-disclosure';

app.use(OriHeadless, { disclosure: myDisclosureAdapter });
```

The adapter must satisfy the `DisclosureAdapter` contract — same `DisclosureControl` shape — so your
markup never changes when you swap engines. To scope an adapter to one subtree instead of the whole
app, call `provideHeadless({ disclosure: … })` inside that subtree's `setup`.

## Accessibility

The prop bags carry the full WAI-ARIA Disclosure pattern, so the wiring is correct as long as you bind
them:

- **`triggerProps`** renders a real `<button type="button">` with `aria-expanded` reflecting the open
  state and `aria-controls` pointing at the content. When `disabled`, it sets the real `disabled`
  attribute (plus `data-disabled` for styling).
- **`contentProps`** sets `role="region"`, `aria-labelledby` back to the trigger (so the region takes
  its accessible name from the toggle), and a real `hidden` attribute while collapsed — the content is
  removed from the accessibility tree and tab order when closed.
- Clicking the trigger toggles the state; activation is the native button behaviour, so `Enter` and
  `Space` both work with no extra handlers.
- `rootProps`, `triggerProps`, and `contentProps` each expose a `data-state` of `open` / `closed` as a
  styling hook for transitions.

| Key     | Action                                  |
| ------- | --------------------------------------- |
| `Enter` | Toggles the disclosure (native button). |
| `Space` | Toggles the disclosure (native button). |

## See also

- [@oriui/headless](/headless/core) — the framework-agnostic contract and the native engine behind this binding.
- [useDialog](/headless/use-dialog) — the modal counterpart; the hard-behaviour case delegated to an adapter.
- [CSS layer](/guides/css) — standalone `.ori-*` classes for styling the markup you bind these props to.
