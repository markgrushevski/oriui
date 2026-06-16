---
title: Get started
---

# Get started

oriUI is a layered Vue 3 UI library. Install it and import only what you need.

## Install

```bash
npm install oriui
```

## Use a styled component

```vue
<script setup>
import { OriButton } from 'oriui';
</script>

<template>
    <OriButton text="Click me" variant="tonal" color="primary" />
</template>
```

Import the stylesheet once, for example in your entry file:

```ts
import 'oriui/css';
```

That is all — components are themeable through design tokens, with light/dark and swappable
skins out of the box. See them live on the [Playground](/playground).
