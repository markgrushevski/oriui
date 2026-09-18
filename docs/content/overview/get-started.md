---
title: Get started
---

# Get started

oriUI is a layered Vue 3 UI library. Install it and import only what you need.

## Install

```bash
npm install @oriui/vue
```

## Use a styled component

```vue
<script setup>
import { OriButton } from '@oriui/vue'
</script>

<template>
    <OriButton text="Click me" variant="tonal" color="primary" />
</template>
```

Import the stylesheet once, for example in your entry file:

```ts
import '@oriui/css'
```

That full bundle is the **default** — it carries the tokens, the utilities and every component block.
Rendering only a handful of components? Import a foundation plus the blocks you use instead
(`@oriui/css/base.css` + `@oriui/css/components/button.css`); the entry set is not one file per
component, so see [à-la-carte imports](/guides/css) for which block ships where.

That is all — components are themeable through design tokens, with light/dark and swappable
skins out of the box. See them live on the [component pages](/components/button).

Need the CSS-only layer, the headless composables, or per-target setup? See
[Installation](/overview/installation).
