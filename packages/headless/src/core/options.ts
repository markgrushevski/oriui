import type { ComboboxItem } from './combobox'
import type { MenuItem } from './menu'

/**
 * The option shapes behind the four swappable behaviours, declared ONCE.
 *
 * Every member here is framework-neutral — strings, booleans, item arrays, plain callbacks — yet each of
 * `{vue,svelte,react}/contract.ts` re-declared the whole set, with nothing holding the copies together
 * (ISSUES-INNER ORI-I-07). Only the CONTROL shapes legitimately differ per framework (`ComputedRef` vs
 * `Readable` vs plain values), and so does the way an adapter takes its options — Vue wraps them in
 * `MaybeRefOrGetter`, Svelte in `MaybeReactive`, React passes them per render. That wrapping is the
 * adapter's job; the members inside it are these.
 *
 * `tests/adapter-parity.test.ts` pins each adapter's declaration to these bidirectionally, so a member
 * added, renamed or re-typed on one side is a `npm run test:types` failure naming the two interfaces —
 * not a review item. The same types are exported from `@oriui/headless` for anyone writing their own
 * adapter against the contract.
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
