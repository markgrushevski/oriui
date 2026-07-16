import { afterEach, describe, it, expect, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useTheme } from '@oriui/headless/react';

// The React `useTheme` mirrors the core theme controller into React state — it is CLIENT-ONLY (localStorage
// / matchMedia / a DOM class), created in a mount effect so SSR renders a neutral default with no hydration
// mismatch. happy-dom has no real style engine, so the Chromium invalidation FIX is verified in a real
// browser (see tests/theme.test.ts); here we assert the React contract: the neutral-first render, the
// post-mount sync + subscription re-render (flushed via renderHook's own act / explicit act()), persistence,
// auto-resolution via matchMedia, and OS-scheme listener teardown on unmount. The matchMedia stub mirrors
// tests/theme.test.ts (happy-dom never fires a scheme change itself).

const KEY = 'ori-test-theme';

/** Stub matchMedia with a controllable `matches` + a captured `change` listener the test can fire. */
function stubMatchMedia(matches: boolean) {
    let listener: ((e: { matches: boolean }) => void) | undefined;
    const mql = {
        matches,
        addEventListener: vi.fn((_: string, l: (e: { matches: boolean }) => void) => {
            listener = l;
        }),
        removeEventListener: vi.fn()
    };
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => mql)
    );
    return {
        mql,
        fire(next: boolean) {
            mql.matches = next;
            listener?.({ matches: next });
        }
    };
}

afterEach(() => {
    // cleanup() unmounts every rendered hook, which runs our effect teardown (stop + controller.destroy).
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.documentElement.classList.remove('ori-theme_dark', 'ori-theme_light');
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');
    localStorage.clear();
});

describe('React useTheme', () => {
    it('exposes plain theme / resolvedTheme + setter functions, applying on mount', () => {
        stubMatchMedia(false);
        const { result } = renderHook(() => useTheme({ default: 'dark', storageKey: null }));

        expect(result.current.theme).toBe('dark');
        expect(result.current.resolvedTheme).toBe('dark');
        expect(typeof result.current.setTheme).toBe('function');
        expect(typeof result.current.toggleTheme).toBe('function');
        expect(typeof result.current.cycleTheme).toBe('function');
        // The mount effect created the controller, which applied the class.
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);
    });

    it('renders the NEUTRAL default first, then syncs to the persisted value post-mount (no hydration mismatch)', () => {
        stubMatchMedia(false);
        localStorage.setItem(KEY, 'dark'); // a client-only source the first render must NOT read

        const renders: string[] = [];
        const { result } = renderHook(() => {
            const api = useTheme({ default: 'light', storageKey: KEY });
            renders.push(api.resolvedTheme);
            return api;
        });

        // First render ignores localStorage/matchMedia (SSR-safe): the neutral resolution of default 'light'.
        expect(renders[0]).toBe('light');
        // The mount effect then reconciles to the controller's real, persisted value.
        expect(result.current.theme).toBe('dark');
        expect(result.current.resolvedTheme).toBe('dark');
    });

    it('setTheme / toggleTheme / cycleTheme re-render the plain values and update the DOM', () => {
        stubMatchMedia(false);
        const { result } = renderHook(() => useTheme({ default: 'light', storageKey: null }));

        act(() => result.current.setTheme('dark'));
        expect(result.current.theme).toBe('dark');
        expect(result.current.resolvedTheme).toBe('dark');
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);
        expect(document.documentElement.classList.contains('ori-theme_light')).toBe(false);

        act(() => result.current.toggleTheme()); // dark -> light, pins an explicit setting
        expect(result.current.theme).toBe('light');
        expect(result.current.resolvedTheme).toBe('light');

        act(() => result.current.cycleTheme()); // light -> dark
        expect(result.current.theme).toBe('dark');
    });

    it('persists the setting on change', () => {
        stubMatchMedia(false);
        const { result } = renderHook(() => useTheme({ default: 'light', storageKey: KEY }));

        act(() => result.current.setTheme('dark'));
        expect(localStorage.getItem(KEY)).toBe('dark');
    });

    it('resolves auto against the OS scheme and re-renders on a live scheme change', () => {
        const media = stubMatchMedia(false); // auto -> light
        const { result } = renderHook(() => useTheme({ default: 'auto', storageKey: null }));

        expect(result.current.theme).toBe('auto');
        expect(result.current.resolvedTheme).toBe('light');

        act(() => media.fire(true)); // OS flips to dark; the controller re-applies and notifies React
        expect(result.current.resolvedTheme).toBe('dark');
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);

        act(() => result.current.setTheme('light')); // pin explicit — later scheme flips are ignored
        act(() => media.fire(false));
        act(() => media.fire(true));
        expect(result.current.resolvedTheme).toBe('light');
    });

    it('setters are stable across re-renders (useCallback)', () => {
        stubMatchMedia(false);
        const { result, rerender } = renderHook(() => useTheme({ default: 'light', storageKey: null }));

        const before = result.current.setTheme;
        act(() => result.current.setTheme('dark'));
        rerender();
        expect(result.current.setTheme).toBe(before);
    });

    it('tears the controller down (OS-scheme listener) on unmount', () => {
        const media = stubMatchMedia(false);
        const { unmount } = renderHook(() => useTheme({ default: 'auto', storageKey: null }));

        unmount();
        expect(media.mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
});
