import {
    createContext,
    createElement,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode
} from 'react';
import { ownsArrowKeys, resolveRovingIndex, rovingIntent, type RovingDirection, type RovingOrientation } from '../core';

/**
 * Headless WAI-ARIA Toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) — the React twin of the
 * Vue / Svelte `useToolbar`, sharing the pure index/key math in `../core/roving`. Unlike the data-driven
 * `useTabs`, a toolbar is COMPOSITIONAL — its items are arbitrary child components — so this is a React
 * context roving-tabindex registry (Vue's `provide`/`inject`, Svelte's `setContext`), not a machine over an
 * items array. `useToolbar` (the root) owns orientation/loop/dir + a single keydown handler; each item calls
 * `useToolbarItem` to register and receive its roving `tabIndex`. Real DOM focus (not `aria-activedescendant`)
 * per the APG example — navigation resolves the target by DOM order (`querySelectorAll`), robust to reorder.
 *
 * React translation notes (vs the Vue/Svelte twins):
 * - Prop bags are PLAIN objects (no `ComputedRef` / `Readable`) in React-native casing (`onKeyDown` /
 *   `onFocus` / `tabIndex`); the component re-renders on registry changes through the context.
 * - Vue's `provide` / Svelte's `setContext` has no hook-only equivalent — a React context needs a *rendered*
 *   Provider — so `useToolbar` returns a stable `ToolbarProvider` to wrap the items with (the one member the
 *   twins don't have). Its context object keeps STABLE `register` / `unregister` / `setActive` methods (so an
 *   item's registration effect runs once, not on every `activeId` change) while its identity changes on
 *   `activeId` / `orientation` so items re-project their roving `tabIndex`.
 * - Registration is a mount/unmount `useEffect` (React has no synchronous child-setup phase like Vue's
 *   `setup`), so the first item becomes the tab stop right after mount; SSR renders every item `-1` and
 *   hydration matches — nothing here touches the DOM during render.
 */

interface ToolbarContextValue {
    orientation: RovingOrientation;
    /** The id of the single roving-tabbable item (`tabIndex` 0); everything else is -1. */
    activeId: string | null;
    register(id: string): void;
    unregister(id: string): void;
    setActive(id: string): void;
}

const ToolbarContext = createContext<ToolbarContextValue | null>(null);

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

export function useToolbar(options: UseToolbarOptions = {}) {
    const orientation = options.orientation ?? 'horizontal';
    const loop = options.loop ?? true;
    const dir = options.dir ?? 'ltr';

    // Registered item ids in mount order; the single tabbable item defaults to the first registered.
    const [registered, setRegistered] = useState<string[]>([]);
    const [explicitActive, setExplicitActive] = useState<string | null>(null);
    const activeId = explicitActive ?? registered[0] ?? null;

    // Stable registry mutators (functional updates → no deps): an item's registration effect keys off these,
    // so it runs once on mount / once on unmount even as the context object below changes identity.
    const register = useCallback((id: string) => {
        setRegistered((ids) => (ids.includes(id) ? ids : [...ids, id]));
    }, []);
    const unregister = useCallback((id: string) => {
        setRegistered((ids) => ids.filter((x) => x !== id));
        setExplicitActive((active) => (active === id ? null : active));
    }, []);
    const setActive = useCallback((id: string) => setExplicitActive(id), []);

    // The context object: STABLE methods + the reactive `activeId` / `orientation`. Memoised on the reactive
    // parts so its identity changes exactly when items must re-project their roving tabIndex, while
    // `register` / `unregister` keep the same reference across every render (see the effect in useToolbarItem).
    const context = useMemo<ToolbarContextValue>(
        () => ({ orientation, activeId, register, unregister, setActive }),
        [orientation, activeId, register, unregister, setActive]
    );

    // A stable Provider (identity never changes → no child remount) that reads the LIVE context each render
    // via a ref — the root component re-renders on every registry change, so the ref is always current. The
    // write-then-read happens within one synchronous render pass (parent writes, the child Provider reads),
    // so it can't tear under concurrent rendering.
    const contextRef = useRef(context);
    contextRef.current = context;
    const ToolbarProvider = useCallback(
        ({ children }: { children: ReactNode }): ReactElement =>
            createElement(ToolbarContext.Provider, { value: contextRef.current }, children),
        []
    );

    // Bound once on the toolbar root → currentTarget IS the root (no element ref needed). Resolve the target
    // by live DOM order, yielding entirely to a composite child that owns the arrow keys.
    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>): void => {
            const intent = rovingIntent(event.key, orientation, dir);
            if (!intent) return;

            const root = event.currentTarget;
            const target = event.target as HTMLElement;
            // Yield entirely to a control that owns arrow keys (slider/textbox/radio group placed in the bar).
            if (ownsArrowKeys(target)) return;

            const items = Array.from(root.querySelectorAll<HTMLElement>('[data-ori-toolbar-item]'));
            if (items.length === 0) return;

            const current = target.closest<HTMLElement>('[data-ori-toolbar-item]');
            const from = current ? items.indexOf(current) : -1;
            const to = resolveRovingIndex(intent, from, items.length, loop);
            if (to < 0) return;

            event.preventDefault();
            items[to]?.focus();
        },
        [orientation, dir, loop]
    );

    const toolbarProps = {
        role: 'toolbar' as const,
        // 'horizontal' is the ARIA implicit default → emit aria-orientation only for vertical.
        'aria-orientation': orientation === 'vertical' ? ('vertical' as const) : undefined,
        'aria-label': options.label,
        onKeyDown
    };

    return { toolbarProps, ToolbarProvider };
}

