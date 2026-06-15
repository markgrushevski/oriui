---
prev:
    text: 'Avatar'
    link: '/components/avatar'
next:
    text: 'Card'
    link: '/components/card'
---

<script setup>
import { ref } from 'vue';
import { OriButton } from '@lib';

const iconPath = 'M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z';

const loading = ref(false);

function onClick() {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 2000);
}
</script>

# Button

Standard element with tuning

## Import and Usage

<!-- prettier-ignore-start -->
```vue {3}
<script setup>
import { ref } from 'vue';
import { OriButton } from 'oriui';

const iconPath = 'M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z';

const loading = ref(false);

function onClick() {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 2000);
}
</script>

<template>
    <ori-button
        class="ori-shadow"
        text="Button"
        :icon="iconPath"
        :loading="loading"
        @click="onClick"
    />
</template>
```
<!-- prettier-ignore-end -->

:::info Output

<div class="vij flex">
    <ori-button class="ori-shadow" text="Button" :icon="iconPath" :loading="loading" @click="onClick" />
</div>

:::

## Sizes

```vue
<ori-button size="xs" />
<ori-button size="sm" />
<ori-button size="md" />
<ori-button size="lg" />
<ori-button size="xl" />
```

:::info Output

<div class="vij flex">
    <ori-button :icon="iconPath" size="xs" text="Button" />
    <ori-button :icon="iconPath" size="sm" text="Button" />
    <ori-button :icon="iconPath" size="md" text="Button" />
    <ori-button :icon="iconPath" size="lg" text="Button" />
    <ori-button :icon="iconPath" size="xl" text="Button" />
</div>

:::

## Variants and Colors

```vue
<ori-button variant="fill" color="primary" />
<ori-button variant="tonal" color="primary" />
<ori-button variant="outline" color="primary" />
<ori-button variant="text" color="primary" />
<ori-button variant="plain" color="primary" />

<ori-button variant="fill" color="secondary" />
<ori-button variant="tonal" color="secondary" />
<ori-button variant="outline" color="secondary" />
<ori-button variant="text" color="secondary" />
<ori-button variant="plain" color="secondary" />

<ori-button variant="fill" color="surface" />
<ori-button variant="tonal" color="surface" />
<ori-button variant="outline" color="surface" />
<ori-button variant="text" color="surface" />
<ori-button variant="plain" color="surface" />

<ori-button variant="fill" color="background" />
<ori-button variant="tonal" color="background" />
<ori-button variant="outline" color="background" />
<ori-button variant="text" color="background" />
<ori-button variant="plain" color="background" />

<ori-button variant="fill" color="success" />
<ori-button variant="tonal" color="success" />
<ori-button variant="outline" color="success" />
<ori-button variant="text" color="success" />
<ori-button variant="plain" color="success" />

<ori-button variant="fill" color="warn" />
<ori-button variant="tonal" color="warn" />
<ori-button variant="outline" color="warn" />
<ori-button variant="text" color="warn" />
<ori-button variant="plain" color="warn" />

<ori-button variant="fill" color="danger" />
<ori-button variant="tonal" color="danger" />
<ori-button variant="outline" color="danger" />
<ori-button variant="text" color="danger" />
<ori-button variant="plain" color="danger" />

<ori-button variant="fill" color="info" />
<ori-button variant="tonal" color="info" />
<ori-button variant="outline" color="info" />
<ori-button variant="text" color="info" />
<ori-button variant="plain" color="info" />
```

:::info Output

<div class="vij flex column stretch">
    <div class="vij flex">
        <ori-button variant="fill" color="primary" text="Fill" />
        <ori-button variant="tonal" color="primary" text="Tonal" />
        <ori-button variant="outline" color="primary" text="Outline" />
        <ori-button variant="text" color="primary" text="Text" />
        <ori-button variant="plain" color="primary" text="Text" />
    </div>
    <div class="vij flex">
        <ori-button variant="fill" color="secondary" text="Fill" />
        <ori-button variant="tonal" color="secondary" text="Tonal" />
        <ori-button variant="outline" color="secondary" text="Outline" />
        <ori-button variant="text" color="secondary" text="Text" />
        <ori-button variant="plain" color="secondary" text="Text" />
    </div>
    <div class="vij flex">
        <ori-button variant="fill" color="surface" text="Fill" />
        <ori-button variant="tonal" color="surface" text="Tonal" />
        <ori-button variant="outline" color="surface" text="Outline" />
        <ori-button variant="text" color="surface" text="Text" />
        <ori-button variant="plain" color="surface" text="Text" />
    </div>
    <div class="vij flex">
        <ori-button variant="fill" color="background" text="Fill" />
        <ori-button variant="tonal" color="background" text="Tonal" />
        <ori-button variant="outline" color="background" text="Outline" />
        <ori-button variant="text" color="background" text="Text" />
        <ori-button variant="plain" color="background" text="Text" />
    </div>
    <div class="vij flex">
        <ori-button variant="fill" color="success" text="Fill" />
        <ori-button variant="tonal" color="success" text="Tonal" />
        <ori-button variant="outline" color="success" text="Outline" />
        <ori-button variant="text" color="success" text="Text" />
        <ori-button variant="plain" color="success" text="Text" />
    </div>
    <div class="vij flex">
        <ori-button variant="fill" color="warn" text="Fill" />
        <ori-button variant="tonal" color="warn" text="Tonal" />
        <ori-button variant="outline" color="warn" text="Outline" />
        <ori-button variant="text" color="warn" text="Text" />
        <ori-button variant="plain" color="warn" text="Text" />
    </div>
    <div class="vij flex">
        <ori-button variant="fill" color="danger" text="Fill" />
        <ori-button variant="tonal" color="danger" text="Tonal" />
        <ori-button variant="outline" color="danger" text="Outline" />
        <ori-button variant="text" color="danger" text="Text" />
        <ori-button variant="plain" color="danger" text="Text" />
    </div>
    <div class="vij flex">
        <ori-button variant="fill" color="info" text="Fill" />
        <ori-button variant="tonal" color="info" text="Tonal" />
        <ori-button variant="outline" color="info" text="Outline" />
        <ori-button variant="text" color="info" text="Text" />
        <ori-button variant="plain" color="info" text="Text" />
    </div>
</div>

:::

## Icons

```vue
<ori-button :icon="iconPath" />
<ori-button text="Button" :icon="iconPath" />
<ori-button text="Button" :icon="iconPath" icon-position="right" />
<ori-button text="Button" :icon="iconPath" icon-position="top" />
<ori-button text="Button" :icon="iconPath" icon-position="bottom" />
```

:::info Output

<div class="vij flex">
    <ori-button :icon="iconPath" />
    <ori-button text="Button" :icon="iconPath" />
    <ori-button text="Button" :icon="iconPath" icon-position="right" />
    <ori-button text="Button" :icon="iconPath" icon-position="top" />
    <ori-button text="Button" :icon="iconPath" icon-position="bottom" />
</div>

:::
