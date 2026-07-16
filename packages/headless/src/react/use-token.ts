import { useEffect, useState } from 'react';
import { observeTheme, resolveToken } from '../core';

/**
 * Reactive bridge to a resolved `--ori-*` token — the React twin of the Vue / Svelte `useToken`, for
 * consumers that paint outside the CSS cascade (Konva/canvas/WebGL, charts) but must follow the active
 * skin. It wraps the core `resolveToken` probe (see its JSDoc for why
 * `getComputedStyle().getPropertyValue('--x')` is not enough — oriUI's aliases chain, so that hands back
 * the `var()` chain, not a color).
 *
 * Client-only by construction: `resolveToken` (getComputedStyle) and the `observeTheme` MutationObserver
 * both touch the DOM, so they never run during render — resolution happens in a `useEffect` and the value
 * is held in `useState`. The value is the neutral default `''` during SSR and the first client render (so
 * server and first client render agree — no hydration mismatch), resolves right after mount, then
 * re-resolves on every theme change — skin class/style toggles AND OS `prefers-color-scheme` flips — via
 * the core `observeTheme`, and whenever the `token` argument changes (it is an effect dependency; a plain
 * string is the React-idiomatic reactive input, mirroring the Vue getter / Svelte store). The observer is
 * torn down on unmount — and before each re-resolve — through the effect's cleanup. Colors-only MVP: the
 * token must resolve to a `<color>`; an unresolvable one stays `''` (and warns once in dev — see core).
 *
 * (Deliberately `useEffect` + `useState`, not `useSyncExternalStore` like the machine hooks: `resolveToken`
 * returns a fresh string on every call — it could not serve as the referentially-stable `getSnapshot` that
 * store hook demands — and this mount/observe/teardown lifecycle mirrors the twins' `onMounted` / readable
 * start-fn exactly.)
 *
 * Bridging into a canvas engine (Konva, ECharts, …): create the engine in an effect, then seed + re-push
 * from a second effect keyed on the resolved value — `''` (SSR/unresolved) maps to the engine's own default:
 *
 * ```tsx
 * const brand = useThemeColor('primary'); // '' until mounted (SSR-safe), then the resolved color
 * useEffect(() => {
 *     engineRef.current?.setColor(brand || null); // seed on mount, re-push on every theme flip
 * }, [brand]);
 * ```
 */
export function useToken(token: string): string {
    // Neutral default '' during SSR and the first client render (they must agree — no hydration mismatch);
    // the DOM probe only runs after mount, in the effect below.
    const [value, setValue] = useState('');

    useEffect(() => {
        const resolve = (): void => setValue(resolveToken(token));
        resolve(); // resolve on mount + whenever `token` changes (it is a dependency of this effect)
        return observeTheme(resolve); // re-resolve on theme flips; the returned unsubscribe tears the observer down
    }, [token]);

    return value;
}

/**
 * Sugar over {@link useToken} for the color roles: `useThemeColor('primary')` resolves
 * `--ori-color-primary` (re-resolves when `color` changes, like any React prop).
 */
export function useThemeColor(color: string): string {
    return useToken(`--ori-color-${color}`);
}
