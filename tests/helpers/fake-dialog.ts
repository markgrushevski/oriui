import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue';
import type { DialogControl, UseDialogOptions } from '@oriui/vue';

/**
 * A minimal in-memory DialogAdapter conforming to oriUI's headless contract WITHOUT Zag. It emits
 * the same accessible prop shape (role="dialog", aria-modal, aria-labelledby wired to the title id,
 * open/close handlers) so OriDialog can be unit-tested against the *contract* rather than a specific
 * engine — exactly the swappability the layered design promises. The real focus-trap / scroll-lock
 * behavior is Zag's job and is exercised in the docs app, not here.
 */
export function fakeDialog(options?: MaybeRefOrGetter<UseDialogOptions>): DialogControl {
    const opts = computed(() => toValue(options) ?? {});
    const open = ref(opts.value.defaultOpen ?? false);
    const id = opts.value.id ?? 'test-dialog';
    const empty = computed(() => ({}));

    function setOpen(value: boolean): void {
        open.value = value;
        opts.value.onOpenChange?.(value);
    }

    return {
        open: computed(() => open.value),
        setOpen,
        triggerProps: computed(() => ({
            'aria-haspopup': 'dialog',
            'aria-expanded': open.value,
            onClick: () => setOpen(true)
        })),
        backdropProps: computed(() => ({ onClick: () => setOpen(false) })),
        positionerProps: empty,
        contentProps: computed(() => ({
            role: 'dialog',
            'aria-modal': opts.value.modal === false ? undefined : 'true',
            'aria-labelledby': `${id}-title`
        })),
        titleProps: computed(() => ({ id: `${id}-title` })),
        descriptionProps: computed(() => ({ id: `${id}-desc` })),
        closeTriggerProps: computed(() => ({ onClick: () => setOpen(false) }))
    };
}
