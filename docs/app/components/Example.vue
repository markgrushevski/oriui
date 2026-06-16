<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { Framework } from '../composables/useOriFramework';

// A documentation example: a live (Vue) preview + the source code, switchable across the
// frameworks the page provides. Default slot = the live preview; #vue / #svelte / #html slots =
// the code blocks. Tabs appear only for provided slots; the global preference picks the active one.
const { framework, setFramework } = useOriFramework();
const slots = useSlots();

const ALL: { key: Framework; label: string }[] = [
    { key: 'vue', label: 'Vue' },
    { key: 'svelte', label: 'Svelte' },
    { key: 'html', label: 'HTML' }
];

const available = computed(() => ALL.filter((f) => slots[f.key]));
const active = computed<Framework | undefined>(() =>
    available.value.some((f) => f.key === framework.value) ? framework.value : available.value[0]?.key
);
</script>

<template>
    <div class="example">
        <div class="example__preview">
            <slot />
        </div>

        <div v-if="available.length" class="example__bar">
            <button
                v-for="f in available"
                :key="f.key"
                type="button"
                class="example__tab"
                :data-active="active === f.key || undefined"
                @click="setFramework(f.key)"
            >
                {{ f.label }}
            </button>
        </div>

        <div class="example__code">
            <div v-for="f in available" v-show="active === f.key" :key="f.key">
                <slot :name="f.key" />
            </div>
        </div>
    </div>
</template>

<style>
.example {
    margin: 24px 0;

    overflow: hidden;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-background) 10%, transparent);
    border-radius: 14px;

    background: var(--ori-color-surface);

    box-shadow: var(--ori-shadow-md);
}

/* The live preview is a canvas on the page background, so surface-coloured
   components (cards) elevate on it — a faint dot grid signals "playground". */
.example__preview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;

    padding: 28px 24px;

    background:
        radial-gradient(color-mix(in srgb, var(--ori-color-on-background) 7%, transparent) 1px, transparent 1px) 0 0 /
            16px 16px,
        var(--ori-color-background);
}

.example__bar {
    display: flex;
    gap: 4px;

    padding: 6px 8px;

    border-top: 1px solid color-mix(in srgb, var(--ori-color-on-surface) 10%, transparent);

    background: color-mix(in srgb, var(--ori-color-on-surface) 3%, var(--ori-color-surface));
}

.example__tab {
    padding: 3px 12px;

    border: 0;
    border-radius: 6px;

    background: none;
    color: var(--ori-color-on-surface);

    font-size: 12px;
    font-weight: 600;

    cursor: pointer;
    opacity: 0.55;
}

.example__tab[data-active] {
    background: color-mix(in srgb, var(--ori-color-primary) 14%, transparent);
    color: var(--ori-color-primary);
    opacity: 1;
}

.example__code pre {
    margin: 0;
    border-radius: 0;
}
</style>
