// The measurement API PerfCollectionsView.vue puts on `window`, declared once so the view and
// e2e/perf-collections.spec.ts agree on its shape. Global-script augmentation (no import/export), so
// it merges into the ambient `Window` for anything that includes the e2e folder.

interface OriPerfApi {
    /** Which combobox adapter the page mounted: the shipped one, or the O(n^2) findIndex variant. */
    variant: 'current' | 'findindex'
    /** Mount OriCombobox over `n` freshly built options (closed). Returns ms, array-building excluded. */
    mount(n: number): Promise<number>
    /** Open the listbox — the first time all `n` options are laid out. Returns ms. */
    open(): Promise<number>
    /** Dispatch `count` ArrowDown keydowns, one flush each. Returns the per-keystroke ms. */
    arrows(count: number): Promise<number[]>
    /** Type `query` into the input and re-filter. Returns ms and how many options survived. */
    filter(query: string): Promise<{ ms: number; matched: number }>
    /** How many `[role=option]` elements are in the DOM right now. */
    options(): number
    /** The highlighted option's text, or null. */
    highlighted(): string | null
}

interface Window {
    __oriPerf: OriPerfApi
}
