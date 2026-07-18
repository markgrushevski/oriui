import { afterEach, describe, it, expect } from 'vitest';
import { render, renderHook, cleanup, fireEvent, screen } from '@testing-library/react';
import { createElement, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import {
    useToolbar,
    useToolbarItem,
    useToolbarOrientation,
    useToolbarToggleGroup,
    useToolbarToggleItem
} from '@oriui/headless/react';

// The React `useToolbar` family — the compositional (context, not machine) roving-tabindex primitive, twin
// of the Vue `provide`/`inject` + Svelte `setContext` toolbars, sharing the pure `../core/roving` math. Prop
// shapes and the roving keydown resolve over a raw DOM (`renderHook` + a synthetic event, like the useTabs
// test); the registry / active-stop / toggle-selection wiring is exercised by rendering real React component
// trees (`render` + `createElement`, no JSX) and driving focus / click through the DOM. This is the
// executable proof that the context registry keeps STABLE registrations while re-projecting roving tabIndex,
// that focus makes an item the active stop, and that the controlled toggle group flips `aria-pressed`.

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});

// --- toolbarProps shape ---------------------------------------------------------------------------

describe('React useToolbar props', () => {
    it('horizontal (default): role=toolbar, no aria-orientation, aria-label, React-cased onKeyDown', () => {
        const { result } = renderHook(() => useToolbar({ label: 'Formatting' }));

        const bag = result.current.toolbarProps;
        expect(bag.role).toBe('toolbar');
        expect(bag['aria-orientation']).toBeUndefined(); // horizontal is the ARIA implicit default
        expect(bag['aria-label']).toBe('Formatting');
        expect(typeof bag.onKeyDown).toBe('function');
        expect(typeof result.current.ToolbarProvider).toBe('function'); // the React-only Provider member
    });

    it('vertical: emits aria-orientation="vertical"', () => {
        const { result } = renderHook(() => useToolbar({ orientation: 'vertical' }));
        expect(result.current.toolbarProps['aria-orientation']).toBe('vertical');
    });
});

// --- roving keydown (DOM order, real focus) -------------------------------------------------------

