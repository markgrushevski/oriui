import { useCallback, useId, type KeyboardEvent } from 'react'
import { resolveRovingIndex, rovingIntent, textDirection, type TabItem, type UseTabsOptions } from '../core'

/**
 * Headless WAI-ARIA Tabs (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/, **automatic activation**) — the
 * React twin of the Vue / Svelte `useTabs`, sharing the pure index/key math in `../core/roving`.
 * Data-driven (you pass the `tabs` array plus the selected value), so — unlike the compositional
 * `useToolbar` — there is no context and no machine, just React state/ids over the shared roving helpers.
 * Prop bags carry React-native casing directly (`onClick` / `onKeyDown` / `tabIndex`), so they need no
 * `normalizeProps` pass. Automatic activation = arrows move focus AND select; the tablist owns one keydown
 * handler that resolves the target tab by live DOM order, skipping disabled tabs.
 *
 * (This block documents the module. It deliberately sits on the type-only re-export below rather than on
 * `useTabs` itself: the adapter bundles ship their comments, and size-limit measures them — a doc moved
 * onto a runtime export is ~0.3 kB of budget for bytes every consumer's minifier then throws away.)
 */

/** The shared core declarations, re-exported so both stay importable from this adapter. */
export type { TabItem, UseTabsOptions }

export function useTabs(options: UseTabsOptions) {
    const { tabs, value, orientation = 'horizontal', dir, label, labelledby, idBase, onChange } = options

    // `useId()` is SSR-stable; strip the colons React wraps ids in so the derived ids stay valid selectors.
    const autoId = useId().replace(/:/g, '')
    const base = idBase ?? autoId

    // The effective selection: the bound value when it points at a real, enabled tab; otherwise recover to
    // the first enabled tab (so a panel is always valid without forcing the caller to seed the value).
    const firstEnabled = tabs.find((tab) => !tab.disabled)?.value
    const current = value != null ? tabs.find((tab) => tab.value === value) : undefined
    const selectedValue = current && !current.disabled ? value : firstEnabled

    const select = useCallback(
        (tab: TabItem): void => {
            if (!tab.disabled) onChange?.(tab.value)
        },
        [onChange]
    )

    // Bound once on the tablist → currentTarget IS the tablist; the focused tab is event.target. Resolve
    // the target by live DOM order, skip disabled, wrap, then select + focus it (automatic activation).
    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>): void => {
            const root = event.currentTarget
            const intent = rovingIntent(event.key, orientation, dir ?? (() => textDirection(root)))
            if (!intent) return

            const target = event.target as HTMLElement
            const buttons = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'))
            const currentTab = target.closest<HTMLElement>('[role="tab"]')
            const from = currentTab ? buttons.indexOf(currentTab) : -1
            const to = resolveRovingIndex(intent, from, tabs.length, true, (i) => !tabs[i]?.disabled)
            const tab = to >= 0 ? tabs[to] : undefined
            if (!tab) return

            event.preventDefault()
            select(tab) // automatic activation
            buttons[to]?.focus()
        },
        [orientation, dir, tabs, select]
    )

    const tablistProps = {
        role: 'tablist' as const,
        'aria-orientation': orientation,
        'aria-label': label,
        dir,
        'aria-labelledby': labelledby,
        onKeyDown
    }

    /** Props for one tab `<button>`: id, role, aria-selected, aria-controls, roving tabIndex, disabled, click. */
    const getTabProps = (tab: TabItem, index: number) => {
        const selected = tab.value === selectedValue
        return {
            id: `${base}-tab-${index}`,
            type: 'button' as const,
            role: 'tab' as const,
            'aria-selected': selected ? ('true' as const) : ('false' as const),
            'aria-controls': `${base}-panel-${index}`,
            tabIndex: selected ? 0 : -1,
            disabled: tab.disabled,
            onClick: () => select(tab)
        }
    }

    /** Props for one panel: id, role, aria-labelledby (its tab), hidden when not selected, focusable. */
    const getPanelProps = (tab: TabItem, index: number) => ({
        id: `${base}-panel-${index}`,
        role: 'tabpanel' as const,
        'aria-labelledby': `${base}-tab-${index}`,
        hidden: tab.value !== selectedValue,
        tabIndex: 0
    })

    return { selectedValue, select, tablistProps, getTabProps, getPanelProps }
}
