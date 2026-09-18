import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue'
import type { ComboboxItem, ComboboxOptionState, MenuItem, MenuItemState } from '../core'

export interface UseDisclosureOptions {
    id?: string
    defaultOpen?: boolean
    disabled?: boolean
}

/** The shape a component consumes, regardless of which engine produced it. */
export interface DisclosureControl {
    open: ComputedRef<boolean>
    rootProps: ComputedRef<Record<string, unknown>>
    triggerProps: ComputedRef<Record<string, unknown>>
    contentProps: ComputedRef<Record<string, unknown>>
    setOpen(open: boolean): void
    toggle(): void
}

/**
 * A headless behavior implementation. Swap freely: our native `../core` one, a Zag-backed
 * one, or a user-supplied one — the component markup never changes.
 */
export type DisclosureAdapter = (options?: MaybeRefOrGetter<UseDisclosureOptions>) => DisclosureControl

export interface UseDialogOptions {
    id?: string
    defaultOpen?: boolean
    modal?: boolean
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    onOpenChange?: (open: boolean) => void
}

/**
 * A modal/dialog control built around the native `<dialog>` element: the component renders a real
 * `<dialog>` and drives `showModal()` / `close()` from `open`, so the platform supplies the focus
 * trap, `Esc`, `::backdrop`, top-layer and `inert`-on-rest. The adapter owns only the open state and
 * the ARIA prop bags — `dialogProps` carries the `<dialog>`'s own attributes plus the `close` /
 * `cancel` / backdrop-click handlers that keep `open` in sync.
 */
export interface DialogControl {
    open: ComputedRef<boolean>
    setOpen(open: boolean): void
    toggle(): void
    triggerProps: ComputedRef<Record<string, unknown>>
    dialogProps: ComputedRef<Record<string, unknown>>
    titleProps: ComputedRef<Record<string, unknown>>
    descriptionProps: ComputedRef<Record<string, unknown>>
    closeTriggerProps: ComputedRef<Record<string, unknown>>
}

export type DialogAdapter = (options?: MaybeRefOrGetter<UseDialogOptions>) => DialogControl

export interface UseComboboxOptions {
    /** Stable base id; auto-generated via `useId` when omitted. */
    id?: string
    /** The full option list. Reactive — filtering re-runs when it changes. */
    options: ComboboxItem[]
    /** Initial selected value. */
    value?: string | null
    /** Initial input text. */
    inputValue?: string
    disabled?: boolean
    /** Filter predicate; default = case-insensitive substring on the label. */
    filter?: (item: ComboboxItem, query: string) => boolean
}

/**
 * The shape a combobox UI consumes, regardless of which engine (native core / Zag / custom) produced it.
 *
 * The prop bags are typed as opaque records, but `OriCombobox` reaches inside two of them, so a
 * replacement adapter MUST emit these keys — miss one and the component degrades silently, with no error
 * and no warning:
 *
 * - `inputProps.id` — becomes the visible input's `id` (standalone, i.e. outside an `OriField`) and the
 *   stem of the generated hint / error ids. Missing → the input has no id, the label's `for` dangles and
 *   `aria-describedby` points at `"undefined-hint"`.
 * - `labelProps.id` — names the popup: the component copies it to the listbox's `aria-labelledby`.
 *   Missing → the listbox has no accessible name.
 * - `labelProps.for` — must equal `inputProps.id`, since the two are rendered onto different elements.
 *
 * `tests/headless-contract-requirements.test.ts` drives OriCombobox from an adapter written from scratch
 * (never spreading `nativeCombobox`) and fails if this list stops being sufficient.
 */
export interface ComboboxControl {
    open: ComputedRef<boolean>
    value: ComputedRef<string | null>
    inputValue: ComputedRef<string>
    highlightedValue: ComputedRef<string | null>
    /** The currently visible (filtered) items — drives navigation + the active-descendant id. */
    items: ComputedRef<ComboboxItem[]>
    rootProps: ComputedRef<Record<string, unknown>>
    labelProps: ComputedRef<Record<string, unknown>>
    controlProps: ComputedRef<Record<string, unknown>>
    inputProps: ComputedRef<Record<string, unknown>>
    triggerProps: ComputedRef<Record<string, unknown>>
    clearTriggerProps: ComputedRef<Record<string, unknown>>
    listboxProps: ComputedRef<Record<string, unknown>>
    getOptionProps(item: ComboboxItem, index: number): Record<string, unknown>
    getOptionState(item: ComboboxItem): ComboboxOptionState
    setOpen(open: boolean): void
    setInputValue(next: string): void
    select(item: ComboboxItem): void
    clear(): void
}

