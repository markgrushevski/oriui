import { afterEach, describe, it, expect, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useDisclosure, useTabs, normalizeProps, type TabItem } from '@oriui/headless/react';

// The React adapter is pure TS/hooks over the shared `../core` engine — the machine hooks bridge to React
// via `useSyncExternalStore`, so we exercise them with `@testing-library/react`'s `renderHook` (no JSX):
// `result.current` reads the projected control and `act()` flushes state changes. This mirrors
// tests/svelte-adapter for the Svelte side and is the executable proof that the machine bridge + the React
// prop normalizer (compound-event / camelCase-attribute casing) are correct. `useDisclosure` resolves to
// the native adapter here (no `<OriHeadlessProvider>` in the tree).

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});

describe('React normalizeProps', () => {
    it('renames compound events + camelCase attributes, drops undefined, passes onClick/aria/data through', () => {
        const fn = () => {};
        const out = normalizeProps.button({
            onClick: fn,
            onKeydown: fn,
            tabindex: 0,
            className: 'x',
            'aria-label': 'a',
            'data-state': 'open',
            title: undefined
        });

        expect(out.onClick).toBe(fn); // single-word handler: unchanged
        expect(out.onKeyDown).toBe(fn); // compound: onKeydown -> onKeyDown
        expect('onKeydown' in out).toBe(false);
        expect(out.tabIndex).toBe(0); // tabindex -> tabIndex
        expect('tabindex' in out).toBe(false);
        expect(out.className).toBe('x'); // already React-style, kept
        expect(out['aria-label']).toBe('a');
        expect(out['data-state']).toBe('open');
        expect('title' in out).toBe(false); // undefined dropped
    });
});

describe('React useDisclosure (native fallback)', () => {
    it('starts closed with the WAI-ARIA wiring, ids derived from the base id', () => {
        const { result } = renderHook(() => useDisclosure({ id: 'test' }));

        expect(result.current.open).toBe(false);

        const trigger = result.current.triggerProps;
        expect(trigger.id).toBe('ori-test-trigger');
        expect(trigger.type).toBe('button');
        expect(trigger['aria-controls']).toBe('ori-test-content');
        expect(trigger['aria-expanded']).toBe(false);
        // The core emits `onClick`; React keeps that casing, so it survives the normalizer untouched.
        expect(typeof trigger.onClick).toBe('function');

        const content = result.current.contentProps;
        expect(content.id).toBe('ori-test-content');
        expect(content.role).toBe('region');
        expect(content['aria-labelledby']).toBe('ori-test-trigger');
        expect(content.hidden).toBe(true);
    });

    it('setOpen / toggle re-render and re-project the prop bags', () => {
        const { result } = renderHook(() => useDisclosure({ id: 'x' }));

        act(() => result.current.setOpen(true));
        expect(result.current.open).toBe(true);
        expect(result.current.triggerProps['aria-expanded']).toBe(true);
        expect(result.current.contentProps.hidden).toBe(false);

        act(() => result.current.toggle());
        expect(result.current.open).toBe(false);
    });

    it('a disabled disclosure ignores toggle and flags the trigger', () => {
        const { result } = renderHook(() => useDisclosure({ id: 'd', disabled: true }));

        act(() => result.current.toggle());
        expect(result.current.open).toBe(false);

        const trigger = result.current.triggerProps;
        expect(trigger.disabled).toBe(true);
        expect(trigger['data-disabled']).toBe('');
    });

    it('keeps the same machine across re-renders — open state survives a rerender', () => {
        const { result, rerender } = renderHook((props: { id: string }) => useDisclosure(props), {
            initialProps: { id: 'stable' }
        });

        act(() => result.current.setOpen(true));
        expect(result.current.open).toBe(true);

        rerender({ id: 'stable' });
        expect(result.current.open).toBe(true); // the service was created once (useRef), not per render
    });
});

