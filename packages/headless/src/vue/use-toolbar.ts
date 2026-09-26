import {
    computed,
    inject,
    onScopeDispose,
    provide,
    ref,
    toValue,
    useId,
    type InjectionKey,
    type MaybeRefOrGetter
} from 'vue'
import {
    isToolbarTogglePressed,
    ownsArrowKeys,
    resolveRovingIndex,
    resolveToolbarToggle,
    rovingIntent,
    textDirection,
    type RovingDirection,
    type RovingOrientation,
    type ToolbarToggleType,
    type ToolbarToggleValue
} from '../core'

// Fallback id source when `useId()` is unavailable (called outside an app context); the composables are
// intended for component setup, where useId() always resolves.
let fallbackId = 0

/**
 * Headless WAI-ARIA Toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). Unlike the data-driven
 * `useMenu`, a toolbar is COMPOSITIONAL — its items are arbitrary slotted components — so this is a
 * provide/inject roving-tabindex context, not a machine over an items array. `useToolbar` (the root)
 * owns orientation/loop/dir + a single keydown handler; each item calls `useToolbarItem` to register
 * and receive its roving `tabindex`. Real DOM focus (not `aria-activedescendant`) per the APG example —
 * navigation resolves the target by DOM order (`querySelectorAll`), robust to slot reordering. The pure
 * index/key math lives in `../core/roving` and is shared with the Svelte twin.
 */

interface ToolbarContext {
    orientation: () => RovingOrientation
    /** The id of the single roving-tabbable item (tabindex 0); everything else is -1. */
    activeId: { readonly value: string | null }
    register(id: string): void
    unregister(id: string): void
    setActive(id: string): void
}

// `Symbol.for` so a root and an item resolved from two undeduped copies of this package still meet —
// a plain Symbol would leave the item inert with no error. Same reasoning as `ORI_HEADLESS`.
const TOOLBAR_KEY: InjectionKey<ToolbarContext> = Symbol.for('ori-toolbar@1')

export interface UseToolbarOptions {
    /** 'horizontal' (default) navigates with Left/Right; 'vertical' with Up/Down. */
    orientation?: MaybeRefOrGetter<RovingOrientation | undefined>
    /** Whether arrow navigation wraps first<->last (default true; the APG reference example wraps). */
    loop?: MaybeRefOrGetter<boolean | undefined>
    /** Writing direction; RTL swaps Left/Right. Rendered as `dir`; omitted, the inherited one is read at keydown. */
    dir?: MaybeRefOrGetter<RovingDirection | undefined>
    /** Accessible name → `aria-label`. A toolbar MUST be named (this or an `aria-labelledby` you pass). */
    label?: MaybeRefOrGetter<string | undefined>
}

export function useToolbar(options: UseToolbarOptions = {}) {
    const orientation = () => toValue(options.orientation) ?? 'horizontal'
    const loop = () => toValue(options.loop) ?? true
    const dir = () => toValue(options.dir)

    // Registered item ids in mount order; the single tabbable item defaults to the first registered.
    const registered = ref<string[]>([])
    const explicitActive = ref<string | null>(null)
    const activeId = computed(() => explicitActive.value ?? registered.value[0] ?? null)

    provide(TOOLBAR_KEY, {
        orientation,
        activeId,
        register(id) {
            if (!registered.value.includes(id)) registered.value = [...registered.value, id]
        },
        unregister(id) {
            registered.value = registered.value.filter((x) => x !== id)
            if (explicitActive.value === id) explicitActive.value = null
        },
        setActive(id) {
            explicitActive.value = id
        }
    })

    function onKeydown(event: KeyboardEvent): void {
        // The keydown is bound only on the toolbar root (toolbarProps.onKeydown), so currentTarget IS
        // the root — no template ref needed (matches the Svelte twin; drops a "forgot the ref" footgun).
        const root = event.currentTarget as HTMLElement | null
        const target = event.target as HTMLElement | null
        if (!root || !target) return

        const intent = rovingIntent(event.key, orientation(), dir() ?? (() => textDirection(root)))
        if (!intent) return

        // Yield entirely to a control that owns arrow keys (slider/textbox/radio group placed in the bar).
        if (ownsArrowKeys(target)) return

        const items = Array.from(root.querySelectorAll<HTMLElement>('[data-ori-toolbar-item]'))
        if (items.length === 0) return

        const current = target.closest<HTMLElement>('[data-ori-toolbar-item]')
        const from = current ? items.indexOf(current) : -1
        const to = resolveRovingIndex(intent, from, items.length, loop())
        if (to < 0) return

        event.preventDefault()
        items[to]?.focus()
    }

    const toolbarProps = computed(() => ({
        role: 'toolbar',
        // 'horizontal' is the ARIA implicit default → emit aria-orientation only for vertical.
        'aria-orientation': orientation() === 'vertical' ? ('vertical' as const) : undefined,
        'aria-label': toValue(options.label),
        dir: dir(),
        onKeydown
    }))

    return { toolbarProps }
}

