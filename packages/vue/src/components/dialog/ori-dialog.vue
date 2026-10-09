<script lang="ts" setup>
import { useTemplateRef } from 'vue'
import { useDialogShell } from '../../internal/use-dialog-shell'

// Forward stray attributes (aria-label, data-*, @click, …) to the <dialog>, not the multi-root
// fragment — the dialog is the meaningful element, matching the other controls. (Without this, a
// consumer's aria-label would warn + be dropped, so a titleless dialog could never be named.)
defineOptions({ inheritAttrs: false })

// OriDialog — styled markup + tokens over the engine-agnostic useDialog() contract, rendered on the
// native <dialog> element. The focus trap, Escape, ::backdrop and focus-return come from showModal(), and
// dialog.css locks the page scroll that showModal() leaves on — no JS state machine and no adapter to
// wire (useDialog defaults to the native engine). The OriHeadless contract still lets an app swap a
// custom dialog adapter; the markup never changes. Open state and naming: see use-dialog-shell.ts.
const {
    closeLabel = 'Close',
    closeOnEscape = true,
    closeOnInteractOutside = true,
    defaultOpen = false,
    modal = true,
    // `= undefined` is load-bearing: Vue coerces an ABSENT boolean prop to `false`, which would make
    // uncontrolled usage indistinguishable from a controlled `:open="false"`. An explicit default
    // opts out of that coercion so an unbound `open` stays `undefined` — the "uncontrolled" signal.
    open = undefined,
    title
} = defineProps<{
    /** The accessible name of the × button. */
    closeLabel?: string
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    defaultOpen?: boolean
    modal?: boolean
    open?: boolean
    title?: string
}>()

const emit = defineEmits<{
    'update:open': [open: boolean]
    close: []
}>()

const { dlg, bindings, hasTitle } = useDialogShell(
    () => ({ closeOnEscape, closeOnInteractOutside, defaultOpen, modal, open, title }),
    emit,
    useTemplateRef<HTMLDialogElement>('dialog'),
    {
        show: (el, isModal) => (isModal ? el.showModal() : el.show()),
        hide: (el) => el.close(),
        isShown: (el) => el.open
    },
    'OriDialog'
)
</script>

<template>
    <slot name="trigger" :props="dlg.triggerProps.value" :open="dlg.open.value"></slot>

    <dialog ref="dialog" v-bind="bindings()" class="ori-dialog">
        <div class="ori-dialog__content">
            <header class="ori-dialog__header">
                <h2 v-if="hasTitle()" v-bind="dlg.titleProps.value" class="ori-dialog__title">
                    <slot name="title">{{ title }}</slot>
                </h2>
                <button
                    v-bind="dlg.closeTriggerProps.value"
                    type="button"
                    class="ori-dialog__close"
                    :aria-label="closeLabel"
                >
                    ×
                </button>
            </header>
            <div v-bind="dlg.descriptionProps.value" class="ori-dialog__body">
                <slot></slot>
            </div>
        </div>
    </dialog>
</template>
