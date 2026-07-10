import { getContext, setContext } from 'svelte';
import { derived, get, readable, writable, type Readable } from 'svelte/store';
import { ownsArrowKeys, resolveRovingIndex, rovingIntent, type RovingDirection, type RovingOrientation } from '../core';
import { uid } from './id';
import { safeOnDestroy, toReadable, type MaybeReactive } from './use-store';

/**
 * Headless WAI-ARIA Toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) — the Svelte twin of the
 * Vue `useToolbar`, sharing the pure index/key math in `../core/roving`. Unlike the data-driven `useMenu`,
 * a toolbar is COMPOSITIONAL — its items are arbitrary slotted components — so this is a Svelte-context
 * roving-tabindex context (`setContext`/`getContext`), not a machine over an items array. `useToolbar`
 * (the root) owns orientation/loop/dir + a single keydown handler; each item calls `useToolbarItem` to
 * register and receive its roving `tabindex`. Real DOM focus (not `aria-activedescendant`) per the APG
 * example — navigation resolves the target by DOM order (`querySelectorAll`), robust to slot reordering.
 *
 * Reactivity is Svelte stores, not runes (see DECISIONS.md): the prop bags are `Readable` stores, options
 * are a `MaybeReactive<T>` (a snapshot object OR a store), and the context degrades to `null` outside
 * component init (`getContext`/`setContext` throw there) so the composables stay unit-testable.
 */

interface ToolbarContext {
    orientation: Readable<RovingOrientation>;
    /** The id of the single roving-tabbable item (tabindex 0); everything else is -1. */
    activeId: Readable<string | null>;
    register(id: string): void;
    unregister(id: string): void;
    setActive(id: string): void;
}

const TOOLBAR_KEY = Symbol('ori-toolbar');

/** `getContext` throws outside component init (Svelte `lifecycle_outside_component`); swallow → `null`. */
function safeGetContext<T>(key: symbol): T | null {
    try {
        return getContext<T>(key) ?? null;
    } catch {
        return null;
    }
}

/** `setContext` likewise throws outside component init; a unit test has no children to consume it → no-op. */
function safeSetContext<T>(key: symbol, value: T): void {
    try {
        setContext(key, value);
    } catch {
        // not in a component — nothing to provide to.
    }
}

export interface UseToolbarOptions {
    /** 'horizontal' (default) navigates with Left/Right; 'vertical' with Up/Down. */
    orientation?: RovingOrientation;
    /** Whether arrow navigation wraps first<->last (default true; the APG reference example wraps). */
    loop?: boolean;
    /** Text direction — RTL swaps the horizontal Left/Right mapping (default 'ltr'). */
    dir?: RovingDirection;
    /** Accessible name → `aria-label`. A toolbar MUST be named (this or an `aria-labelledby` you pass). */
    label?: string;
}

/**
 * The toolbar root: establishes the roving context (via `setContext`) and returns `toolbarProps`, a store
 * of the ARIA + keydown prop bag to spread on the toolbar element (`<div {...$toolbarProps}>`). The keydown
 * handler resolves the target from `event.currentTarget` (the toolbar) so no element ref is needed. Options
 * may be a plain object or a `Readable` store — orientation/label changes re-project reactively.
 */
export function useToolbar(options: MaybeReactive<UseToolbarOptions> = {}) {
    const opts$ = toReadable(options);

    // Registered item ids in mount order; the single tabbable item defaults to the first registered.
    const registered = writable<string[]>([]);
    const explicitActive = writable<string | null>(null);
    const activeId = derived([registered, explicitActive], ([ids, active]) => active ?? ids[0] ?? null);
    const orientation = derived(opts$, (o) => o.orientation ?? 'horizontal');

    safeSetContext<ToolbarContext>(TOOLBAR_KEY, {
        orientation,
        activeId,
        register(id) {
            registered.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
        },
        unregister(id) {
            registered.update((ids) => ids.filter((x) => x !== id));
            explicitActive.update((active) => (active === id ? null : active));
        },
        setActive(id) {
            explicitActive.set(id);
        }
    });

    function onKeydown(event: KeyboardEvent): void {
        const o = get(opts$);
        const intent = rovingIntent(event.key, o.orientation ?? 'horizontal', o.dir ?? 'ltr');
        if (!intent) return;

        const root = event.currentTarget as HTMLElement | null;
        const target = event.target as HTMLElement | null;
        if (!root || !target) return;

        // Yield entirely to a control that owns arrow keys (slider/textbox/radio group placed in the bar).
        if (ownsArrowKeys(target)) return;

        const items = Array.from(root.querySelectorAll<HTMLElement>('[data-ori-toolbar-item]'));
        if (items.length === 0) return;

        const current = target.closest<HTMLElement>('[data-ori-toolbar-item]');
        const from = current ? items.indexOf(current) : -1;
        const to = resolveRovingIndex(intent, from, items.length, o.loop ?? true);
        if (to < 0) return;

        event.preventDefault();
        items[to]?.focus();
    }

    const toolbarProps = derived(opts$, (o) => ({
        role: 'toolbar' as const,
        // 'horizontal' is the ARIA implicit default → emit aria-orientation only for vertical.
        'aria-orientation': (o.orientation ?? 'horizontal') === 'vertical' ? ('vertical' as const) : undefined,
        'aria-label': o.label,
        onkeydown: onKeydown
    }));

    return { toolbarProps };
}