describe('React useTabs', () => {
    const TABS: TabItem[] = [{ value: 'a' }, { value: 'b' }, { value: 'c', disabled: true }, { value: 'd' }];

    it('resolves to the first enabled tab when value is unset', () => {
        const { result } = renderHook(() => useTabs({ tabs: TABS, value: undefined }));
        expect(result.current.selectedValue).toBe('a');
    });

    it('recovers to the first enabled tab when the bound value is disabled', () => {
        const { result } = renderHook(() => useTabs({ tabs: TABS, value: 'c' }));
        expect(result.current.selectedValue).toBe('a');
    });

    it('tablist / tab / panel bags carry the WAI-ARIA tabs wiring in React casing', () => {
        const { result } = renderHook(() => useTabs({ tabs: TABS, value: 'b', label: 'Views' }));

        const list = result.current.tablistProps;
        expect(list.role).toBe('tablist');
        expect(list['aria-orientation']).toBe('horizontal');
        expect(list['aria-label']).toBe('Views');
        expect(typeof list.onKeyDown).toBe('function');

        const selected = result.current.getTabProps(TABS[1]!, 1);
        expect(selected.role).toBe('tab');
        expect(selected.type).toBe('button');
        expect(selected['aria-selected']).toBe('true');
        expect(selected.tabIndex).toBe(0);
        expect(selected['aria-controls']).toBe(selected.id.replace('-tab-', '-panel-'));
        expect(typeof selected.onClick).toBe('function');

        const unselected = result.current.getTabProps(TABS[0]!, 0);
        expect(unselected['aria-selected']).toBe('false');
        expect(unselected.tabIndex).toBe(-1);

        const panel = result.current.getPanelProps(TABS[1]!, 1);
        expect(panel.role).toBe('tabpanel');
        expect(panel.hidden).toBe(false);
        expect(result.current.getPanelProps(TABS[0]!, 0).hidden).toBe(true);
    });

    it('select commits an enabled tab and ignores a disabled one', () => {
        const onChange = vi.fn();
        const { result } = renderHook(() => useTabs({ tabs: TABS, value: 'a', onChange }));

        act(() => result.current.select(TABS[1]!));
        expect(onChange).toHaveBeenCalledWith('b');

        act(() => result.current.select(TABS[2]!)); // disabled → no-op
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('onKeyDown roves real focus by DOM order, skipping disabled and wrapping', () => {
        const { result } = renderHook(() => useTabs({ tabs: TABS, value: 'a' }));

        // A real tablist DOM in tab order: a, b, c(disabled), d.
        const root = document.createElement('div');
        const buttons = TABS.map((tab) => {
            const button = document.createElement('button');
            button.setAttribute('role', 'tab');
            if (tab.disabled) button.disabled = true;
            root.append(button);
            return button;
        });
        document.body.append(root);
        const [a, b, , d] = buttons;

        const press = (target: HTMLElement, key: string) =>
            result.current.tablistProps.onKeyDown({
                key,
                currentTarget: root,
                target,
                preventDefault: () => {}
            } as unknown as ReactKeyboardEvent<HTMLElement>);

        a!.focus();
        press(a!, 'ArrowRight');
        expect(document.activeElement).toBe(b);

        press(b!, 'ArrowRight'); // skips disabled c → d
        expect(document.activeElement).toBe(d);

        press(d!, 'ArrowRight'); // last → wraps to first
        expect(document.activeElement).toBe(a);
    });

    it('reacts to a changed controlled value on rerender', () => {
        const { result, rerender } = renderHook(
            (props: { value: string }) => useTabs({ tabs: TABS, value: props.value }),
            {
                initialProps: { value: 'a' }
            }
        );

        expect(result.current.selectedValue).toBe('a');

        rerender({ value: 'd' });
        expect(result.current.selectedValue).toBe('d');
        expect(result.current.getPanelProps(TABS[0]!, 0).hidden).toBe(true);
        expect(result.current.getPanelProps(TABS[3]!, 3).hidden).toBe(false);
    });
});
