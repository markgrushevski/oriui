---
title: Button
---

# Button

A styled, accessible button. Dynamic state is expressed through real attributes — `disabled`
becomes a true `disabled` (or `aria-disabled` for link buttons), `loading` sets `aria-busy`,
and it ships a visible `:focus-visible` ring.

## Usage

```vue
<script setup>
import { OriButton } from 'oriui';
</script>

<template>
    <OriButton text="Button" variant="fill" color="primary" />
</template>
```

## Variants

`fill` · `tonal` · `outline` · `text` · `plain`

## Colors

`primary` · `secondary` · `success` · `warn` · `danger` · `info`

See every variant and color live on the [Playground](/playground).
