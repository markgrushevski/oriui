---
title: useDisclosure
---

# useDisclosure

A headless **show / hide** primitive for disclosure widgets — menus, accordions, expandable panels,
the sidebar groups on this very site. It owns the open state, the ARIA wiring, and the event handlers;
**you own the markup and styles**. A zero-dependency native engine ships from `@oriui/core`, and the
behaviour is swappable through the `OriHeadless` adapter contract.

This is the **Vue** binding of the headless layer. The framework-agnostic pieces are the
[CSS layer](/guides/css) and `@oriui/core`.

## Import

```ts
import { useDisclosure } from '@oriui/vue';
```

## Returns

| Property        | Type                      | Description                                          |
| --------------- | ------------------------- | ---------------------------------------------------- |
| `open`          | `ComputedRef<boolean>`    | Current open state.                                  |
| `rootProps`     | `ComputedRef<object>`     | Bind to the root wrapper element.                    |
| `triggerProps`  | `ComputedRef<object>`     | Bind to the toggle control (`aria-expanded`, click). |
| `contentProps`  | `ComputedRef<object>`     | Bind to the collapsible content (`id`, `hidden`).    |
| `setOpen(open)` | `(open: boolean) => void` | Imperatively set the state.                          |
| `toggle()`      | `() => void`              | Flip the state.                                      |

## Options

Pass an options object (or a getter returning one, to stay reactive):

| Option        | Type      | Default | Description                          |
| ------------- | --------- | ------- | ------------------------------------ |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled).   |
| `disabled`    | `boolean` | `false` | Ignore toggles while true.           |
| `id`          | `string`  | auto    | Base id for the trigger/content ARIA |

## Usage

```vue
<script setup lang="ts">
import { useDisclosure } from '@oriui/vue';

const { open, triggerProps, contentProps } = useDisclosure(() => ({ defaultOpen: false }));
</script>

<template>
    <button v-bind="triggerProps">Details {{ open ? '▲' : '▼' }}</button>
    <div v-bind="contentProps">…content…</div>
</template>
```

## Adapter

Uses the native `@oriui/core` engine by default — no setup needed. To swap the behaviour engine,
provide a `disclosure` adapter once at the app root:

```ts
app.use(OriHeadless, { disclosure: myDisclosureAdapter });
```
