<script setup lang="ts">
// A documentation example: a live (Vue) preview + the source code, switchable Vue <-> Svelte.
// The tabs set the GLOBAL framework preference, so every Example on the site follows along.
// Default slot = the live preview; #vue / #svelte slots = the code blocks.
const { framework, setFramework } = useOriFramework();
</script>

<template>
    <div class="example">
        <div class="example__preview">
            <slot />
        </div>

        <div class="example__bar">
            <button
                type="button"
                class="example__tab"
                :data-active="framework === 'vue' || undefined"
                @click="setFramework('vue')"
            >
                Vue
            </button>
            <button
                type="button"
                class="example__tab"
                :data-active="framework === 'svelte' || undefined"
                @click="setFramework('svelte')"
            >
                Svelte
            </button>
        </div>

        <div class="example__code">
            <div v-show="framework === 'vue'">
                <slot name="vue" />
            </div>
            <div v-show="framework === 'svelte'">
                <slot name="svelte" />
            </div>
        </div>
    </div>
</template>

<style>
.example {
    margin: 20px 0;

    overflow: hidden;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-background) 12%, transparent);
    border-radius: 12px;
}

.example__preview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;

    padding: 24px;

    background: var(--ori-color-background);
}

.example__bar {
    display: flex;
    gap: 4px;

    padding: 6px 8px;

    border-top: 1px solid color-mix(in srgb, var(--ori-color-on-background) 12%, transparent);

    background: var(--ori-color-surface);
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
    background: color-mix(in srgb, var(--ori-color-on-surface) 10%, transparent);
    opacity: 1;
}

.example__code pre {
    margin: 0;
    border-radius: 0;
}
</style>
