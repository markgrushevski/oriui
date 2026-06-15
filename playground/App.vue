<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { OriButton, OriCard, OriAvatar, OriIcon, OriSpinner } from '../src';

const theme = ref<'light' | 'dark'>('light');
const skin = ref<'neutral' | 'ori'>('neutral');

watchEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('ori-theme_dark', theme.value === 'dark');
    el.classList.toggle('ori-theme_light', theme.value === 'light');
    if (skin.value === 'ori') el.setAttribute('data-ori-skin', 'ori');
    else el.removeAttribute('data-ori-skin');
});

const variants = ['fill', 'tonal', 'outline', 'text', 'plain'] as const;
const colors = ['primary', 'secondary', 'success', 'warn', 'danger', 'info'] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const plus = 'M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z';
</script>

<template>
    <div class="page">
        <header class="bar">
            <strong>oriUI</strong>
            <span class="muted">playground</span>
            <span class="spacer" />
            <OriButton
                text="Light"
                size="sm"
                :variant="theme === 'light' ? 'fill' : 'outline'"
                @click="theme = 'light'"
            />
            <OriButton text="Dark" size="sm" :variant="theme === 'dark' ? 'fill' : 'outline'" @click="theme = 'dark'" />
            <span class="sep" />
            <OriButton
                text="neutral"
                size="sm"
                :variant="skin === 'neutral' ? 'fill' : 'outline'"
                @click="skin = 'neutral'"
            />
            <OriButton text="ori" size="sm" :variant="skin === 'ori' ? 'fill' : 'outline'" @click="skin = 'ori'" />
        </header>

        <section>
            <h3>Buttons — variants (fill / tonal / outline / text / plain) × colors</h3>
            <div v-for="c in colors" :key="c" class="row">
                <OriButton v-for="v in variants" :key="v" :variant="v" :color="c" :text="c" />
            </div>
        </section>

        <section>
            <h3>Sizes & states</h3>
            <div class="row">
                <OriButton v-for="s in sizes" :key="s" :size="s" :text="s" />
            </div>
            <div class="row">
                <OriButton :icon="plus" text="icon" />
                <OriButton :icon="plus" />
                <OriButton text="loading" loading />
                <OriButton text="disabled" disabled />
                <OriButton as="a" href="#" text="as link" variant="tonal" />
            </div>
        </section>

        <section>
            <h3>Card · Avatar · Icon · Spinner</h3>
            <div class="row">
                <OriCard
                    class="card"
                    title="Card title"
                    subtitle="On the surface color"
                    text="Cards sit on --ori-color-surface; text uses the on-color."
                    :prepend-icon="plus"
                />
                <OriAvatar text="Ada Lovelace" title="Ada Lovelace" subtitle="Engineer" />
                <OriAvatar text="Grace Hopper" />
                <OriIcon :icon="plus" color="primary" size="xl" />
                <OriSpinner color="primary" size="xl" />
            </div>
        </section>
    </div>
</template>

<style>
body {
    margin: 0;
}

.page {
    min-height: 100vh;
    padding: 24px;
    background: var(--ori-color-background);
    color: var(--ori-color-on-background);
    font-family: system-ui, sans-serif;
    transition:
        background-color 0.2s,
        color 0.2s;
}

.bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
}

.bar .spacer {
    flex: 1;
}

.bar .sep {
    width: 1px;
    height: 24px;
    margin: 0 8px;
    opacity: 0.2;
    background: currentColor;
}

.muted {
    opacity: 0.6;
}

section {
    margin-bottom: 28px;
}

h3 {
    margin: 0 0 10px;
    opacity: 0.7;
    font-size: 14px;
    font-weight: 600;
}

.row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
}

.card {
    max-width: 300px;
}
</style>