/**
 * Register the calling component as a toolbar item and receive its roving props. Spread `itemProps` on the
 * focusable element (a `<button>`): it carries the roving `tabIndex` (0 for the active item, -1 otherwise),
 * the `data-ori-toolbar-item` marker the root's keydown navigates by, and an `onFocus` that makes this item
 * the active tab stop. Inert (all -1 / no registration) outside a `useToolbar` root.
 */
export function useToolbarItem() {
    const ctx = useContext(ToolbarContext);
    // `useId()` is SSR-stable; strip the colons React wraps ids in so it stays a valid attribute/selector.
    const id = useId().replace(/:/g, '');

    // Registration is a mount/unmount effect (no synchronous child-setup phase in React). Key off the STABLE
    // `register` / `unregister` — not the whole `ctx`, whose identity changes on every `activeId` update — so
    // this runs once on mount and once on unmount, never churning the registry order.
    const register = ctx?.register;
    const unregister = ctx?.unregister;
    useEffect(() => {
        if (!register || !unregister) return;
        register(id);
        return () => unregister(id);
    }, [register, unregister, id]);

    const isActive = ctx?.activeId === id;

    const itemProps = {
        'data-ori-toolbar-item': '',
        tabIndex: isActive ? 0 : -1,
        onFocus: () => ctx?.setActive(id)
    };

    return { itemProps, isActive };
}

/**
 * Read the enclosing toolbar's orientation (defaults to 'horizontal' outside a toolbar). Used by a custom
 * separator or the toggle group to render perpendicular / matching orientation. Returns a plain value — the
 * component re-renders when the orientation changes (the Vue twin returns a getter, Svelte a store).
 */
export function useToolbarOrientation(): RovingOrientation {
    return useContext(ToolbarContext)?.orientation ?? 'horizontal';
}

// --- Toggle group --------------------------------------------------------------------------------

interface ToolbarToggleContextValue {
    isPressed(value: string): boolean;
    toggle(value: string): void;
}

const ToolbarToggleContext = createContext<ToolbarToggleContextValue | null>(null);

export interface UseToolbarToggleGroupOptions {
    /** 'single' keeps one value (deselectable, like Radix); 'multiple' keeps a set. */
    type: 'single' | 'multiple';
    /** Current value: a string (or undefined) for 'single', a string[] for 'multiple'. Controlled. */
    value: string | string[] | undefined;
    /** Commit the next value (wire to your controlled state). */
    onChange: (value: string | string[] | undefined) => void;
}

/**
 * Provide a toggle-selection context to nested `useToolbarToggleItem`s, and return a stable
 * `ToggleGroupProvider` to wrap them with (see the `ToolbarProvider` note on `useToolbar`). Roving is
 * unaffected — a toggle group is a `role="group"` layered over the flat toolbar roving order; its items are
 * still toolbar items and reachable by the same arrow navigation. Controlled — pass `value` / `onChange`.
 */
export function useToolbarToggleGroup(options: UseToolbarToggleGroupOptions) {
    const { type, value, onChange } = options;

    // `isPressed` / `toggle` close over the current `type` / `value` (and the latest `onChange`), so the
    // context re-derives when the selection changes → toggle items re-project `aria-pressed`.
    const context = useMemo<ToolbarToggleContextValue>(
        () => ({
            isPressed(v) {
                return type === 'multiple' ? Array.isArray(value) && value.includes(v) : value === v;
            },
            toggle(v) {
                if (type === 'multiple') {
                    const set = new Set(Array.isArray(value) ? value : []);
                    if (set.has(v)) set.delete(v);
                    else set.add(v);
                    onChange([...set]);
                } else {
                    onChange(value === v ? undefined : v);
                }
            }
        }),
        [type, value, onChange]
    );

    const contextRef = useRef(context);
    contextRef.current = context;
    const ToggleGroupProvider = useCallback(
        ({ children }: { children: ReactNode }): ReactElement =>
            createElement(ToolbarToggleContext.Provider, { value: contextRef.current }, children),
        []
    );

    const groupProps = { role: 'group' as const };
    return { groupProps, ToggleGroupProvider };
}

/**
 * A toolbar toggle item — composes `useToolbarItem` (roving) with the toggle-group selection context.
 * `itemProps` adds `aria-pressed` and an `onClick` that toggles this `value` in the group. Requires a
 * surrounding `useToolbarToggleGroup` (the selection half is inert — `pressed` false, `onClick` a no-op —
 * without one).
 */
export function useToolbarToggleItem(value: string) {
    const toggle = useContext(ToolbarToggleContext);
    const { itemProps: base, isActive } = useToolbarItem();

    const pressed = toggle?.isPressed(value) ?? false;

    const itemProps = {
        ...base,
        'aria-pressed': pressed,
        onClick: () => toggle?.toggle(value)
    };

    return { itemProps, pressed, isActive };
}
