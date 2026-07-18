import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { render, renderHook, act, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { useToken, useThemeColor } from '@oriui/headless/react';

// The React token bridge resolves --ori-* custom properties to their COMPUTED values from JS (for canvas /
// Konva / chart consumers) via the core hidden-probe pipeline — client-only, so it resolves in an effect,
// holds the value in `useState`, and is `''` until mounted. happy-dom runs the whole probe pipeline
// natively (var() resolution through `color`, alias chains, class-driven overrides, MutationObserver on
// attribute changes — verified in tests/token.test.ts), so everything below runs REAL against the shared
// core. `@testing-library/react` flushes effects inside act(), so `renderHook` already reflects the mounted
// value; the theme-observer leg fires async (MutationObserver delivery), so we settle inside act() first.
// This is the React twin of the Vue / Svelte useToken suites in tests/token.test.ts.

const BRAND_LIGHT = 'rgb(10, 20, 30)';
const BRAND_DARK = 'rgb(200, 100, 50)';
const ACCENT = 'rgb(1, 128, 64)';

let sheet: HTMLStyleElement;

beforeEach(() => {
    sheet = document.createElement('style');
    sheet.textContent = `
        :root {
            --ori-test-brand-source: ${BRAND_LIGHT};
            --ori-test-brand: var(--ori-test-brand-source);
            --ori-color-testrole: ${ACCENT};
        }
        .dark {
            --ori-test-brand-source: ${BRAND_DARK};
        }
    `;
    document.head.appendChild(sheet);
});

afterEach(() => {
    cleanup();
    sheet.remove();
    document.documentElement.classList.remove('dark');
    vi.restoreAllMocks();
});

/** MutationObserver delivery is async — settle a macrotask before asserting observer-driven updates. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('React useToken', () => {
    it('is "" on the first (SSR-consistent) render and resolves through the var() chain after the mount effect', () => {
        // Capture the value across renders: the first render (pre-effect) must be the neutral default,
        // proving server + first client render agree; the mount effect then resolves and re-renders.
        const seen: string[] = [];
        function Probe() {
            seen.push(useToken('--ori-test-brand'));
            return null;
        }

        act(() => {
            render(createElement(Probe));
        });

        expect(seen[0]).toBe(''); // neutral default — no hydration mismatch
        expect(seen.at(-1)).toBe(BRAND_LIGHT); // resolved through the var() alias chain after mount
    });

    it('resolves the token to its computed color (native core, resolved after mount)', () => {
        const { result } = renderHook(() => useToken('--ori-test-brand'));
        expect(result.current).toBe(BRAND_LIGHT);
    });

    it('re-resolves when the theme observer fires (:root class toggle)', async () => {
        const { result } = renderHook(() => useToken('--ori-test-brand'));
        expect(result.current).toBe(BRAND_LIGHT);

        // Toggling `.dark` repoints --ori-test-brand-source; the hook's MutationObserver re-resolves.
        await act(async () => {
            document.documentElement.classList.add('dark');
            await settle();
        });
        expect(result.current).toBe(BRAND_DARK);
    });

    it('re-resolves when the token argument changes on rerender', () => {
        const { result, rerender } = renderHook((props: { token: string }) => useToken(props.token), {
            initialProps: { token: '--ori-test-brand' }
        });
        expect(result.current).toBe(BRAND_LIGHT);

        rerender({ token: '--ori-color-testrole' }); // effect dep changes → re-resolve
        expect(result.current).toBe(ACCENT);
    });

    it('returns "" for an unresolvable token (warns once in dev)', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {}); // silence the dev-mode unresolvable warning
        const { result } = renderHook(() => useToken('--ori-test-definitely-missing'));
        expect(result.current).toBe('');
    });

    it('tears the theme observer down on unmount', () => {
        // The effect cleanup calls observeTheme's unsubscribe, which disconnects the MutationObserver.
        const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
        const { unmount } = renderHook(() => useToken('--ori-test-brand'));

        unmount();
        expect(disconnect).toHaveBeenCalled();
    });
});

describe('React useThemeColor', () => {
    it('resolves --ori-color-<role>', () => {
        const { result } = renderHook(() => useThemeColor('testrole'));
        expect(result.current).toBe(ACCENT);
    });

    it('re-expands and re-resolves when the role argument changes (missing role → "")', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {}); // the missing role warns once in dev
        const { result, rerender } = renderHook((props: { role: string }) => useThemeColor(props.role), {
            initialProps: { role: 'testrole' }
        });
        expect(result.current).toBe(ACCENT);

        rerender({ role: 'testrole-missing' }); // sugar re-expands to --ori-color-testrole-missing → unresolvable
        expect(result.current).toBe('');
    });
});
