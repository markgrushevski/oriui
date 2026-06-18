<script setup lang="ts">
// A ⌘K / Ctrl-K command palette for searching the docs. It consumes the engine-agnostic
// useDialog() contract directly (a second, richer consumer than OriDialog) — so the focus trap,
// scroll lock, Escape, and aria-modal all come from the native <dialog> the contract defaults to.
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch, watchPostEffect } from 'vue';
import { useDialog } from '@oriui/vue';

interface Doc {
    path: string;
    title: string;
    description?: string;
}

const dlg = useDialog(() => ({ modal: true }));
const query = ref('');
const activeIndex = ref(0);
const inputEl = ref<HTMLInputElement>();
const dialogEl = useTemplateRef<HTMLDialogElement>('dialog');

// Drive the native <dialog> from the contract's open state (showModal gives the focus trap,
// ::backdrop, top-layer and Esc for free). `flush: 'post'` runs after the element is in the DOM.
watchPostEffect(() => {
    const el = dialogEl.value;
    if (!el) return;
    if (dlg.open.value && !el.open) el.showModal();
    else if (!dlg.open.value && el.open) el.close();
});

const { data } = await useAsyncData('cmdk-index', () =>
    queryCollection('docs').select('path', 'title', 'description').all()
);
const docs = computed<Doc[]>(() => (data.value as Doc[] | null) ?? []);

const results = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return docs.value;
    return docs.value.filter(
        (d) =>
            d.title?.toLowerCase().includes(q) ||
            d.path?.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q)
    );
});

watch(results, () => (activeIndex.value = 0));
watch(
    () => dlg.open.value,
    (isOpen) => {
        if (isOpen) nextTick(() => inputEl.value?.focus());
    }
);

function open() {
    query.value = '';
    activeIndex.value = 0;
    dlg.setOpen(true);
}

function go(path: string) {
    dlg.setOpen(false);
    navigateTo(path);
}

function onInputKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex.value = Math.max(activeIndex.value - 1, 0);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const r = results.value[activeIndex.value];
        if (r) go(r.path);
    }
}

function onGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open();
    }
}

onMounted(() => document.addEventListener('keydown', onGlobalKeydown));
onUnmounted(() => document.removeEventListener('keydown', onGlobalKeydown));
</script>

<template>
    <button type="button" class="cmdk-trigger" @click="open">
        <span class="cmdk-trigger__icon" aria-hidden="true">⌕</span>
        <span class="cmdk-trigger__label">Search</span>
        <kbd class="cmdk-trigger__kbd">⌘K</kbd>
    </button>

    <dialog ref="dialog" v-bind="dlg.dialogProps.value" class="cmdk-dialog">
        <div v-if="dlg.open.value" class="cmdk">
            <h2 v-bind="dlg.titleProps.value" class="cmdk__title">Search the docs</h2>
            <input
                ref="inputEl"
                v-model="query"
                class="cmdk__input"
                type="text"
                placeholder="Search the docs…"
                aria-label="Search the docs"
                @keydown="onInputKeydown"
            />
            <ul class="cmdk__results">
                <li v-if="!results.length" class="cmdk__empty">No results for “{{ query }}”.</li>
                <li v-for="(r, i) in results" :key="r.path">
                    <button
                        type="button"
                        class="cmdk__item"
                        :data-active="i === activeIndex || undefined"
                        @click="go(r.path)"
                        @mousemove="activeIndex = i"
                    >
                        <span class="cmdk__item-title">{{ r.title }}</span>
                        <span class="cmdk__item-path">{{ r.path }}</span>
                    </button>
                </li>
            </ul>
            <div class="cmdk__footer">
                <kbd>↑</kbd><kbd>↓</kbd> to navigate <kbd>↵</kbd> to open <kbd>esc</kbd> to close
            </div>
        </div>
    </dialog>
</template>

<style>
.cmdk-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    padding: 5px 10px;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-background) 18%, transparent);
    border-radius: 8px;

    background: none;
    color: color-mix(in srgb, var(--ori-color-on-background) 75%, transparent);

    font-size: 13px;
    font-weight: 600;

    cursor: pointer;
}

.cmdk-trigger:hover {
    color: var(--ori-color-on-background);
}

.cmdk-trigger__icon {
    font-size: 15px;
}

.cmdk-trigger__kbd {
    padding: 1px 5px;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-background) 18%, transparent);
    border-radius: 5px;

    font-size: 11px;
}

.cmdk-dialog {
    width: min(560px, calc(100% - 32px));
    max-width: none;
    max-height: 70vh;
    margin: 12vh auto auto;
    padding: 0;

    overflow: visible;

    border: 0;

    background: transparent;
}

.cmdk-dialog::backdrop {
    background: color-mix(in srgb, #000000 45%, transparent);

    backdrop-filter: blur(2px);
}

.cmdk__title {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;

    overflow: hidden;

    clip: rect(0 0 0 0);
    white-space: nowrap;

    border: 0;
}

.cmdk {
    width: 100%;

    overflow: hidden;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-background) 12%, transparent);
    border-radius: 14px;

    background: var(--ori-color-surface);
    color: var(--ori-color-on-surface);

    box-shadow: var(--ori-shadow-lg);
}

.cmdk__input {
    width: 100%;
    padding: 16px 18px;

    border: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--ori-color-on-surface) 10%, transparent);

    background: none;
    color: inherit;

    font-size: 16px;
}

.cmdk__input:focus {
    outline: none;
}

.cmdk__results {
    max-height: 50vh;
    margin: 0;
    padding: 6px;

    overflow-y: auto;

    list-style: none;
}

.cmdk__empty {
    padding: 18px;

    color: color-mix(in srgb, var(--ori-color-on-surface) 60%, transparent);

    text-align: center;
}

.cmdk__item {
    display: flex;
    align-items: baseline;
    gap: 10px;
    width: 100%;

    padding: 9px 12px;

    border: 0;
    border-radius: 8px;

    background: none;
    color: inherit;

    text-align: left;

    cursor: pointer;
}

.cmdk__item[data-active] {
    background: color-mix(in srgb, var(--ori-color-primary) 14%, transparent);
}

.cmdk__item-title {
    font-size: 14px;
    font-weight: 600;
}

.cmdk__item[data-active] .cmdk__item-title {
    color: var(--ori-color-primary);
}

.cmdk__item-path {
    color: color-mix(in srgb, var(--ori-color-on-surface) 50%, transparent);
    font-size: 12px;
}

.cmdk__footer {
    display: flex;
    align-items: center;
    gap: 6px;

    padding: 8px 14px;

    border-top: 1px solid color-mix(in srgb, var(--ori-color-on-surface) 10%, transparent);

    color: color-mix(in srgb, var(--ori-color-on-surface) 55%, transparent);

    font-size: 11px;
}

.cmdk__footer kbd {
    padding: 1px 5px;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-surface) 18%, transparent);
    border-radius: 4px;
}
</style>
