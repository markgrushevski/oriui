---
prev:
    text: 'Icon'
    link: '/components/icon'
next:
    text: 'Playground'
    link: '/playground'
---

<script setup>
import { OriSpinner } from '@lib';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
const colors = ['primary', 'secondary', 'success', 'warn', 'danger', 'info'];
</script>

# Spinner

An accessible loading indicator. It renders with `role="status"` and an `aria-label` (default
`Loading`), so assistive technology announces the busy state without any extra markup.

## Import and Usage

<!-- prettier-ignore-start -->
```vue
<script setup>
import { OriSpinner } from 'oriui';
</script>

<template>
    <ori-spinner />
</template>
```
<!-- prettier-ignore-end -->

:::info Output

<div class="vij flex">
    <ori-spinner />
</div>

:::

## Sizes

```vue
<ori-spinner size="xs" />
<ori-spinner size="sm" />
<ori-spinner size="md" />
<ori-spinner size="lg" />
<ori-spinner size="xl" />
```

:::info Output

<div class="vij flex">
    <ori-spinner v-for="s in sizes" :key="s" :size="s" />
</div>

:::

## Colors

```vue
<ori-spinner color="primary" />
<ori-spinner color="danger" />
```

:::info Output

<div class="vij flex">
    <ori-spinner v-for="c in colors" :key="c" :color="c" size="lg" />
</div>

:::

## Accessibility

- Renders `role="status"`; the accessible name comes from `aria-label` (override with the
  `label` prop, e.g. `label="Saving…"`).
- When nested inside a labelled control (such as a loading `OriButton`), the parent owns the
  announcement and the spinner is marked `aria-hidden` by that parent.
