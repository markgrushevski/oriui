/**
 * The one declaration of a tab, shared by the Vue / Svelte / React `useTabs` adapters.
 *
 * Tabs has no state machine — it is pure roving math over `../core/roving` plus per-framework
 * reactivity — so unlike `ComboboxItem` / `MenuItem` there is no `core/tabs/` namespace to hang the
 * item type off. It still belongs in core for the same reason those do: three adapters that each
 * re-declared it could drift apart silently, and a consumer moving between frameworks would be
 * assigning two structurally-identical-but-unrelated types. Each adapter re-exports it under its own
 * `TabItem` name, so `import type { TabItem } from '@oriui/headless/{vue,svelte,react}'` keeps working.
 */
export interface TabItem {
    /** Identity of the tab — what `value` / `onChange` carry, and what the panel is matched on. */
    value: string | number
    /** Arrow navigation steps OVER a disabled tab and `select()` refuses it (the Tabs roving model). */
    disabled?: boolean
}
