import type { ComboboxItem } from './combobox'
import type { MenuItem } from './menu'

/**
 * The option shapes behind the four swappable behaviours, declared once. Every member is
 * framework-neutral; only how an adapter wraps them differs (`MaybeRefOrGetter` in Vue, `MaybeReactive`
 * in Svelte, per render in React). `tests/adapter-parity.test.ts` pins each adapter to these at compile
 * time. Exported from `@oriui/headless` for anyone writing their own adapter.
 */

export interface UseDisclosureOptions {
    /** Stable base id; the adapter auto-generates an SSR-safe one when omitted. */
    id?: string
    /** Uncontrolled initial open state (init-only — later changes do not re-open). */
    defaultOpen?: boolean
    /** Live: re-read after creation. A disabled disclosure ignores its trigger but does NOT close. */
    disabled?: boolean
}

export interface UseDialogOptions {
    /** Stable base id; the adapter auto-generates an SSR-safe one when omitted. */
    id?: string
    /** Uncontrolled initial open state (init-only). */
    defaultOpen?: boolean
    /** `showModal()` (default) vs `show()` — the platform supplies the focus trap only for modal. */
    modal?: boolean
    /** Whether the platform `cancel` (Esc) closes it (default true). */
    closeOnEscape?: boolean
    /** Whether a backdrop click closes it (default true). */
    closeOnInteractOutside?: boolean
    /** Fired on every open-state change, whoever caused it (trigger, Esc, backdrop, `setOpen`). */
    onOpenChange?: (open: boolean) => void
}

export interface UseComboboxOptions {
    /** Stable base id; the adapter auto-generates an SSR-safe one when omitted. */
    id?: string
    /** The full option list. Live — filtering re-runs when it changes. */
    options: ComboboxItem[]
    /** Uncontrolled initial selected value (init-only). */
    value?: string | null
    /** Uncontrolled initial input text (init-only). */
    inputValue?: string
    /** Live: re-read after creation. */
    disabled?: boolean
    /** Filter predicate; default = case-insensitive substring on the label. */
    filter?: (item: ComboboxItem, query: string) => boolean
}

export interface UseMenuOptions {
    /** Stable base id; the adapter auto-generates an SSR-safe one when omitted. */
    id?: string
    /** The menu items, in render order. Live — navigation re-syncs when it changes. */
    items: MenuItem[]
    /** Live: re-read after creation. */
    disabled?: boolean
    /** Fired when an item is activated (click / Enter / Space). The menu then closes. */
    onSelect?: (value: string) => void
}
