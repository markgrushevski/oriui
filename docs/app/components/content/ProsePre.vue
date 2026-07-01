<script setup lang="ts">
// Overrides Nuxt Content's default ProsePre: wraps highlighted code in a card with a language
// label and a copy button. `code` is the raw (un-highlighted) text, ideal for the clipboard.
import { ref, type StyleValue } from 'vue';

const props = defineProps<{
    code?: string;
    language?: string | null;
    filename?: string | null;
    highlights?: number[];
    meta?: string | null;
    class?: string;
    style?: StyleValue;
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
    /* Light — pairs with the github-light Shiki tokens (Nuxt Content emits dual
       github-light/github-dark themes and switches token colours on html.dark). */
    --code-bg: #f6f8fa;
    --code-fg: #1f2328;
    --code-bar: #ebeef2;
    --code-border: #d0d7de;

    margin: 0 0 16px;

    overflow: hidden;

    border-radius: 10px;

    box-shadow: var(--ori-shadow-md);
}

/* Dark — pairs with the github-dark tokens, on a deep navy code surface (Ori-aligned). */
:root.dark .ori-code {
    --code-bg: #0f1d2e;
    --code-fg: #e6f3fb;
    --code-bar: #0a1626;
    --code-border: color-mix(in srgb, #ffffff 8%, transparent);
}

.ori-code__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 6px 10px 6px 14px;

    border-bottom: 1px solid var(--code-border);

    background: var(--code-bar);
}

.ori-code__lang {
    color: color-mix(in srgb, var(--code-fg) 55%, transparent);

    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.ori-code__copy {
    padding: 3px 10px;

    border: 1px solid var(--code-border);
    border-radius: 6px;

    background: none;
    color: color-mix(in srgb, var(--code-fg) 80%, transparent);

    font-size: 11px;
    font-weight: 600;

    cursor: pointer;
}

.ori-code__copy:hover {
    background: color-mix(in srgb, var(--code-fg) 8%, transparent);
    color: var(--code-fg);
}

.ori-code__copy[data-copied] {
    border-color: color-mix(in srgb, #16a34a 45%, transparent);
    color: #16a34a;
}

/* The inner Shiki <pre> fills the card with theme-aware code colours. */
.prose .ori-code pre {
    margin: 0;
    padding: 16px;

    overflow-x: auto;

    border-radius: 0;

    background: var(--code-bg);
    color: var(--code-fg);

    box-shadow: none;
}
</style>
