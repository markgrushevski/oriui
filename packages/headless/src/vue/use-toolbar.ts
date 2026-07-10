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
} from 'vue';
import { ownsArrowKeys, resolveRovingIndex, rovingIntent, type RovingDirection, type RovingOrientation } from '../core';

// Fallback id source when `useId()` is unavailable (called outside an app context); the composables are
// intended for component setup, where useId() always resolves.
let fallbackId = 0;

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
    orientation: () => RovingOrientation;
    /** The id of the single roving-tabbable item (tabindex 0); everything else is -1. */
    activeId: { readonly value: string | null };
    register(id: string): void;
    unregister(id: string): void;
    setActive(id: string): void;
}

const TOOLBAR_KEY: InjectionKey<ToolbarContext> = Symbol('ori-toolbar');

export interface UseToolbarOptions {
    /** 'horizontal' (default) navigates with Left/Right; 'vertical' with Up/Down. */
    orientation?: MaybeRefOrGetter<RovingOrientation | undefined>;
    /** Whether arrow navigation wraps first<->last (default true; the APG reference example wraps). */
    loop?: MaybeRefOrGetter<boolean | undefined>;
    /** Text direction — RTL swaps the horizontal Left/Right mapping (default 'ltr'). */
    dir?: MaybeRefOrGetter<RovingDirection | undefined>;
    /** Accessible name → `aria-label`. A toolbar MUST be named (this or an `aria-labelledby` you pass). */
    label?: MaybeRefOrGetter<string | undefined>;
}

export function useToolbar(options: UseToolbarOptions = {}) {
    const orientation = () => toValue(options.orientation) ?? 'horizontal';
    const loop = () => toValue(options.loop) ?? true;
    const dir = () => toValue(options.dir) ?? 'ltr';

    // Registered item ids in mount order; the single tabbable item defaults to the first registered.
    const registered = ref<string[]>([]);
    const explicitActive = ref<string | null>(null);
    const activeId = computed(() => explicitActive.value ?? registered.value[0] ?? null);

    provide(TOOLBAR_KEY, {
        orientation,
        activeId,
        register(id) {
            if (!registered.value.includes(id)) registered.value = [...registered.value, id];
        },
        unregister(id) {
            registered.value = registered.value.filter((x) => x !== id);
            if (explicitActive.value === id) explicitActive.value = null;
        },
        setActive(id) {
            explicitActive.value = id;
        }
    });

    function onKeydown(event: KeyboardEvent): void {
        const intent = rovingIntent(event.key, orientation(), dir());
        if (!intent) return;

        // The keydown is bound only on the toolbar root (toolbarProps.onKeydown), so currentTarget IS
        // the root — no template ref needed (matches the Svelte twin; drops a "forgot the ref" footgun).
        const root = event.currentTarget as HTMLElement | null;
        const target = event.target as HTMLElement | null;
        if (!root || !target) return;

        // Yield entirely to a control that owns arrow keys (slider/textbox/radio group placed in the bar).
        if (ownsArrowKeys(target)) return;

        const items = Array.from(root.querySelectorAll<HTMLElement>('[data-ori-toolbar-item]'));
        if (items.length === 0) return;

        const current = target.closest<HTMLElement>('[data-ori-toolbar-item]');
        const from = current ? items.indexOf(current) : -1;
        const to = resolveRovingIndex(intent, from, items.length, loop());
        if (to < 0) return;

        event.preventDefault();
        items[to]?.focus();
    }

    const toolbarProps = computed(() => ({
        role: 'toolbar',
        // 'horizontal' is the ARIA implicit default → emit aria-orientation only for vertical.
        'aria-orientation': orientation() === 'vertical' ? ('vertical' as const) : undefined,
        'aria-label': toValue(options.label),
        onKeydown
    }));

    return { toolbarProps };
}

