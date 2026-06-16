<script setup lang="ts">
// Prototype of the styled OriDialog (to be promoted into the `oriui` package). It consumes the
// engine-agnostic `useDialog()` contract; the docs app wires it to Zag via OriHeadless. All the
// hard behavior — focus trap, Escape, scroll lock, aria-modal — comes from the adapter.
import { useDialog } from '@oriui/vue';

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
</script>

<template>
    <slot name="trigger" :props="dlg.triggerProps.value" :open="dlg.open.value" />

    <ClientOnly>
        <Teleport to="body">
            <template v-if="dlg.open.value">
                <div v-bind="dlg.backdropProps.value" class="ori-dialog__backdrop" />
                <div v-bind="dlg.positionerProps.value" class="ori-dialog__positioner">
                    <div v-bind="dlg.contentProps.value" class="ori-dialog__content">
                        <header class="ori-dialog__header">
                            <h2 v-bind="dlg.titleProps.value" class="ori-dialog__title">
                                <slot name="title">{{ title }}</slot>
                            </h2>
                            <button v-bind="dlg.closeTriggerProps.value" class="ori-dialog__close" aria-label="Close">
                                ×
                            </button>
                        </header>
                        <div class="ori-dialog__body">
                            <slot />
                        </div>
                    </div>
                </div>
            </template>
        </Teleport>
    </ClientOnly>
</template>

<style>
.ori-dialog__backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;

    background: rgb(0 0 0 / 0.5);
}

.ori-dialog__positioner {
    position: fixed;
    inset: 0;
    z-index: 51;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 16px;
}

.ori-dialog__content {
    width: 100%;
    max-width: 460px;
    padding: 24px;

    border-radius: 14px;

    background: var(--ori-color-surface);
    color: var(--ori-color-on-surface);
    box-shadow: 0 20px 50px rgb(0 0 0 / 0.3);
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

    background: none;
    color: inherit;

    font-size: 22px;
    line-height: 1;

    cursor: pointer;
    opacity: 0.7;
}

.ori-dialog__close:hover {
    opacity: 1;
}

.ori-dialog__body {
    font-size: 14px;
    opacity: 0.85;
}
</style>
