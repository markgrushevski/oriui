import type { RovingDirection, RovingOrientation } from './roving'

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

/**
 * The `useTabs` options, declared once like `./options`. Each adapter re-exports them inside its own
 * reactivity wrapper — `MaybeRefOrGetter` in Vue, `MaybeReactive` in Svelte, plain in React.
 */
export interface UseTabsOptions {
    /** The set of tabs, in order. */
    tabs: TabItem[]
    /** The controlled selection (Vue: `v-model`); resolves to the first enabled tab when unset. */
    value: string | number | undefined
    /** 'horizontal' (default) navigates Left/Right; 'vertical' navigates Up/Down. */
    orientation?: RovingOrientation
    /** Writing direction; RTL swaps Left/Right. Rendered as `dir`; omitted, the inherited one is read at keydown. */
    dir?: RovingDirection
    /** Accessible name for the tablist → `aria-label` (WAI-ARIA recommends naming the tablist). */
    label?: string
    /** Accessible name by element id → `aria-labelledby` (use instead of `label`). */
    labelledby?: string
    /** SSR-stable id base for the derived tab/panel ids; defaults to the adapter's own id source. */
    idBase?: string
    /** Commit the next selected value (wire to your bound value). */
    onChange?: (value: string | number) => void
}