describe('React useToolbar roving keydown', () => {
    type RKE = ReactKeyboardEvent<HTMLElement>;

    function mountItems(count: number): { root: HTMLElement; items: HTMLButtonElement[] } {
        const root = document.createElement('div');
        const items = Array.from({ length: count }, () => {
            const button = document.createElement('button');
            button.setAttribute('data-ori-toolbar-item', '');
            root.append(button);
            return button;
        });
        document.body.append(root);
        return { root, items };
    }

    const press = (onKeyDown: (e: RKE) => void, root: HTMLElement, target: HTMLElement, key: string) =>
        onKeyDown({ key, currentTarget: root, target, preventDefault: () => {} } as unknown as RKE);

    it('horizontal: arrows move real focus in DOM order and wrap; Home/End jump to the ends', () => {
        const { result } = renderHook(() => useToolbar({ label: 'x' }));
        const { root, items } = mountItems(3);
        const [a, b, c] = items;
        const key = (target: HTMLElement, k: string) => press(result.current.toolbarProps.onKeyDown, root, target, k);

        a!.focus();
        key(a!, 'ArrowRight');
        expect(document.activeElement).toBe(b);
        key(b!, 'ArrowRight');
        expect(document.activeElement).toBe(c);
        key(c!, 'ArrowRight'); // last → wraps to first
        expect(document.activeElement).toBe(a);
        key(a!, 'ArrowLeft'); // first → wraps to last
        expect(document.activeElement).toBe(c);
        key(c!, 'Home');
        expect(document.activeElement).toBe(a);
        key(a!, 'End');
        expect(document.activeElement).toBe(c);
    });

    it('visits every registered item (no skip) — navigation lands on an aria-disabled item', () => {
        const { result } = renderHook(() => useToolbar({ label: 'x' }));
        const { root, items } = mountItems(3);
        items[1]!.setAttribute('aria-disabled', 'true'); // still focusable, still a toolbar item

        items[0]!.focus();
        press(result.current.toolbarProps.onKeyDown, root, items[0]!, 'ArrowRight');
        expect(document.activeElement).toBe(items[1]); // the disabled item is visited, not skipped
    });

    it('loop:false clamps at the ends instead of wrapping', () => {
        const { result } = renderHook(() => useToolbar({ label: 'x', loop: false }));
        const { root, items } = mountItems(3);

        items[0]!.focus();
        press(result.current.toolbarProps.onKeyDown, root, items[0]!, 'ArrowLeft'); // at first, prev
        expect(document.activeElement).toBe(items[0]); // stays (no wrap)

        items[2]!.focus();
        press(result.current.toolbarProps.onKeyDown, root, items[2]!, 'ArrowRight'); // at last, next
        expect(document.activeElement).toBe(items[2]); // stays (no wrap)
    });

    it('vertical navigates Up/Down and ignores Left/Right', () => {
        const { result } = renderHook(() => useToolbar({ orientation: 'vertical' }));
        const { root, items } = mountItems(3);

        items[0]!.focus();
        press(result.current.toolbarProps.onKeyDown, root, items[0]!, 'ArrowDown');
        expect(document.activeElement).toBe(items[1]);
        press(result.current.toolbarProps.onKeyDown, root, items[1]!, 'ArrowRight'); // not a vertical key
        expect(document.activeElement).toBe(items[1]); // unchanged
        press(result.current.toolbarProps.onKeyDown, root, items[1]!, 'ArrowUp');
        expect(document.activeElement).toBe(items[0]);
    });

    it('dir="rtl" swaps the horizontal Left/Right mapping', () => {
        const { result } = renderHook(() => useToolbar({ dir: 'rtl' }));
        const { root, items } = mountItems(3);

        items[0]!.focus();
        press(result.current.toolbarProps.onKeyDown, root, items[0]!, 'ArrowLeft'); // rtl: Left is "next"
        expect(document.activeElement).toBe(items[1]);
        press(result.current.toolbarProps.onKeyDown, root, items[1]!, 'ArrowRight'); // rtl: Right is "prev"
        expect(document.activeElement).toBe(items[0]);
    });

    it('yields to a composite child that owns the arrow keys (does not steal them)', () => {
        const { result } = renderHook(() => useToolbar({ label: 'x' }));
        const { root, items } = mountItems(2);
        const input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('data-ori-toolbar-item', '');
        root.append(input);

        items[0]!.focus();
        // target is the text input → ownsArrowKeys → the toolbar does not navigate.
        press(result.current.toolbarProps.onKeyDown, root, input, 'ArrowRight');
        expect(document.activeElement).toBe(items[0]); // focus unchanged
    });

    it('no-ops with an empty toolbar', () => {
        const { result } = renderHook(() => useToolbar({ label: 'x' }));
        const { root } = mountItems(0);
        expect(() => press(result.current.toolbarProps.onKeyDown, root, root, 'ArrowRight')).not.toThrow();
    });
});

// --- compositional registry (real component tree) -------------------------------------------------

function Toolbar({ children, orientation }: { children?: ReactNode; orientation?: 'horizontal' | 'vertical' }) {
    const { toolbarProps, ToolbarProvider } = useToolbar({ label: 'Format', orientation });
    // No element ref: the keydown handler resolves the root from event.currentTarget.
    return createElement(ToolbarProvider, null, createElement('div', toolbarProps, children));
}

function Item({ text }: { text: string }) {
    const { itemProps } = useToolbarItem();
    return createElement('button', { ...itemProps, 'data-testid': text }, text);
}

describe('React useToolbar registry (roving tabindex over a component tree)', () => {
    it('defaults the first registered item to the tab stop; others are -1', () => {
        render(
            createElement(
                Toolbar,
                null,
                createElement(Item, { text: 'New' }),
                createElement(Item, { text: 'Open' }),
                createElement(Item, { text: 'Save' })
            )
        );

        // render() flushes the mount effects → the first item registers and becomes the tab stop.
        expect(screen.getByTestId('New').getAttribute('tabindex')).toBe('0');
        expect(screen.getByTestId('Open').getAttribute('tabindex')).toBe('-1');
        expect(screen.getByTestId('Save').getAttribute('tabindex')).toBe('-1');
    });

    it('onFocus makes the focused item the active stop (tabIndex 0 moves to it)', () => {
        render(
            createElement(Toolbar, null, createElement(Item, { text: 'New' }), createElement(Item, { text: 'Open' }))
        );
        expect(screen.getByTestId('New').getAttribute('tabindex')).toBe('0');

        // focusin drives the item's onFocus → setActive → the roving tab stop moves.
        fireEvent.focusIn(screen.getByTestId('Open'));
        expect(screen.getByTestId('Open').getAttribute('tabindex')).toBe('0');
        expect(screen.getByTestId('New').getAttribute('tabindex')).toBe('-1');
    });

    it('useToolbarItem is inert outside a toolbar (tabIndex -1, not active, no-op onFocus)', () => {
        const { result } = renderHook(() => useToolbarItem());
        expect(result.current.itemProps.tabIndex).toBe(-1);
        expect(result.current.isActive).toBe(false);
        expect(() => result.current.itemProps.onFocus()).not.toThrow();
    });
});

