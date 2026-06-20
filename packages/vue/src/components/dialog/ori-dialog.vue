<script lang="ts" setup>
import { useTemplateRef, watchPostEffect } from 'vue';
import { useDialog } from '@oriui/headless/vue';

// OriDialog — the library's first behavioral styled component: styled markup + tokens over the
// engine-agnostic useDialog() contract, rendered on the native <dialog> element. The focus trap,
// scroll lock, Escape, ::backdrop and focus-return all come from showModal() — no JS state machine
// and no adapter to wire (useDialog defaults to the native engine). The OriHeadless contract still
// lets an app swap a custom dialog adapter; the markup never changes.
const {
    closeOnEscape = true,
    closeOnInteractOutside = true,
    defaultOpen = false,
    modal = true,
    title
} = defineProps<{
    closeOnEscape?: boolean;
    closeOnInteractOutside?: boolean;
    defaultOpen?: boolean;
    modal?: boolean;
    title?: string;
}>();

const dlg = useDialog(() => ({ closeOnEscape, closeOnInteractOutside, defaultOpen, modal }));

// Drive the platform <dialog> from reactive open state. `flush: 'post'` runs after the element is in
// the DOM, so it also covers `defaultOpen` on first mount. Guards keep showModal()/close() idempotent
// (showModal throws if already open; close is a no-op when closed).
const dialogEl = useTemplateRef<HTMLDialogElement>('dialog');
watchPostEffect(() => {
    const el = dialogEl.value;
    if (!el) return;
    if (dlg.open.value && !el.open) {
        if (modal) el.showModal();
        else el.show();
    } else if (!dlg.open.value && el.open) {
        el.close();
    }
});
</script>

<template>
    <slot name="trigger" :props="dlg.triggerProps.value" :open="dlg.open.value"></slot>

    <dialog ref="dialog" v-bind="dlg.dialogProps.value" class="ori-dialog">
        <div class="ori-dialog__content">
            <header class="ori-dialog__header">
                <h2 v-bind="dlg.titleProps.value" class="ori-dialog__title">
                    <slot name="title">{{ title }}</slot>
                </h2>
                <button v-bind="dlg.closeTriggerProps.value" type="button" class="ori-dialog__close" aria-label="Close">
                    ×
                </button>
            </header>
            <div class="ori-dialog__body">
                <slot></slot>
            </div>
        </div>
    </dialog>
</template>