export type ComboboxAdapter = (options: MaybeRefOrGetter<UseComboboxOptions>) => ComboboxControl

export interface UseMenuOptions {
    /** Stable base id; auto-generated via `useId` when omitted. */
    id?: string
    /** The menu items, in render order. Reactive — navigation re-syncs when it changes. */
    items: MenuItem[]
    disabled?: boolean
    /** Fired when an item is activated (click / Enter / Space). The menu then closes. */
    onSelect?: (value: string) => void
}

/**
 * The shape a menu UI consumes, regardless of which engine produced it.
 *
 * The prop bags are typed as opaque records, but `OriMenu` reaches inside them to do the two things a
 * framework-agnostic projection cannot do itself — move real DOM focus, and hand it back. A replacement
 * adapter MUST therefore emit these keys; miss one and the component degrades silently, with no error and
 * no warning:
 *
 * - `triggerProps.id` — the component resolves the trigger via `document.getElementById` to return focus
 *   when the menu closes. Missing → focus is stranded inside the closed menu.
 * - `data-highlighted` on the highlighted item's bag only (any value, `''` by convention) — the component
 *   finds the item to focus with `querySelector('[data-highlighted]')`. Missing → roving focus never moves.
 * - `tabindex` on the item bags — `0` on the highlighted item, `-1` on the rest (roving tabindex). Items
 *   render as `<div>`s, so without a tabindex the `.focus()` above is a no-op in a real browser.
 * - `contentProps.tabindex` — `-1`, so the panel itself can take focus on open while nothing is highlighted.
 *
 * `tests/headless-contract-requirements.test.ts` drives OriMenu from an adapter written from scratch
 * (never spreading `nativeMenu`) and fails if this list stops being sufficient.
 */
export interface MenuControl {
    open: ComputedRef<boolean>
    highlightedValue: ComputedRef<string | null>
    items: ComputedRef<MenuItem[]>
    triggerProps: ComputedRef<Record<string, unknown>>
    contentProps: ComputedRef<Record<string, unknown>>
    separatorProps: ComputedRef<Record<string, unknown>>
    getItemProps(item: MenuItem, index: number): Record<string, unknown>
    getItemState(item: MenuItem): MenuItemState
    setOpen(open: boolean): void
    highlight(value: string | null): void
    highlightFirst(): void
    highlightLast(): void
}

export type MenuAdapter = (options: MaybeRefOrGetter<UseMenuOptions>) => MenuControl

/**
 * The set of behaviors an app can swap. Every entry is optional — an omitted one falls back to the
 * built-in native (`../core`) adapter, so a component works with no configuration and an app can
 * replace one behavior (a Zag-backed or custom engine) without touching component markup.
 */
export interface HeadlessAdapters {
    disclosure?: DisclosureAdapter
    dialog?: DialogAdapter
    combobox?: ComboboxAdapter
    menu?: MenuAdapter
}

/**
 * Injection key the resolver reads; set by the OriHeadless plugin / provideHeadless().
 *
 * `Symbol.for`, not `Symbol`: when npm cannot dedupe this package (a transitive duplicate, two lockfile
 * entries, an exact pin that blocks hoisting) each copy evaluates its own module scope. A plain `Symbol`
 * would give them different keys, so a `provide` from one copy would be invisible to an `inject` from the
 * other — silently, with the component falling back to the native engine. The registry key interns.
 *
 * The `@1` is the MAJOR this contract shape belongs to, and must be bumped with the major. The registry
 * is global and cross-realm, so an unversioned key would also intern across majors — during an
 * incremental v1 -> v2 migration a v2 provider would satisfy a v1 `inject` with a shape it was never
 * typed against. Versioning keeps undeduped copies of ONE major interoperable (the case this fixes) and
 * lets two majors coexist by missing each other, which is the safe direction: a miss falls back.
 */
export const ORI_HEADLESS: InjectionKey<HeadlessAdapters> = Symbol.for('ori-headless@1')