/**
 * Register the calling component as a toolbar item and receive its roving props. Spread `itemProps` on
 * the focusable element (a `<button>`): it carries the roving `tabindex` (0 for the active item, -1
 * otherwise), the `data-ori-toolbar-item` marker the root's keydown navigates by, and an `onFocus` that
 * makes this item the active tab stop. Inert (all -1 / no context) outside a `<OriToolbar>`.
 */
export function useToolbarItem() {
    const ctx = inject(TOOLBAR_KEY, null)
    const id = useId() ?? `ori-toolbar-item-${(fallbackId += 1)}`

    if (ctx) {
        ctx.register(id)
        onScopeDispose(() => ctx.unregister(id))
    }

    const isActive = computed(() => ctx?.activeId.value === id)

    const itemProps = computed(() => ({
        'data-ori-toolbar-item': '',
        tabindex: isActive.value ? 0 : -1,
        onFocus: () => ctx?.setActive(id)
    }))

    return { itemProps, isActive }
}

/**
 * Read the enclosing toolbar's orientation (a getter; defaults to 'horizontal' outside a toolbar). Used
 * by the separator and toggle group to render perpendicular / matching orientation.
 */
export function useToolbarOrientation(): () => RovingOrientation {
    const ctx = inject(TOOLBAR_KEY, null)
    return () => ctx?.orientation() ?? 'horizontal'
}

// --- Toggle group --------------------------------------------------------------------------------

interface ToolbarToggleContext {
    isPressed(value: string): boolean
    toggle(value: string): void
}

const TOOLBAR_TOGGLE_KEY: InjectionKey<ToolbarToggleContext> = Symbol.for('ori-toolbar-toggle@1')

/**
 * Every member here is LIVE — re-read on each press, not captured once — so each takes the reactive form
 * (`MaybeRefOrGetter`: a value, a ref or a getter). That is the rule across the Vue adapter: an option
 * that SEEDS a primitive (`defaultOpen`, an initial `value`) accepts a value, a ref or a getter and is
 * read once; an option that is LIVE is re-read, so passing a bare value freezes it.
 */
export interface UseToolbarToggleGroupOptions {
    /** 'single' keeps at most one value; 'multiple' keeps a set. */
    type: MaybeRefOrGetter<ToolbarToggleType>
    /** Current value: a string (or undefined) for 'single', a string[] for 'multiple'. */
    value: MaybeRefOrGetter<ToolbarToggleValue>
    /**
     * Whether pressing the already-selected item clears it (default `true`, Radix's `type="single"`
     * behaviour). `false` guarantees a non-empty selection — the tool-picker case: a paint app's
     * brush/eraser bar must always have exactly one tool. Under 'multiple' it pins the last value.
     */
    deselectable?: MaybeRefOrGetter<boolean | undefined>
    /** Commit the next value (wire to your `v-model`). Not fired when a press changes nothing. */
    onChange: (value: ToolbarToggleValue) => void
}

/**
 * Provide a toggle-selection context to nested `useToolbarToggleItem`s. Roving is unaffected — a toggle
 * group is a `role="group"` layered over the flat toolbar roving order; its items are still toolbar
 * items and reachable by the same arrow navigation.
 */
export function useToolbarToggleGroup(options: UseToolbarToggleGroupOptions) {
    // The selection rules themselves live in `../core/toolbar`, shared verbatim with the Svelte and React
    // twins; only the `toValue` unwrapping below is Vue's.
    provide(TOOLBAR_TOGGLE_KEY, {
        isPressed(value) {
            return isToolbarTogglePressed(toValue(options.type), toValue(options.value), value)
        },
        toggle(value) {
            const current = toValue(options.value)
            const next = resolveToolbarToggle(
                toValue(options.type),
                current,
                value,
                toValue(options.deselectable) ?? true
            )
            // The resolver hands back `current` itself when the press changes nothing (a pinned last
            // selection), so a non-deselectable group never re-commits the value it already holds.
            if (next !== current) options.onChange(next)
        }
    })

    const groupProps = computed(() => ({ role: 'group' as const }))
    return { groupProps }
}

/**
 * A toolbar toggle item — composes `useToolbarItem` (roving) with the toggle-group selection context.
 * `itemProps` adds `aria-pressed` and an `onClick` that toggles this value in the group. Requires a
 * surrounding `useToolbarToggleGroup`.
 */
export function useToolbarToggleItem(value: MaybeRefOrGetter<string>) {
    const toggle = inject(TOOLBAR_TOGGLE_KEY, null)
    const { itemProps: base, isActive } = useToolbarItem()

    const pressed = computed(() => toggle?.isPressed(toValue(value)) ?? false)

    const itemProps = computed(() => ({
        ...base.value,
        'aria-pressed': pressed.value,
        onClick: () => toggle?.toggle(toValue(value))
    }))

    return { itemProps, pressed, isActive }
}
