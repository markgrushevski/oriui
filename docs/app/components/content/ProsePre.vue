<script setup lang="ts">
// Overrides Nuxt Content's default ProsePre: wraps highlighted code in a card with a language
// label and a copy button. `code` is the raw (un-highlighted) text, ideal for the clipboard.
import { ref } from 'vue';

const props = defineProps<{
    code?: string;
    language?: string | null;
    filename?: string | null;
    highlights?: number[];
    meta?: string | null;
    class?: string;
    style?: unknown;
}>();

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
    const text = props.code ?? '';
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for insecure contexts / older browsers.
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
        copied.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => (copied.value = false), 1400);
    } catch {
        // clipboard unavailable — no-op
    }
}
</script>

<template>
    <div class="ori-code">
        <div class="ori-code__bar">
            <span class="ori-code__lang">{{ filename || language || 'code' }}</span>
            <button type="button" class="ori-code__copy" :data-copied="copied || undefined" @click="copy">
                {{ copied ? '✓ Copied' : 'Copy' }}
            </button>
        </div>
        <pre :class="props.class" :style="props.style"><slot /></pre>
    </div>
</template>

<style>
.ori-code {
    margin: 0 0 16px;

    overflow: hidden;

    border-radius: 10px;

    box-shadow: var(--ori-shadow-md);
}

.ori-code__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 6px 10px 6px 14px;

    border-bottom: 1px solid color-mix(in srgb, #ffffff 8%, transparent);

    background: var(--ori-neutral-950);
}

.ori-code__lang {
    color: var(--ori-neutral-400);

    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.ori-code__copy {
    padding: 3px 10px;

    border: 1px solid color-mix(in srgb, #ffffff 14%, transparent);
    border-radius: 6px;

    background: none;
    color: var(--ori-neutral-200);

    font-size: 11px;
    font-weight: 600;

    cursor: pointer;
}

.ori-code__copy:hover {
    background: color-mix(in srgb, #ffffff 8%, transparent);
}

.ori-code__copy[data-copied] {
    border-color: color-mix(in srgb, #4ade80 40%, transparent);
    color: #4ade80;
}

/* Fold the inner <pre> into the code card (override .prose pre's own margin/radius/shadow). */
.prose .ori-code pre {
    margin: 0;

    border-radius: 0;

    box-shadow: none;
}
</style>