/**
 * Register the calling component as a toolbar item and receive its roving props. Spread `$itemProps` on the
 * focusable element (a `<button>`): it carries the roving `tabindex` (0 for the active item, -1 otherwise),
 * the `data-ori-toolbar-item` marker the root's keydown navigates by, and an `onfocus` that makes this item
 * the active tab stop. Inert (all -1 / no context) outside a toolbar.
 */
export function useToolbarItem() {
    const ctx = safeGetContext<ToolbarContext>(TOOLBAR_KEY);
    const id = uid('ori-toolbar-item');

    if (ctx) {
        ctx.register(id);
        safeOnDestroy(() => ctx.unregister(id));
    }

    const isActive: Readable<boolean> = ctx ? derived(ctx.activeId, (active) => active === id) : readable(false);

    const itemProps = derived(isActive, (active) => ({
        'data-ori-toolbar-item': '',
        tabindex: active ? 0 : -1,
        onfocus: () => ctx?.setActive(id)
    }));

    return { itemProps, isActive };
}

/**
 * Read the enclosing toolbar's orientation as a store (defaults to 'horizontal' outside a toolbar). Used by
 * the separator and toggle group to render perpendicular / matching orientation (`$orientation`).
 */
export function useToolbarOrientation(): Readable<RovingOrientation> {
    const ctx = safeGetContext<ToolbarContext>(TOOLBAR_KEY);
    return ctx ? ctx.orientation : readable('horizontal');
}

// --- Toggle group --------------------------------------------------------------------------------

interface ToolbarToggleContext {
    /** Store of a predicate — a toggle item derives its `pressed` from `$isPressed(value)`. */
    isPressed: Readable<(value: string) => boolean>;
    toggle(value: string): void;
}

const TOOLBAR_TOGGLE_KEY = Symbol('ori-toolbar-toggle');

export interface UseToolbarToggleGroupOptions {
    /** 'single' keeps one value (deselectable, like Radix); 'multiple' keeps a set. */
    type: MaybeReactive<'single' | 'multiple'>;
    /** Current value: a string (or undefined) for 'single', a string[] for 'multiple'. A store to react. */
    value: MaybeReactive<string | string[] | undefined>;
    /** Commit the next value (wire to your bound value). */
    onChange: (value: string | string[] | undefined) => void;
}

/**
 * Provide a toggle-selection context to nested `useToolbarToggleItem`s. Roving is unaffected — a toggle
 * group is a `role="group"` layered over the flat toolbar roving order; its items are still toolbar items
 * and reachable by the same arrow navigation.
 */
export function useToolbarToggleGroup(options: UseToolbarToggleGroupOptions) {
    const type$ = toReadable(options.type);
    const value$ = toReadable(options.value);

    const isPressed = derived(
        [type$, value$],
        ([type, current]) =>
            (value: string) =>
                type === 'multiple' ? Array.isArray(current) && current.includes(value) : current === value
    );

    function toggle(value: string): void {
        const current = get(value$);
        if (get(type$) === 'multiple') {
            const set = new Set(Array.isArray(current) ? current : []);
            if (set.has(value)) set.delete(value);
            else set.add(value);
            options.onChange([...set]);
        } else {
            options.onChange(current === value ? undefined : value);
        }
    }

    safeSetContext<ToolbarToggleContext>(TOOLBAR_TOGGLE_KEY, { isPressed, toggle });

    const groupProps = readable({ role: 'group' as const });
    return { groupProps };
}

/**
 * A toolbar toggle item — composes `useToolbarItem` (roving) with the toggle-group selection context.
 * `$itemProps` adds `aria-pressed` and an `onclick` that toggles this value in the group. Requires a
 * surrounding `useToolbarToggleGroup`. `value` may be a plain string or a store.
 */
export function useToolbarToggleItem(value: MaybeReactive<string>) {
    const ctx = safeGetContext<ToolbarToggleContext>(TOOLBAR_TOGGLE_KEY);
    const { itemProps: base, isActive } = useToolbarItem();
    const value$ = toReadable(value);

    const pressed: Readable<boolean> = ctx
        ? derived([ctx.isPressed, value$], ([isPressed, v]) => isPressed(v))
        : readable(false);

    const itemProps = derived([base, pressed], ([baseProps, isPressed]) => ({
        ...baseProps,
        'aria-pressed': isPressed,
        onclick: () => ctx?.toggle(get(value$))
    }));

    return { itemProps, pressed, isActive };
}
