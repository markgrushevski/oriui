---
title: Installation
---

# Installation

oriUI is three layers in two packages. Install only the layer you need — they share one token
contract, so you can add another later without reworking what you built.

## Requirements

- **Node ≥ 20.19** and a bundler (Vite, webpack, Nuxt, …) for the Vue layers.
- **Vue 3.5+** for the styled and headless layers (the components use reactive props destructure).
- The **CSS layer needs none of the above** — it is a plain stylesheet and classes.

## Styled components — `oriui`

The full experience: ready Vue components, themed through tokens.

```bash
npm install oriui
```

Import a component where you use it, and the stylesheet **once** at your app entry:

```vue
<script setup lang="ts">
import { OriButton } from 'oriui';
</script>

<template>
    <OriButton text="Click me" variant="tonal" color="primary" />
</template>
```

```ts
// main.ts — once, anywhere in your entry
import 'oriui/css';
```

That single import ships the tokens, the base styles, and every component's classes. Theme and skin
are then just attributes on `<html>` — see [Theming](/guides/theming).

## The CSS layer — `oriui/css`

No framework, no build step: ship the stylesheet and write `.ori-*` classes. This is how oriUI works
with **htmx, Astro, or plain HTML**.

From a bundler:

```ts
import 'oriui/css';
```

Or straight from a CDN, no install at all:

```html
<link rel="stylesheet" href="https://unpkg.com/oriui/dist/styles/styles.css" />
```

The full class reference and copy-pasteable markup live in [Using the CSS layer](/guides/css) and on
each component page — flip any example to its **HTML** tab.

## The headless layer — `@oriui/vue`

Behavior without markup: composables for open state, keyboard, focus, and ARIA. Installing `oriui`
already pulls this in transitively, but you can install it on its own:

```bash
npm install @oriui/vue
```

```ts
import { useDisclosure } from '@oriui/vue';
```

`useDisclosure` works out of the box on a zero-dependency native engine. The harder primitives —
`useDialog`, with its focus trap and scroll lock — have **no native default** and require an adapter.
Register one (Zag-backed) once at app entry:

```ts
// main.ts
import { OriHeadless } from '@oriui/vue';
import { zagDialog } from './headless/zag-dialog'; // your adapter

app.use(OriHeadless, { dialog: zagDialog });
```

```bash
npm install @zag-js/dialog @zag-js/vue
```

See [@oriui/core](/headless/core) for the contract and [useDialog](/headless/use-dialog) for the full
adapter setup.

## Next

- [Get started](/overview/get-started) — your first component, end to end.
- [Introduction](/overview/introduction) — the layered idea and where each layer fits.