// --- orientation reader ---------------------------------------------------------------------------

function OrientationProbe() {
    return createElement('span', { 'data-testid': 'orient' }, useToolbarOrientation());
}

describe('React useToolbarOrientation', () => {
    it("defaults to 'horizontal' outside a toolbar", () => {
        const { result } = renderHook(() => useToolbarOrientation());
        expect(result.current).toBe('horizontal');
    });

    it('reads the enclosing toolbar orientation', () => {
        render(createElement(Toolbar, { orientation: 'vertical' }, createElement(OrientationProbe, null)));
        expect(screen.getByTestId('orient').textContent).toBe('vertical');
    });
});

// --- toggle group (controlled selection over a component tree) ------------------------------------

function ToggleGroup({ type, children }: { type: 'single' | 'multiple'; children?: ReactNode }) {
    const [value, setValue] = useState<string | string[] | undefined>(type === 'multiple' ? [] : undefined);
    const { groupProps, ToggleGroupProvider } = useToolbarToggleGroup({ type, value, onChange: setValue });
    return createElement(
        ToggleGroupProvider,
        null,
        createElement('div', { ...groupProps, 'aria-label': 'Style' }, children)
    );
}

function ToggleItem({ value }: { value: string }) {
    const { itemProps } = useToolbarToggleItem(value);
    return createElement('button', { ...itemProps, 'data-testid': value }, value);
}

describe('React useToolbarToggleGroup / useToolbarToggleItem', () => {
    it('groupProps is role="group"', () => {
        const { result } = renderHook(() =>
            useToolbarToggleGroup({ type: 'single', value: undefined, onChange: () => {} })
        );
        expect(result.current.groupProps.role).toBe('group');
    });

    it("type='single' selects, switches, and deselects (aria-pressed reflects the one value)", () => {
        render(
            createElement(
                ToggleGroup,
                { type: 'single' },
                createElement(ToggleItem, { value: 'bold' }),
                createElement(ToggleItem, { value: 'italic' })
            )
        );
        expect(screen.getByTestId('bold').getAttribute('aria-pressed')).toBe('false');

        fireEvent.click(screen.getByTestId('bold'));
        expect(screen.getByTestId('bold').getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByTestId('italic').getAttribute('aria-pressed')).toBe('false');

        fireEvent.click(screen.getByTestId('italic')); // single → switches, clearing bold
        expect(screen.getByTestId('italic').getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByTestId('bold').getAttribute('aria-pressed')).toBe('false');

        fireEvent.click(screen.getByTestId('italic')); // re-select clears (deselectable)
        expect(screen.getByTestId('italic').getAttribute('aria-pressed')).toBe('false');
    });

    it("type='multiple' keeps a set (each value toggles independently)", () => {
        render(
            createElement(
                ToggleGroup,
                { type: 'multiple' },
                createElement(ToggleItem, { value: 'bold' }),
                createElement(ToggleItem, { value: 'italic' })
            )
        );

        fireEvent.click(screen.getByTestId('bold'));
        fireEvent.click(screen.getByTestId('italic'));
        expect(screen.getByTestId('bold').getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByTestId('italic').getAttribute('aria-pressed')).toBe('true');

        fireEvent.click(screen.getByTestId('bold')); // removes just bold from the set
        expect(screen.getByTestId('bold').getAttribute('aria-pressed')).toBe('false');
        expect(screen.getByTestId('italic').getAttribute('aria-pressed')).toBe('true');
    });

    it('useToolbarToggleItem is inert outside a group (pressed false, no-op onClick)', () => {
        const { result } = renderHook(() => useToolbarToggleItem('x'));
        expect(result.current.pressed).toBe(false);
        expect(result.current.itemProps['aria-pressed']).toBe(false);
        expect(result.current.itemProps.tabIndex).toBe(-1); // also no toolbar → not a tab stop
        expect(() => result.current.itemProps.onClick()).not.toThrow();
    });
});
