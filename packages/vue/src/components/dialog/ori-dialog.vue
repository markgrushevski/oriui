<script lang="ts" setup>
import { computed, mergeProps, useAttrs, useSlots, useTemplateRef, watch, watchPostEffect } from 'vue';
import { useDialog } from '@oriui/headless/vue';

// Forward stray attributes (aria-label, data-*, @click, …) to the <dialog>, not the multi-root
// fragment — the dialog is the meaningful element, matching the other controls. (Without this, a
// consumer's aria-label would warn + be dropped, so a titleless dialog could never be named.)
defineOptions({ inheritAttrs: false });

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

// Accessible name. The adapter's `aria-labelledby` points at the <h2>, but that <h2> would be EMPTY
// when no `title` / `#title` is given — a dialog "labelled" by an empty node (an AT announces an empty
// name). So render the <h2> only when there IS a title; without one the labelledby becomes a dangling
// reference the browser ignores, and a consumer `aria-label` (merged from $attrs) names the dialog
// instead. The adapter's props are still applied verbatim (adapter transparency), just merged after
// $attrs so the dialog's own a11y wins.
const slots = useSlots();
const attrs = useAttrs();
const hasTitle = computed(() => Boolean(title) || Boolean(slots.title));
const dialogBindings = computed(() => mergeProps(attrs, dlg.dialogProps.value));

if (import.meta.env.DEV) {
    watchPostEffect(() => {
        if (dlg.open.value && !hasTitle.value && !attrs['aria-label'] && !attrs['aria-labelledby']) {
            console.warn(
                '[OriDialog] opened without an accessible name — pass a `title`, a #title slot, or an `aria-label`.'
            );
        }
    });
}
</script>

<template>
    <slot name="trigger" :props="dlg.triggerProps.value" :open="dlg.open.value"></slot>

    <dialog ref="dialog" v-bind="dialogBindings" class="ori-dialog">
        <div class="ori-dialog__content">
            <header class="ori-dialog__header">
                <h2 v-if="hasTitle" v-bind="dlg.titleProps.value" class="ori-dialog__title">
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
