import { computed, mergeProps, useAttrs, useSlots, watch, watchPostEffect, type Ref } from 'vue'
import { useDialog } from '@oriui/headless/vue'
import { DEV } from './dev'

export interface DialogShellProps {
    closeOnEscape: boolean
    closeOnInteractOutside: boolean
    defaultOpen: boolean
    modal: boolean
    open: boolean | undefined
    title: string | undefined
}

// How a component puts its <dialog> on screen and takes it off: OriDialog calls showModal() / show(),
// OriDrawer showModal() / showPopover(). `isShown` reads the element, so state and DOM never drift.
export interface DialogPresenter {
    show(el: HTMLDialogElement, modal: boolean): void
    hide(el: HTMLDialogElement): void
    isShown(el: HTMLDialogElement): boolean
}

// What OriDialog and OriDrawer share: dual-mode open state over useDialog, the <dialog> element driven
// from it, and an accessible name and description that never point at an empty node. `describeByBody`
// makes the body the description: right for a dialog's short message, wrong for a drawer of filters or
// navigation, which a screen reader would then read out whole on open.
//
// Open state is dual-mode. Bind `v-model:open` to drive it from the host; omit the binding and use
// `defaultOpen` + the #trigger slot for a self-contained one. Either way `update:open` fires on every
// open/close and `close` on each close. Controlled mode is notify-only: a user-initiated close (Esc,
// backdrop, ×) closes the element and THEN emits; a host cannot veto it by ignoring the event.
export function useDialogShell(
    props: () => DialogShellProps,
    emit: { (event: 'update:open', open: boolean): void; (event: 'close'): void },
    element: Readonly<Ref<HTMLDialogElement | null>>,
    presenter: DialogPresenter,
    component: string,
    describeByBody = true
) {
    const p = computed(props)

    // `open ?? defaultOpen` seeds the initial state: a controlled `:open` wins, else the default.
    const dlg = useDialog(() => ({
        closeOnEscape: p.value.closeOnEscape,
        closeOnInteractOutside: p.value.closeOnInteractOutside,
        defaultOpen: p.value.open ?? p.value.defaultOpen,
        modal: p.value.modal,
        onOpenChange: (value: boolean) => {
            emit('update:open', value)
            if (!value) emit('close')
        }
    }))

    // Controlled mode: mirror a bound `open` into the adapter. setOpen() no-ops on an equal value, so the
    // emit → v-model → prop round-trip settles without a loop. Unbound, `open` stays undefined.
    watch(
        () => p.value.open,
        (value) => {
            if (value !== undefined) dlg.setOpen(value)
        }
    )

    // Drive the element from reactive state. `flush: 'post'` runs once it is in the DOM, so it also covers
    // `defaultOpen` on first mount; the guards keep showing and hiding idempotent.
    watchPostEffect(() => {
        const el = element.value
        if (!el) return
        const shown = presenter.isShown(el)
        if (dlg.open.value && !shown) presenter.show(el, p.value.modal)
        else if (!dlg.open.value && shown) presenter.hide(el)
    })

    // Accessible name. The adapter's `aria-labelledby` points at the title, which is rendered only when
    // there is one. Without a title it is dropped, so it can neither dangle nor override a caller's own
    // `aria-labelledby`; a caller's `aria-label` names the element then. The body is the description
    // only when there is body content and the caller set none.
    const slots = useSlots()
    const attrs = useAttrs()
    // Functions, not computeds: `useSlots()` is not reactive, so a computed would cache a slot's absence and
    // miss a #title or a body that appears later. They run on every render instead.
    const hasTitle = () => Boolean(p.value.title) || Boolean(slots.title)
    const describedBy = () =>
        describeByBody && slots.default && !attrs['aria-describedby']
            ? (dlg.descriptionProps.value.id as string)
            : undefined
    const bindings = () => {
        const { 'aria-labelledby': labelledBy, ...own } = dlg.dialogProps.value
        return mergeProps(
            attrs,
            own,
            hasTitle() ? { 'aria-labelledby': labelledBy } : {},
            describedBy() ? { 'aria-describedby': describedBy() } : {}
        )
    }

    if (DEV) {
        watchPostEffect(() => {
            if (dlg.open.value && !hasTitle() && !attrs['aria-label'] && !attrs['aria-labelledby']) {
                console.warn(
                    `[${component}] opened without an accessible name — pass a \`title\`, a #title slot, or an \`aria-label\`.`
                )
            }
        })
    }

    return { dlg, bindings, hasTitle }
}
