<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useDialog } from '@oriui/vue';

// OriDialog — the library's first behavioral styled component: styled markup + tokens over the
// engine-agnostic useDialog() contract. The focus trap, scroll lock, Escape, click-outside and
// aria-modal all come from whichever adapter the app wires via OriHeadless (e.g. Zag). useDialog
// has no native default, so it fails loud if no adapter is provided — a dialog is exactly the kind
// of complex widget oriUI delegates rather than hand-rolls.
const {
    defaultOpen = false,
    modal = true,
    title
} = defineProps<{
    defaultOpen?: boolean;
    modal?: boolean;
    title?: string;
}>();

const dlg = useDialog(() => ({ defaultOpen, modal }));

// Render the overlay only on the client (the library targets Vue, not Nuxt — no <ClientOnly>);
// gating the Teleport on a mounted ref keeps SSR markup stable and avoids hydration mismatches.
const mounted = ref(false);
onMounted(() => (mounted.value = true));
</script>

<template>
    <slot name="trigger" :props="dlg.triggerProps.value" :open="dlg.open.value"></slot>

    <Teleport v-if="mounted && dlg.open.value" to="body">
        <div v-bind="dlg.backdropProps.value" class="ori-dialog__backdrop"></div>
        <div v-bind="dlg.positionerProps.value" class="ori-dialog__positioner">
            <div v-bind="dlg.contentProps.value" class="ori-dialog__content">
                <header class="ori-dialog__header">
                    <h2 v-bind="dlg.titleProps.value" class="ori-dialog__title">
                        <slot name="title">{{ title }}</slot>
                    </h2>
                    <button v-bind="dlg.closeTriggerProps.value" class="ori-dialog__close" aria-label="Close">×</button>
                </header>
                <div class="ori-dialog__body">
                    <slot></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style>
.ori-dialog__backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;

    background: color-mix(in srgb, #000000 50%, transparent);
}

.ori-dialog__positioner {

    display: flex;
    position: fixed;
    z-index: 51;
    align-items: center;
    justify-content: center;

    padding: 16px;
    inset: 0;
}

.ori-dialog__content {
    width: 100%;
    max-width: 460px;
    padding: 24px;

    border-radius: 14px;

    background: var(--ori-color-surface);

    box-shadow: var(--ori-shadow-lg);
    color: var(--ori-color-on-surface);
}

.ori-dialog__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
}

.ori-dialog__title {
    margin: 0;

    font-size: 18px;
    font-weight: 700;
}

.ori-dialog__close {
    border: 0;
    opacity: 0.7;

    background: none;
    color: inherit;

    font-size: 22px;
    line-height: 1;

    cursor: pointer;
}

.ori-dialog__close:hover {
    opacity: 1;
}

.ori-dialog__body {
    opacity: 0.85;
    font-size: 14px;
}
</style>
