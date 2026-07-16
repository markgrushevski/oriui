import { useCallback, useEffect, useRef, useState } from 'react';
import { createThemeController } from '../core';
import type { ThemeController, ThemeControllerOptions, ThemeMode, ThemeSetting } from '../core';

export interface UseThemeReturn {
    /** The current SETTING (`'auto' | 'light' | 'dark'`) — plain value, re-rendered on change. */
    theme: ThemeSetting;
    /** The RESOLVED theme on the DOM (`'light' | 'dark'`); tracks the OS scheme in `auto`. */
    resolvedTheme: ThemeMode;
    /** Set the setting (`'auto'` re-follows the OS), apply it, and persist. */
    setTheme: (setting: ThemeSetting) => void;
    /** Toggle the resolved theme light ⇄ dark (pins an explicit setting). */
    toggleTheme: () => void;
    /** Cycle `auto → light → dark → auto`. */
    cycleTheme: () => void;
}

// The neutral, SSR-safe resolution of a setting WITHOUT touching matchMedia — `auto`/`light` render as
// `light`, matching what the core controller resolves to when it has no `document` (see theme.ts
// `resolve` / `prefersDark`). This is what the server and the first client render both show, so the
// controller's real (persisted / OS-resolved) value only lands in a post-mount `useEffect` — no
// hydration mismatch.
const neutralResolved = (setting: ThemeSetting): ThemeMode => (setting === 'dark' ? 'dark' : 'light');

/**
 * React twin of the Vue / Svelte `useTheme` — the headless {@link createThemeController} (light/dark with
 * `auto` following the OS scheme, persistence, and the runtime-toggle invalidation fix) mirrored into
 * React state. Returns plain values (`theme` / `resolvedTheme`) plus stable imperative setters, member-
 * for-member with the Vue return. Theming is DOM + state, so — unlike `useDisclosure` — there is no
 * swappable adapter; this wraps the core controller directly.
 *
 * CLIENT-ONLY: the controller reads `localStorage`, queries `matchMedia`, and flips a DOM class, so it is
 * created and started in a mount `useEffect` (never during render or on the server). The first render
 * shows the neutral default (`options.default ?? 'auto'`, resolving `auto` to `light`); the effect then
 * syncs React to the controller's real value and subscribes for later changes, tearing the OS-scheme
 * listener down on unmount. Options are read once at mount — init-only, matching the Vue/Svelte twins.
 *
 * ```tsx
 * const { theme, resolvedTheme, cycleTheme } = useTheme({ storageKey: 'app-theme', default: 'auto' });
 * // <button onClick={cycleTheme}>{theme} ({resolvedTheme})</button>
 * ```
 *
 * SSR (Next): the hook renders the neutral default on the server; pair it with an inline head script that
 * sets the `ori-theme_*` class before first paint to avoid a flash / hydration mismatch (see the docs).
 */
export function useTheme(options: ThemeControllerOptions = {}): UseThemeReturn {
    // Capture options once (init-only, like the Vue/Svelte twins) so a fresh options object per render
    // never recreates the controller; the mount effect reads this first-render value.
    const optionsRef = useRef(options);
    const controllerRef = useRef<ThemeController | null>(null);

    const [state, setState] = useState<{ theme: ThemeSetting; resolvedTheme: ThemeMode }>(() => {
        const setting = optionsRef.current.default ?? 'auto';
        return { theme: setting, resolvedTheme: neutralResolved(setting) };
    });

    useEffect(() => {
        // Client-only: creating the controller applies the persisted / default theme and starts the
        // OS-scheme listener. Sync React to its real state immediately (reconciling the neutral SSR
        // default), then keep in step via its subscription.
        const controller = createThemeController(optionsRef.current);
        controllerRef.current = controller;
        setState({ theme: controller.get(), resolvedTheme: controller.resolved() });
        const stop = controller.subscribe((theme, resolvedTheme) => setState({ theme, resolvedTheme }));

        return () => {
            stop();
            controller.destroy();
            controllerRef.current = null;
        };
    }, []);

    // Setters delegate to the live controller; they no-op before mount (controller not yet created) and
    // after unmount, so a stray call can never touch the DOM off-screen. `?.` guards the null ref.
    const setTheme = useCallback((setting: ThemeSetting) => controllerRef.current?.set(setting), []);
    const toggleTheme = useCallback(() => controllerRef.current?.toggle(), []);
    const cycleTheme = useCallback(() => controllerRef.current?.cycle(), []);

    return { theme: state.theme, resolvedTheme: state.resolvedTheme, setTheme, toggleTheme, cycleTheme };
}
