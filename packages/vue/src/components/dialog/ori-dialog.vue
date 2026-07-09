<script lang="ts" setup>
import { useTemplateRef, watch, watchPostEffect } from 'vue';
import { useDialog } from '@oriui/headless/vue';

// OriDialog — the library's first behavioral styled component: styled markup + tokens over the
// engine-agnostic useDialog() contract, rendered on the native <dialog> element. The focus trap,
// scroll lock, Escape, ::backdrop and focus-return all come from showModal() — no JS state machine
// and no adapter to wire (useDialog defaults to the native engine). The OriHeadless contract still
// lets an app swap a custom dialog adapter; the markup never changes.
//
// Open state is dual-mode. Bind `v-model:open` to drive it from the host (a `confirmOpen` ref);
// omit the binding and use `defaultOpen` + the #trigger slot for a self-contained dialog. Either
// way `update:open` fires on every open/close and `close` fires on each close, so a host can react
// (run an action, restore state) without owning the open state.
//
// Controlled mode is OPTIMISTIC (notify-only): a user-initiated close (Esc/backdrop/×) mutates the
// state and closes the box, THEN emits — the host can't veto by ignoring the event (a native
// <dialog> can't be held open, and Esc is non-vetoable bar `closeOnEscape=false`). A controlled host
// must treat update:open/close as authoritative and mirror them, or its ref drifts from the DOM.
const {
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
    closeOnEscape?: boolean;
    closeOnInteractOutside?: boolean;
    defaultOpen?: boolean;
    modal?: boolean;
    open?: boolean;
    title?: string;
}>();

const emit = defineEmits<{
    'update:open': [open: boolean];
    close: [];
}>();

// `open ?? defaultOpen` seeds the initial state: a controlled `:open` wins, else the uncontrolled
// default. onOpenChange mirrors every transition back out — `update:open` for v-model, plus `close`
// on each close — regardless of who initiated it (trigger, Esc, backdrop, the × button, or the host).
const dlg = useDialog(() => ({
    closeOnEscape,
    closeOnInteractOutside,
    defaultOpen: open ?? defaultOpen,
    modal,
    onOpenChange: (value: boolean) => {
        emit('update:open', value);
        if (!value) emit('close');
    }
}));

// Controlled mode: mirror a bound `open` prop into the adapter. setOpen() no-ops when the value
// already matches, so the emit → v-model → prop → watch round-trip settles without a loop. When no
// `:open` is bound the prop stays undefined and this watch is inert (uncontrolled / trigger-driven).
watch(
    () => open,
    (value) => {
        if (value !== undefined) dlg.setOpen(value);
    }
);

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
