<script lang="ts" setup>
import { useAttrs } from 'vue';
import { useToolbar } from '@oriui/headless/vue';

// OriToolbar — a styled WAI-ARIA toolbar: a set of controls behind a SINGLE tab stop, navigated with
// arrow keys (roving tabindex, real DOM focus). All the behaviour comes from the headless `useToolbar`
// (compositional roving context) — this SFC adds the box styling. Items are slotted OriToolbarButton /
// OriToolbarToggleGroup / OriToolbarSeparator; they register themselves with the context.
//
// A toolbar MUST have an accessible name: pass `label` (→ aria-label) or an `aria-labelledby` attribute.
const {
    dir = 'ltr',
    label,
    loop = true,
    orientation = 'horizontal'
} = defineProps<{
    /** Text direction — RTL swaps the horizontal Left/Right navigation. */
    dir?: 'ltr' | 'rtl';
    /** Accessible name → `aria-label`. Omit only if you supply `aria-labelledby` instead. */
    label?: string;
    /** Whether arrow navigation wraps first⇄last (default true). */
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
}>();

const { toolbarProps } = useToolbar({
    dir: () => dir,
    label: () => label,
    loop: () => loop,
    orientation: () => orientation
});

// A11y guardrail: a role="toolbar" with no accessible name is non-conformant (axe fails it). Warn in dev
// when neither `label` nor an aria-labelledby/aria-label attribute is present.
const attrs = useAttrs();
if (import.meta.env?.DEV && !label && !attrs['aria-label'] && !attrs['aria-labelledby']) {
    console.warn('[OriToolbar] needs an accessible name — pass `label` (aria-label) or `aria-labelledby`.');
}
</script>

<template>
    <div v-bind="toolbarProps" :class="['ori-toolbar', { 'ori-toolbar_vertical': orientation === 'vertical' }]">
        <slot></slot>
    </div>
</template>
