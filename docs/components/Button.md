---
prev:
    text: 'Avatar'
    link: '/components/avatar'
next:
    text: 'Button'
    link: '/components/button'
---

<script setup>
import { ref } from 'vue';
import { VButton } from '@lib';

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
import { VButton } from 'vueinjar';

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
    <v-button
        class="v-shadow"
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
    <v-button class="v-shadow" text="Button" :icon="iconPath" :loading="loading" @click="onClick" />
</div>

:::

## Sizes

```vue
<v-button size="xs" />
<v-button size="sm" />
<v-button size="md" />
<v-button size="lg" />
<v-button size="xl" />
```

:::info Output

<div class="vij flex">
    <v-button :icon="iconPath" size="xs" text="Button" />
    <v-button :icon="iconPath" size="sm" text="Button" />
    <v-button :icon="iconPath" size="md" text="Button" />
    <v-button :icon="iconPath" size="lg" text="Button" />
    <v-button :icon="iconPath" size="xl" text="Button" />
</div>

:::

## Variants and Colors

```vue
<v-button variant="fill" color="primary" />
<v-button variant="tonal" color="primary" />
<v-button variant="outline" color="primary" />
<v-button variant="text" color="primary" />
<v-button variant="plain" color="primary" />

<v-button variant="fill" color="secondary" />
<v-button variant="tonal" color="secondary" />
<v-button variant="outline" color="secondary" />
<v-button variant="text" color="secondary" />
<v-button variant="plain" color="secondary" />

<v-button variant="fill" color="surface" />
<v-button variant="tonal" color="surface" />
<v-button variant="outline" color="surface" />
<v-button variant="text" color="surface" />
<v-button variant="plain" color="surface" />

<v-button variant="fill" color="background" />
<v-button variant="tonal" color="background" />
<v-button variant="outline" color="background" />
<v-button variant="text" color="background" />
<v-button variant="plain" color="background" />

<v-button variant="fill" color="success" />
<v-button variant="tonal" color="success" />
<v-button variant="outline" color="success" />
<v-button variant="text" color="success" />
<v-button variant="plain" color="success" />

<v-button variant="fill" color="warn" />
<v-button variant="tonal" color="warn" />
<v-button variant="outline" color="warn" />
<v-button variant="text" color="warn" />
<v-button variant="plain" color="warn" />

<v-button variant="fill" color="danger" />
<v-button variant="tonal" color="danger" />
<v-button variant="outline" color="danger" />
<v-button variant="text" color="danger" />
<v-button variant="plain" color="danger" />

<v-button variant="fill" color="info" />
<v-button variant="tonal" color="info" />
<v-button variant="outline" color="info" />
<v-button variant="text" color="info" />
<v-button variant="plain" color="info" />
```

:::info Output

<div class="vij flex column stretch">
    <div class="vij flex">
        <v-button variant="fill" color="primary" text="Fill" />
        <v-button variant="tonal" color="primary" text="Tonal" />
        <v-button variant="outline" color="primary" text="Outline" />
        <v-button variant="text" color="primary" text="Text" />
        <v-button variant="plain" color="primary" text="Text" />
    </div>
    <div class="vij flex">
        <v-button variant="fill" color="secondary" text="Fill" />
        <v-button variant="tonal" color="secondary" text="Tonal" />
        <v-button variant="outline" color="secondary" text="Outline" />
        <v-button variant="text" color="secondary" text="Text" />
        <v-button variant="plain" color="secondary" text="Text" />
    </div>
    <div class="vij flex">
        <v-button variant="fill" color="surface" text="Fill" />
        <v-button variant="tonal" color="surface" text="Tonal" />
        <v-button variant="outline" color="surface" text="Outline" />
        <v-button variant="text" color="surface" text="Text" />
        <v-button variant="plain" color="surface" text="Text" />
    </div>
    <div class="vij flex">
        <v-button variant="fill" color="background" text="Fill" />
        <v-button variant="tonal" color="background" text="Tonal" />
        <v-button variant="outline" color="background" text="Outline" />
        <v-button variant="text" color="background" text="Text" />
        <v-button variant="plain" color="background" text="Text" />
    </div>
    <div class="vij flex">
        <v-button variant="fill" color="success" text="Fill" />
        <v-button variant="tonal" color="success" text="Tonal" />
        <v-button variant="outline" color="success" text="Outline" />
        <v-button variant="text" color="success" text="Text" />
        <v-button variant="plain" color="success" text="Text" />
    </div>
    <div class="vij flex">
        <v-button variant="fill" color="warn" text="Fill" />
        <v-button variant="tonal" color="warn" text="Tonal" />
        <v-button variant="outline" color="warn" text="Outline" />
        <v-button variant="text" color="warn" text="Text" />
        <v-button variant="plain" color="warn" text="Text" />
    </div>
    <div class="vij flex">
        <v-button variant="fill" color="danger" text="Fill" />
        <v-button variant="tonal" color="danger" text="Tonal" />
        <v-button variant="outline" color="danger" text="Outline" />
        <v-button variant="text" color="danger" text="Text" />
        <v-button variant="plain" color="danger" text="Text" />
    </div>
    <div class="vij flex">
        <v-button variant="fill" color="info" text="Fill" />
        <v-button variant="tonal" color="info" text="Tonal" />
        <v-button variant="outline" color="info" text="Outline" />
        <v-button variant="text" color="info" text="Text" />
        <v-button variant="plain" color="info" text="Text" />
    </div>
</div>

:::

## Icons

```vue
<v-button :icon="iconPath" />
<v-button text="Button" :icon="iconPath" />
<v-button text="Button" :icon="iconPath" icon-position="right" />
<v-button text="Button" :icon="iconPath" icon-position="top" />
<v-button text="Button" :icon="iconPath" icon-position="bottom" />
```

:::info Output

<div class="vij flex">
    <v-button :icon="iconPath" />
    <v-button text="Button" :icon="iconPath" />
    <v-button text="Button" :icon="iconPath" icon-position="right" />
    <v-button text="Button" :icon="iconPath" icon-position="top" />
    <v-button text="Button" :icon="iconPath" icon-position="bottom" />
</div>

:::
