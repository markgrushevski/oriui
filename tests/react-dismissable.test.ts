import { afterEach, describe, it, expect, vi } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useDismissable } from '@oriui/headless/react';

// The React dismiss layer attaches `document` pointerdown / focusin CAPTURE listeners while `enabled`, and
// calls `onDismiss()` when the interaction lands OUTSIDE the registered element(s). This mirrors
// tests/dismissable.test.ts (Vue/Svelte) — dispatching real events inside vs outside the element — plus the
// React-specific bits: options come as a plain object (no getter / store), the effect re-subscribes only when
// enabled / the strategy set changes, and a `latest`-options ref keeps the listener reading the current
// `onDismiss` / `elements()` across re-renders without re-subscribing. (Menu outside-click and Combobox
// focus-out are covered end-to-end by their component suites.)

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});

describe('React useDismissable', () => {
    it('pointerdown outside dismisses; inside does not', () => {
        const inside = document.createElement('div');
        const outside = document.createElement('div');
        document.body.append(inside, outside);
        const onDismiss = vi.fn();

        renderHook(() =>
            useDismissable({ enabled: true, elements: () => [inside], onDismiss, pointerDownOutside: true })
        );

        inside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled();

        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('only the requested strategy is wired (focusOutside → ignores pointerdown)', () => {
        const outside = document.createElement('div');
        document.body.append(outside);
        const onDismiss = vi.fn();

        renderHook(() => useDismissable({ enabled: true, elements: () => [], onDismiss, focusOutside: true }));

        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled(); // pointerdown not wired

        outside.dispatchEvent(new Event('focusin', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('attaches only while enabled — a rerender flipping enabled attaches / detaches the listener', () => {
        const outside = document.createElement('div');
        document.body.append(outside);
        const onDismiss = vi.fn();

        const { rerender } = renderHook(
            (enabled: boolean) => useDismissable({ enabled, elements: () => [], onDismiss, pointerDownOutside: true }),
            { initialProps: false }
        );

        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled(); // disabled: nothing attached

        rerender(true);
        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1);

        rerender(false);
        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1); // detached
    });

    it('reads the latest onDismiss after a rerender — no stale closure, no re-subscribe', () => {
        const outside = document.createElement('div');
        document.body.append(outside);
        const first = vi.fn();
        const second = vi.fn();

        const { rerender } = renderHook(
            (onDismiss: () => void) =>
                useDismissable({ enabled: true, elements: () => [], onDismiss, pointerDownOutside: true }),
            { initialProps: first }
        );

        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(first).toHaveBeenCalledTimes(1);

        // enabled / strategy unchanged → the subscribe effect does NOT re-run; the ref carries the new callback.
        rerender(second);
        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(second).toHaveBeenCalledTimes(1);
        expect(first).toHaveBeenCalledTimes(1); // the stale callback is never invoked again
    });

    it('reflects a changed elements() after a rerender (fresh element set, no re-subscribe)', () => {
        const el = document.createElement('div');
        document.body.append(el);
        const onDismiss = vi.fn();

        const { rerender } = renderHook(
            (registered: boolean) =>
                useDismissable({
                    enabled: true,
                    elements: () => (registered ? [el] : []),
                    onDismiss,
                    pointerDownOutside: true
                }),
            { initialProps: false }
        );

        el.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1); // el is outside (not registered) → dismiss

        rerender(true); // el is now one of the overlay's own elements
        el.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1); // inside now → no further dismiss
    });

    it('listens in the capture phase — an outside stopPropagation cannot defeat the dismiss', () => {
        const outside = document.createElement('div');
        outside.addEventListener('pointerdown', (event) => event.stopPropagation()); // bubble phase (runs later)
        document.body.append(outside);
        const onDismiss = vi.fn();

        renderHook(() => useDismissable({ enabled: true, elements: () => [], onDismiss, pointerDownOutside: true }));

        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1); // the capture-phase document listener already fired
    });

    it('removes the listeners on unmount', () => {
        const outside = document.createElement('div');
        document.body.append(outside);
        const onDismiss = vi.fn();

        const { unmount } = renderHook(() =>
            useDismissable({ enabled: true, elements: () => [], onDismiss, pointerDownOutside: true })
        );
        unmount();

        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled();
    });
});
