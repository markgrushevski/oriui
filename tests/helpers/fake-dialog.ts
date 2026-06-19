import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue';
import type { DialogControl, UseDialogOptions } from '@oriui/headless/vue';

/**
 * A minimal in-memory DialogAdapter conforming to oriUI's headless contract, used to prove the
 * `OriHeadless` swap still works for dialogs even though the native `<dialog>` engine is the default.
 * It emits the same accessible prop shape (role="dialog", aria-modal, aria-labelledby wired to the
 * title id, open/close handlers) but with a FIXED base id, so a test can tell the swapped adapter —
 * not the native default — produced the props. The component still owns the `<dialog>` element and
 * drives showModal()/close() from `open`, so this fake needs no DOM behaviour of its own.
 */
export function fakeDialog(options?: MaybeRefOrGetter<UseDialogOptions>): DialogControl {
    const opts = computed(() => toValue(options) ?? {});
    const open = ref(opts.value.defaultOpen ?? false);
    const id = opts.value.id ?? 'test-dialog';

    function setOpen(value: boolean): void {
        if (open.value === value) return;
        open.value = value;
        opts.value.onOpenChange?.(value);
    }

    return {
        open: computed(() => open.value),
        setOpen,
        toggle: () => setOpen(!open.value),
        triggerProps: computed(() => ({
            'aria-haspopup': 'dialog',
            'aria-expanded': open.value,
            onClick: () => setOpen(true)
        })),
        dialogProps: computed(() => ({
            role: 'dialog',
            'aria-modal': opts.value.modal === false ? undefined : 'true',
            'aria-labelledby': `${id}-title`,
            onClose: () => setOpen(false)
        })),
        titleProps: computed(() => ({ id: `${id}-title` })),
        descriptionProps: computed(() => ({ id: `${id}-desc` })),
        closeTriggerProps: computed(() => ({ onClick: () => setOpen(false) }))
    };
}
