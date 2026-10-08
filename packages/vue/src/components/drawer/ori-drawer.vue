<script lang="ts" setup>
import { computed, useId, useTemplateRef, watch } from 'vue'
import { useDismissable } from '@oriui/headless/vue'
import type { DrawerSide } from '../../types'
import { useDialogShell } from '../../internal/use-dialog-shell'

// Stray attributes (aria-label, data-*, …) go to the <dialog>, not the multi-root fragment.
defineOptions({ inheritAttrs: false })

// OriDrawer — a panel docked to one edge of the viewport, on OriDialog's engine and element. Modal (the
// default) opens the <dialog> with showModal(): backdrop, focus trap, inert page, Escape, focus return.
// Non-modal opens it as a `popover="manual"`, which keeps it in the top layer while the page stays live;
// a manual popover closes on nothing by itself, so Escape, a press outside and focus return are wired
// here. Open state, naming and the controlled / uncontrolled split: see use-dialog-shell.ts.
const {
    closeOnEscape = true,
    closeOnInteractOutside = true,
    defaultOpen = false,
    modal = true,
    // `= undefined` keeps an unbound `open` distinguishable from `:open="false"` (see OriDialog).
    open = undefined,
    side = 'end',
    title
} = defineProps<{
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    defaultOpen?: boolean
    /** Modal (the default) dims and blocks the page; non-modal leaves it live. */
    modal?: boolean
    open?: boolean
    /** The viewport edge the drawer docks to; `start` / `end` swap sides in RTL. */
    side?: DrawerSide
    title?: string
}>()

const emit = defineEmits<{
    'update:open': [open: boolean]
    close: []
}>()

const FOCUSABLE =
    'button:not(:disabled), [href], input:not(:disabled, [type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
const drawerEl = useTemplateRef<HTMLDialogElement>('drawer')
// Where focus goes back to when a non-modal drawer closes with focus inside it.
let returnTo: HTMLElement | null = null

function showNonModal(el: HTMLDialogElement): void {
    returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    // Without the Popover API a non-modal <dialog> still opens, in the page instead of the top layer.
    if (typeof el.showPopover === 'function') el.showPopover()
    else el.show()
    // show() moves focus into a dialog; showPopover() does not, so do what show() would.
    const target = el.querySelector<HTMLElement>('[autofocus]') ?? el.querySelector<HTMLElement>(FOCUSABLE)
    target?.focus()
}

function hide(el: HTMLDialogElement): void {
    const hadFocus = el.contains(document.activeElement)
    if (el.open) el.close()
    else el.hidePopover?.()
    if (!modal && hadFocus) returnTo?.focus()
}

const { dlg, bindings, hasTitle } = useDialogShell(
    () => ({ closeOnEscape, closeOnInteractOutside, defaultOpen, modal, open, title }),
    emit,
    drawerEl,
    {
        show: (el, isModal) => (isModal ? el.showModal() : showNonModal(el)),
        hide,
        isShown: (el) => el.open || (typeof el.showPopover === 'function' && el.matches(':popover-open'))
    },
    'OriDrawer',
    false
)

// The trigger toggles: a non-modal drawer leaves it reachable, and pressing it again should close. The
// data attribute finds it for outside-press dismissal without taking over the caller's own `id`.
const triggerKey = useId()
const triggerProps = computed(() => ({
    ...dlg.triggerProps.value,
    onClick: () => dlg.toggle(),
    'data-ori-drawer-trigger': triggerKey
}))
const triggerEl = () => document.querySelector<HTMLElement>(`[data-ori-drawer-trigger="${triggerKey}"]`)

// Non-modal dismissal. A press outside closes (the trigger excepted, so its click can toggle). Escape
// closes unless another component took it (a menu or a combobox inside), or it was meant for another
// layer: a dialog on top, or a popover open inside the drawer, which closes itself without saying so.
useDismissable(() => ({
    enabled: dlg.open.value && !modal && closeOnInteractOutside,
    elements: () => [drawerEl.value, triggerEl()],
    onDismiss: () => dlg.setOpen(false),
    pointerDownOutside: true
}))

function onEscape(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.defaultPrevented) return
    const owner = event.target instanceof Element ? event.target.closest('dialog') : null
    if (owner && owner !== drawerEl.value) return
    // The popover's own Escape handling runs after this listener, so it is still open here.
    if (drawerEl.value?.querySelector(':popover-open')) return
    dlg.setOpen(false)
}

watch(
    () => dlg.open.value && !modal && closeOnEscape,
    (listen, _, onCleanup) => {
        if (!listen || typeof document === 'undefined') return
        document.addEventListener('keydown', onEscape)
        onCleanup(() => document.removeEventListener('keydown', onEscape))
    },
    { immediate: true }
)
</script>

<template>
    <slot name="trigger" :props="triggerProps" :open="dlg.open.value"></slot>

    <dialog
        ref="drawer"
        v-bind="{ ...bindings(), ...(modal ? {} : { popover: 'manual' }) }"
        :class="['ori-drawer', `ori-drawer_${side}`]"
    >
        <div class="ori-drawer__content">
            <header class="ori-drawer__header">
                <h2 v-if="hasTitle()" v-bind="dlg.titleProps.value" class="ori-drawer__title">
                    <slot name="title">{{ title }}</slot>
                </h2>
                <button v-bind="dlg.closeTriggerProps.value" type="button" class="ori-drawer__close" aria-label="Close">
                    ×
                </button>
            </header>
            <div v-bind="dlg.descriptionProps.value" class="ori-drawer__body">
                <slot></slot>
            </div>
            <footer v-if="$slots.footer" class="ori-drawer__footer">
                <slot name="footer"></slot>
            </footer>
        </div>
    </dialog>
</template>
