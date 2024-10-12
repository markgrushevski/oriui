<script setup>
import DefaultTheme from 'vitepress/theme';
</script>

<template>
    <DefaultTheme.Layout />
</template>

<style>
:root {
    --color-cookie: #f4be68;
    --color-glass: #ebe6dc;
    --color-lid: #e6be86;

    --vp-button-brand-active-bg: #e6be86ff;
    --vp-button-brand-hover-bg: #f4be68ff;
    --vp-button-brand-bg: #f4be68d0;
    --vp-home-hero-name-color: transparent;
    --vp-home-hero-name-background: linear-gradient(
        90deg,
        var(--color-cookie) 0%,
        var(--color-glass) 56%,
        var(--color-lid) 80%
    );

    --vp-custom-block-font-size: 16px;
}

.custom-block .vij.flex {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 16px;
}

.custom-block .vij.flex.nowrap {
    flex-wrap: nowrap;
}

.custom-block .vij.flex.column {
    flex-direction: column;
    align-items: flex-start;
    justify-content: start;
}

.custom-block .vij.flex.between {
    justify-content: space-between;
}

.custom-block .vij.flex.stretch {
    align-items: stretch;
}

.custom-block .vij.flex.center {
    align-items: center;
}
</style>