/**
 * Register the calling component as a toolbar item and receive its roving props. Spread `itemProps` on
 * the focusable element (a `<button>`): it carries the roving `tabindex` (0 for the active item, -1
 * otherwise), the `data-ori-toolbar-item` marker the root's keydown navigates by, and an `onFocus` that
 * makes this item the active tab stop. Inert (all -1 / no context) outside a `<OriToolbar>`.
 */
export function useToolbarItem() {
    const ctx = inject(TOOLBAR_KEY, null);
    const id = useId() ?? `ori-toolbar-item-${(fallbackId += 1)}`;

    if (ctx) {
        ctx.register(id);
        onScopeDispose(() => ctx.unregister(id));
    }

    const isActive = computed(() => ctx?.activeId.value === id);

    const itemProps = computed(() => ({
        'data-ori-toolbar-item': '',
        tabindex: isActive.value ? 0 : -1,
        onFocus: () => ctx?.setActive(id)
    }));

    return { itemProps, isActive };
}

/**
 * Read the enclosing toolbar's orientation (a getter; defaults to 'horizontal' outside a toolbar). Used
 * by the separator and toggle group to render perpendicular / matching orientation.
 */
export function useToolbarOrientation(): () => RovingOrientation {
    const ctx = inject(TOOLBAR_KEY, null);
    return () => ctx?.orientation() ?? 'horizontal';
}

// --- Toggle group --------------------------------------------------------------------------------

interface ToolbarToggleContext {
    isPressed(value: string): boolean;
    toggle(value: string): void;
}

const TOOLBAR_TOGGLE_KEY: InjectionKey<ToolbarToggleContext> = Symbol('ori-toolbar-toggle');

export interface UseToolbarToggleGroupOptions {
    /** 'single' keeps one value (deselectable, like Radix); 'multiple' keeps a set. */
    type: MaybeRefOrGetter<'single' | 'multiple'>;
    /** Current value: a string (or undefined) for 'single', a string[] for 'multiple'. */
    value: () => string | string[] | undefined;
    /** Commit the next value (wire to your `v-model`). */
    onChange: (value: string | string[] | undefined) => void;
}

/**
 * Provide a toggle-selection context to nested `useToolbarToggleItem`s. Roving is unaffected — a toggle
 * group is a `role="group"` layered over the flat toolbar roving order; its items are still toolbar
 * items and reachable by the same arrow navigation.
 */
export function useToolbarToggleGroup(options: UseToolbarToggleGroupOptions) {
    provide(TOOLBAR_TOGGLE_KEY, {
        isPressed(value) {
            const current = options.value();
            return toValue(options.type) === 'multiple'
                ? Array.isArray(current) && current.includes(value)
                : current === value;
        },
        toggle(value) {
            const current = options.value();
            if (toValue(options.type) === 'multiple') {
                const set = new Set(Array.isArray(current) ? current : []);
                if (set.has(value)) set.delete(value);
                else set.add(value);
                options.onChange([...set]);
            } else {
                options.onChange(current === value ? undefined : value);
            }
        }
    });

    const groupProps = computed(() => ({ role: 'group' as const }));
    return { groupProps };
}

/**
 * A toolbar toggle item — composes `useToolbarItem` (roving) with the toggle-group selection context.
 * `itemProps` adds `aria-pressed` and an `onClick` that toggles this value in the group. Requires a
 * surrounding `useToolbarToggleGroup`.
 */
export function useToolbarToggleItem(value: MaybeRefOrGetter<string>) {
    const toggle = inject(TOOLBAR_TOGGLE_KEY, null);
    const { itemProps: base, isActive } = useToolbarItem();

    const pressed = computed(() => toggle?.isPressed(toValue(value)) ?? false);

    const itemProps = computed(() => ({
        ...base.value,
        'aria-pressed': pressed.value,
        onClick: () => toggle?.toggle(toValue(value))
    }));

    return { itemProps, pressed, isActive };
}
