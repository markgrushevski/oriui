---
next:
    text: 'Button'
    link: '/components/button'
---

<script setup>
import { OriAvatar } from '@lib';

const base = process.env.NODE_ENV === 'production' ? '' : '/docs';
const imageLink = `${base}/image-example.jpg`;
</script>

# Avatar

Base element for avatar image

## Import and Usage

```vue {2}
<script setup>
import { OriAvatar } from 'oriui';

const imageLink = '...';
</script>

<template>
    <ori-avatar />
    <ori-avatar text="Some name" />
    <ori-avatar :src="imageLink" />
</template>
```

:::info Output

<div class="vij flex">
    <ori-avatar />
    <ori-avatar text="Some name" />
    <ori-avatar :src="imageLink" />
</div>

:::

## Titled

```vue {2}
<script setup>
import { OriAvatar } from 'oriui';

const imageLink = '...';
</script>

<template>
    <ori-avatar
        text="Marcus Tullius Cicero"
        title="Marcus Tullius Cicero"
        subtitle="statesman · lawyer · writer · orator"
        size="xxl"
    />
    <ori-avatar
        text="Marcus Tullius Cicero"
        title="Marcus Tullius Cicero"
        subtitle="statesman · lawyer · writer · orator"
        size="xxl"
        reverse
    />
</template>
```

:::info Output

<div class="vij flex" style="gap: 32px">
    <ori-avatar 
        text="Marcus Tullius Cicero"
        title="Marcus Tullius Cicero" 
        subtitle="statesman · lawyer · writer · orator" 
        size="xxl"
    />
    <ori-avatar
        text="Marcus Tullius Cicero"
        title="Marcus Tullius Cicero"
        subtitle="statesman · lawyer · writer · orator"
        size="xxl"
        reverse
    />
</div>

:::

## Colors

```vue {2}
<script setup>
import { OriAvatar } from 'oriui';
</script>

<template>
    <ori-avatar text="Some name" />
    <ori-avatar text="Some name" color="primary" />
    <ori-avatar text="Some name" color="secondary" />
    <ori-avatar text="Some name" color="surface" />
    <ori-avatar text="Some name" color="background" />
    <ori-avatar text="Some name" color="success" />
    <ori-avatar text="Some name" color="warn" />
    <ori-avatar text="Some name" color="danger" />
    <ori-avatar text="Some name" color="info" />
</template>
```

:::info Output

<div class="vij flex column center">
    <ori-avatar text="Some name" />
    <ori-avatar text="Some name" color="primary" />
    <ori-avatar text="Some name" color="secondary" />
    <ori-avatar text="Some name" color="surface" />
    <ori-avatar text="Some name" color="background" />
    <ori-avatar text="Some name" color="success" />
    <ori-avatar text="Some name" color="warn" />
    <ori-avatar text="Some name" color="danger" />
    <ori-avatar text="Some name" color="info" />
</div>

:::
