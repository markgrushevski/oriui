import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch, type ComponentPublicInstance, type Ref } from 'vue'

interface ItemNameProps {
    ariaLabel?: string
    label?: string
    tooltip?: string
}

// The accessible name of a toolbar item. The tooltip names the item only when nothing visible does: a
// tooltip that renamed a button with visible text would break WCAG 2.5.3 Label in Name (the button reads
// "Save" but answers to its tooltip). Slotted content counts as visible only if it renders text. That is
// read from the DOM: an icon component and a text component look the same before they render, and slot
// content re-renders inside the button, where this component's own update hooks never see it.
export function useItemName(
    props: () => ItemNameProps,
    button: Readonly<Ref<ComponentPublicInstance | null>>,
    component: string
) {
    const slots = useSlots()
    // Until the first measurement (and during SSR) a filled slot is assumed to hold text.
    const slotText = ref(true)

    const visible = () => Boolean(props().label) || (Boolean(slots.default) && slotText.value)
    const ariaLabel = computed(() => props().ariaLabel ?? (visible() ? undefined : props().tooltip))
    // The tooltip describes the item only when something else names it; otherwise name == description.
    const describedBy = (bubbleId: string) => (props().ariaLabel || visible() ? bubbleId : undefined)

    let observer: MutationObserver | undefined
    function observe(el: Node | undefined): void {
        observer?.disconnect()
        if (!el) return
        const measure = () => {
            slotText.value = Boolean(el.textContent?.trim())
        }
        measure()
        if (typeof MutationObserver === 'undefined') return
        observer = new MutationObserver(measure)
        observer.observe(el, { childList: true, characterData: true, subtree: true })
    }

    const element = () => button.value?.$el as Node | undefined
    // The button is a different element when `tooltip` comes or goes (it moves into the tooltip wrapper).
    watch(element, observe, { flush: 'post' })
    onMounted(() => {
        observe(element())
        const { ariaLabel, tooltip } = props()
        if (import.meta.env?.DEV && !ariaLabel && !tooltip && !visible()) {
            console.warn(
                `[${component}] an item without visible text needs an accessible name — pass \`aria-label\` or \`tooltip\`.`
            )
        }
    })
    onBeforeUnmount(() => observer?.disconnect())

    return { ariaLabel, describedBy }
}
