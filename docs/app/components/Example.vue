<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useOriFramework, NO_FRAMEWORK, type Framework } from '../composables/useOriFramework'

// A documentation example: an optional live (Vue) preview + the source code, switchable across the
// layers it provides. Default slot = the live preview; #html / #js / #ts (framework-free) and #vue /
// #svelte / #react (framework) slots = the code blocks. An example that ships any framework-free code
// defaults to the framework-free preference (HTML); a pure-framework example defaults to the framework
// one (Vue). Only slots that ship code become tabs — Svelte and React appear just where that binding's
// block ships (@oriui/headless/svelte, @oriui/headless/react), not on the styled-only pages (HTML covers
// their usage there). The preview is dropped when there is no default slot, so a headless page can use
// the same tab strip for code alone.
const { noFramework, framework, setCode } = useOriFramework()
const slots = useSlots()

const LABELS: Record<Framework, string> = {
    html: 'HTML',
    js: 'JS',
    ts: 'TS',
    vue: 'Vue',
    svelte: 'Svelte',
    react: 'React'
}
const ORDER: Framework[] = ['html', 'js', 'ts', 'vue', 'svelte', 'react']

const isFree = computed(() => NO_FRAMEWORK.some((f) => slots[f]))
const enabled = (key: Framework): boolean => Boolean(slots[key])

// Show every provided slot in canonical order — a binding tab appears only where its block ships.
const tabs = computed(() => ORDER.filter((f) => slots[f]).map((key) => ({ key, label: LABELS[key] })))
// Default to the relevant group's preference; fall back to the first available tab.
const pref = computed<Framework>(() => (isFree.value ? noFramework.value : framework.value))
const active = computed<Framework | undefined>(() =>
    enabled(pref.value) ? pref.value : tabs.value.find((f) => enabled(f.key))?.key
)

function pick(key: Framework): void {
    if (enabled(key)) setCode(key)
}
</script>

<template>
    <div class="example">
        <div v-if="$slots.default" class="example__preview">
            <slot />
        </div>

        <div v-if="tabs.length" class="example__bar">
            <button
                v-for="f in tabs"
                :key="f.key"
                type="button"
                class="example__tab"
                :data-active="active === f.key || undefined"
                @click="pick(f.key)"
            >
                {{ f.label }}
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

.example__code pre {
    margin: 0;
    border-radius: 0;
}

/* A tab may carry a note of its own next to the snippet — the headless pages keep each binding's
   caveat inside that binding's tab. Prose needs the padding the full-bleed <pre> deliberately lacks. */
.example__code > div > :where(p, ul, ol) {
    margin: 0;

    padding: 12px 16px;

    color: color-mix(in srgb, var(--ori-color-on-surface) 80%, transparent);

    font-size: 14px;
    line-height: 1.6;
}
</style>
