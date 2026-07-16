import { afterEach, describe, it, expect, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useToast } from '@oriui/headless/react';

// The React `useToast` projects the shared module-level toast queue into React with `useSyncExternalStore`.
// We drive it with `@testing-library/react`'s `renderHook` (no JSX): `result.current` reads the projected
// `{ toasts, ...actions }` and `act()` flushes each queue change into a re-render. This mirrors
// tests/react-adapter for the disclosure/tabs hooks and the Vue/Svelte `useToast` suites, and — crucially —
// pins the caching that keeps `useSyncExternalStore` from spinning on the queue's fresh-array snapshots.

afterEach(() => {
    // The queue is a module-level singleton, so its state leaks across tests — reset it (per NOTES.md). Don't
    // assert exact ids anywhere: the `seq` counter keeps climbing across tests.
    const { result } = renderHook(() => useToast());
    act(() => result.current.clear());
    cleanup();
});

describe('React useToast', () => {
    it('pushes a toast (string shorthand) and projects it into a re-render via act()', () => {
        const { result } = renderHook(() => useToast());
        expect(result.current.toasts).toHaveLength(0);

        act(() => {
            result.current.toast({ text: 'Saved', duration: 0 });
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0]?.text).toBe('Saved');
        expect(result.current.toasts[0]?.color).toBeUndefined(); // plain toast → no fallback color
        expect(result.current.toasts[0]?.closable).toBe(true); // queue default
    });

    it('severity shortcuts set the fallback color (success/danger/warn/info); an explicit color still wins', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
            result.current.success({ text: 's', duration: 0 });
            result.current.error({ text: 'e', duration: 0 });
            result.current.warn({ text: 'w', duration: 0 });
            result.current.info({ text: 'i', duration: 0 });
        });

        expect(result.current.toasts.map((t) => t.color)).toEqual(['success', 'danger', 'warn', 'info']);

        act(() => {
            result.current.success({ text: 'x', color: 'primary', duration: 0 }); // explicit color overrides the shortcut
        });
        expect(result.current.toasts.at(-1)?.color).toBe('primary');
    });

    it('push returns an id; dismiss removes that toast (unknown id is a no-op); clear empties the queue', () => {
        const { result } = renderHook(() => useToast());

        let id1 = 0;
        let id2 = 0;
        act(() => {
            id1 = result.current.toast({ text: 'one', duration: 0 });
            id2 = result.current.toast({ text: 'two', duration: 0 });
        });
        expect(result.current.toasts).toHaveLength(2);
        expect(id1).not.toBe(id2);

        act(() => result.current.dismiss(id1));
        expect(result.current.toasts.map((t) => t.id)).toEqual([id2]);

        act(() => result.current.dismiss(id1)); // already gone → no-op
        expect(result.current.toasts).toHaveLength(1);

        act(() => result.current.clear());
        expect(result.current.toasts).toHaveLength(0);
    });

    it('shares one module-level queue across all useToast() callers (a push in one shows in another)', () => {
        const a = renderHook(() => useToast());
        const b = renderHook(() => useToast());

        act(() => {
            a.result.current.success({ text: 'Saved', duration: 0 });
        });

        // The single singleton queue reaches every subscriber — b sees a's push.
        expect(b.result.current.toasts).toHaveLength(1);
        expect(b.result.current.toasts[0]?.color).toBe('success');
    });

    it('projects a referentially STABLE snapshot — same array between renders, a fresh one only on change', () => {
        const { result, rerender } = renderHook(() => useToast());

        const before = result.current.toasts;
        rerender();
        // No queue change → getSnapshot returns the SAME cached array (a fresh one each read would infinite-loop).
        expect(result.current.toasts).toBe(before);

        act(() => {
            result.current.toast({ text: 'hi', duration: 0 });
        });
        const after = result.current.toasts;
        expect(after).not.toBe(before); // a real change → a fresh cached array
        expect(after).toHaveLength(1);

        rerender();
        expect(result.current.toasts).toBe(after); // stable again once the change has settled
    });

    it('auto-dismisses after its duration (fake timers)', () => {
        vi.useFakeTimers();
        try {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.toast('bye'); // string shorthand → default 4000ms duration
            });
            expect(result.current.toasts).toHaveLength(1);

            act(() => {
                vi.advanceTimersByTime(4000);
            });
            expect(result.current.toasts).toHaveLength(0);
        } finally {
            vi.useRealTimers(); // restore at the END so a failure can't strand the next test on fake timers
        }
    });
});
