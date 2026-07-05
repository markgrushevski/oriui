import { derived, readable, type Readable } from 'svelte/store';
import { observeTheme, resolveToken } from '../core';
import { toReadable, type MaybeReactive } from './use-store';

/**
 * Reactive bridge to a resolved `--ori-*` token — the Svelte twin of the Vue `useToken`, for consumers
 * that paint outside the CSS cascade (Konva/canvas/WebGL, charts) but must follow the active skin.
 * Wraps the core `resolveToken` probe (see its JSDoc for why `getComputedStyle().getPropertyValue('--x')`
 * is not enough) in a readable store: pass a plain string for a fixed token or a store to re-resolve on
 * token changes; theme changes re-resolve via the core `observeTheme` (skin class/style toggles + OS
 * scheme flips). Colors-only MVP: the token must resolve to a `<color>`. Lazy like every Svelte store —
 * resolution and the theme observer start with the first subscriber and tear down with the last; on the
 * server the store stays `''` (the core APIs are inert without `document`).
 */
export function useToken(token: MaybeReactive<string>): Readable<string> {
    const token$ = toReadable(token);

    return readable('', (set) => {
        let current = '';
        const unsubscribeToken = token$.subscribe((next) => {
            current = next;
            set(resolveToken(next));
        });
        const unsubscribeTheme = observeTheme(() => set(resolveToken(current)));

        return () => {
            unsubscribeToken();
            unsubscribeTheme();
        };
    });
}

/**
 * Sugar over {@link useToken} for the color roles: `useThemeColor('primary')` resolves
 * `--ori-color-primary` (reactive when `color` is a store).
 */
export function useThemeColor(color: MaybeReactive<string>): Readable<string> {
    return useToken(derived(toReadable(color), (role) => `--ori-color-${role}`));
}
