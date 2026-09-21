import { inject, provide, type InjectionKey, type Ref } from 'vue'
import type { ThemeColor } from '../../types'

/**
 * PROTOTYPE (poc/compound-tabs) — the registry a compound Tabs needs and the array API does not.
 *
 * The array API resolves everything synchronously from `tabs`: ids from the index, the selection from
 * the list, the roving order from the list. A compound root knows none of that until its children run
 * their own setup, so the children must register themselves and the root must answer questions about a
 * set it does not own. This file is that seam, and its cost is the thing being measured.
 */
export interface CompoundTabsContext {
    /** Registration order === render order === DOM order; returns nothing, the value IS the identity. */
    register(value: string | number, disabled: boolean): void
    unregister(value: string | number): void
    selected: Readonly<Ref<string | number | undefined>>
    select(value: string | number): void
    /** Ids derive from the VALUE, not the index — a child does not know its index at setup. */
    tabId(value: string | number): string
    panelId(value: string | number): string
    orientation: Readonly<Ref<'horizontal' | 'vertical'>>
    color: Readonly<Ref<ThemeColor>>
    label: Readonly<Ref<string | undefined>>
}

export const COMPOUND_TABS: InjectionKey<CompoundTabsContext> = Symbol.for('ori.tabs.compound@1')

export const provideCompoundTabs = (ctx: CompoundTabsContext): void => provide(COMPOUND_TABS, ctx)

/** Children are meaningless outside a root, so this throws rather than degrading silently. */
export function useCompoundTabs(who: string): CompoundTabsContext {
    const ctx = inject(COMPOUND_TABS, null)
    if (!ctx) throw new Error(`[${who}] must be used inside <OriTabs>.`)
    return ctx
}
