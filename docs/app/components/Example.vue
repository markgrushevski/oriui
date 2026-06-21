<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { Framework } from '../composables/useOriFramework';

// A documentation example: a live (Vue) preview + the source code, switchable across frameworks.
// Default slot = the live preview; #vue / #svelte / #html slots = the code blocks. Vue and HTML tabs
// appear only when their slot is provided; the Svelte tab is ALWAYS shown as a "soon" teaser and is
// enabled only on examples that ship Svelte code. The global preference (default Vue) picks the active.
const { framework, setFramework } = useOriFramework();
const slots = useSlots();

const ALL: { key: Framework; label: string }[] = [
    { key: 'vue', label: 'Vue' },
    { key: 'svelte', label: 'Svelte' },
    { key: 'html', label: 'HTML' }
];

// Render Vue/HTML only when present; Svelte always (the "soon" teaser).
const tabs = computed(() => ALL.filter((f) => f.key === 'svelte' || slots[f.key]));
const enabled = (key: Framework): boolean => Boolean(slots[key]);

// Honour the global preference when this example has that code; otherwise the first enabled tab.
const active = computed<Framework | undefined>(() =>
    slots[framework.value] ? framework.value : tabs.value.find((f) => enabled(f.key))?.key
);

function pick(key: Framework): void {
    if (enabled(key)) setFramework(key);
}
</script>

<template>
    <div class="example">
        <div class="example__preview">
            <slot />
        </div>

        <div v-if="tabs.length" class="example__bar">
            <button
                v-for="f in tabs"
                :key="f.key"
                type="button"
                class="example__tab"
                :data-active="active === f.key || undefined"
                :disabled="!enabled(f.key)"
                @click="pick(f.key)"
            >
                {{ f.label }}<span v-if="!enabled(f.key)" class="example__soon">soon</span>
            </button>
        </div>

        <div class="example__code">
            <div v-for="f in tabs" v-show="active === f.key" :key="f.key">
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

.example__tab:disabled {
    cursor: default;
    opacity: 0.4;
}

.example__soon {
    margin-inline-start: 5px;
    padding: 1px 5px;

    border-radius: 5px;

    background: color-mix(in srgb, var(--ori-color-on-surface) 12%, transparent);

    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    vertical-align: middle;
}

.example__code pre {
    margin: 0;
    border-radius: 0;
}
</style>
