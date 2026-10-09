import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    useTemplateRef,
    watch,
    type ComponentPublicInstance,
    type Ref
} from 'vue'
import type { ActionSize, RadiusSize, ThemeColor, Variant } from '../../types'
import { swallowClick } from '../../internal/events'
import { useSlotPresence } from '../../internal/slot-presence'

// Supplied by the app's bundler (see NOTES.md, Build / tests).
declare const process: { env: { NODE_ENV?: string } }

interface ItemNameProps {
    ariaLabel?: string
    label?: string
    tooltip?: string
}

export interface ItemButtonProps extends ItemNameProps {
    color?: ThemeColor
    disabled: boolean
    icon?: string
    pressed?: boolean
    radius?: RadiusSize
    size?: ActionSize
    variant: Variant
}

/**
 * What OriToolbarButton and OriToolbarToggleItem share: the OriButton they render, carrying the headless
 * item's roving props, its accessible name, and a disabled state that stays focusable (WAI-ARIA toolbar
 * discoverability) yet never activates. The template refs that button as `ref="button"`.
 */
export function useItemButton<ItemProps extends object>(
    props: () => ItemButtonProps,
    itemProps: Readonly<Ref<ItemProps>>,
    component: string
) {
    const name = useItemName(props, useTemplateRef<ComponentPublicInstance>('button'), component)
    const bindings = computed(() => {
        const { color, disabled, icon, label, pressed, radius, size, variant } = props()
        return {
            ...itemProps.value,
            color,
            icon,
            label,
            radius,
            size,
            variant,
            'aria-label': name.ariaLabel.value,
            // Only a toggle button has its own pressed state; a toggle item's comes with `itemProps`.
            ...(pressed === undefined ? {} : { 'aria-pressed': pressed }),
            'aria-disabled': disabled || undefined
        }
    })
    // CSS already stops the pointer; this stops the keyboard click a focusable item still gets.
    const onClickCapture = (event: MouseEvent): void => {
        if (props().disabled) swallowClick(event)
    }
    return { bindings, describedBy: name.describedBy, onClickCapture }
}

// Text that names the element: a text node outside any `aria-hidden` subtree. An icon font's ligature
// (`<span aria-hidden="true">format_bold</span>`) is text in the DOM but not in the accessible name.
function hasReadableText(el: Node): boolean {
    const walker = el.ownerDocument?.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    for (let node = walker?.nextNode(); node; node = walker?.nextNode()) {
        if (!node.textContent?.trim()) continue
        const hidden = node.parentElement?.closest('[aria-hidden="true"]')
        if (!hidden || !el.contains(hidden)) return true
    }
    return false
}

// The accessible name of a toolbar item. The tooltip names the item only when nothing visible does: a
// tooltip that renamed a button with visible text would break WCAG 2.5.3 Label in Name (the button reads
// "Save" but answers to its tooltip). Slotted content counts as visible only if it renders text. That is
// read from the DOM: an icon component and a text component look the same before they render, and slot
// content re-renders inside the button, where this component's own update hooks never see it.
function useItemName(
    props: () => ItemNameProps,
    button: Readonly<Ref<ComponentPublicInstance | null>>,
    component: string
) {
    const slotted = useSlotPresence('default')
    // Until the first measurement (and during SSR) a filled slot is assumed to hold text.
    const slotText = ref(true)

    const visible = () => Boolean(props().label) || (slotted.default && slotText.value)
    const ariaLabel = computed(() => props().ariaLabel ?? (visible() ? undefined : props().tooltip))
    // The tooltip describes the item only when something else names it; otherwise name == description.
    const describedBy = (bubbleId: string) => (props().ariaLabel || visible() ? bubbleId : undefined)

    let observer: MutationObserver | undefined
    function observe(el: Node | undefined): void {
        observer?.disconnect()
        if (!el) return
        const measure = () => {
            slotText.value = hasReadableText(el)
        }
        measure()
        if (typeof MutationObserver === 'undefined') return
        observer = new MutationObserver(measure)
        observer.observe(el, {
            attributeFilter: ['aria-hidden'],
            characterData: true,
            childList: true,
            subtree: true
        })
    }

    const element = () => button.value?.$el as Node | undefined
    // The button is a different element when `tooltip` comes or goes (it moves into the tooltip wrapper).
    watch(element, observe, { flush: 'post' })
    onMounted(() => {
        observe(element())
        const { ariaLabel, tooltip } = props()
        if (process.env.NODE_ENV !== 'production' && !ariaLabel && !tooltip && !visible()) {
            console.warn(
                `[${component}] an item without visible text needs an accessible name — pass \`aria-label\` or \`tooltip\`.`
            )
        }
    })
    onBeforeUnmount(() => observer?.disconnect())

    return { ariaLabel, describedBy }
}
