import { readable, type Readable } from 'svelte/store'
import { createThemeController, type ThemeControllerOptions, type ThemeMode, type ThemeSetting } from '../core'
import { safeOnDestroy } from './use-store'

/** The reactive value a {@link useTheme} store carries. */
export interface ThemeState {
    /** The current SETTING (`'auto' | 'light' | 'dark'`). */
    theme: ThemeSetting
    /** The RESOLVED theme on the DOM (`'light' | 'dark'`); tracks the OS scheme in `auto`. */
    resolvedTheme: ThemeMode
}

export interface ThemeStore extends Readable<ThemeState> {
    /** Set the setting (`'auto'` re-follows the OS), apply it, and persist. */
    setTheme(setting: ThemeSetting): void
    /** Toggle the resolved theme light ⇄ dark (pins an explicit setting). */
    toggleTheme(): void
    /** Cycle `auto → light → dark → auto`. */
    cycleTheme(): void
    /**
     * Stop the OS-scheme listener for good. Called automatically when the component that created the
     * store is destroyed — call it by hand ONLY when `useTheme` was called outside component init
     * (module scope, a plain `.ts` module, a test), where there is no lifecycle to hook. Idempotent.
     */
    destroy(): void
}

/**
 * Svelte twin of the Vue `useTheme` — the headless {@link createThemeController} as a readable store with
 * imperative setters, and the runtime-toggle invalidation fix baked in (see the core `theme.ts` /
 * `flushThemeInvalidation`). The controller is created (and applies the persisted / default theme)
 * eagerly on call, and lives as long as the component that called it (see {@link ThemeStore.destroy}).
 *
 * ```svelte
 * <script>
 *   const theme = useTheme({ storageKey: 'app-theme', default: 'auto' });
 * </script>
 * <button on:click={theme.cycleTheme}>{$theme.resolvedTheme}</button>
 * ```
 */
export function useTheme(options: ThemeControllerOptions = {}): ThemeStore {
    const controller = createThemeController(options)
    const snapshot = (): ThemeState => ({ theme: controller.get(), resolvedTheme: controller.resolved() })

    const store = readable<ThemeState>(snapshot(), (set) => {
        // Re-seed on every (re)start: the controller keeps running while the store is dormant, so the
        // theme may have moved on since the last subscriber left (an OS flip, or `setTheme` from a
        // sibling). Same idiom as `connectStore`.
        set(snapshot())
        return controller.subscribe((theme, resolvedTheme) => set({ theme, resolvedTheme }))
    })

    // The controller's lifetime follows the COMPONENT, never the store's subscriber count. An `{#if}`
    // around markup that reads `$theme` takes the count to 0 and back to 1, and tearing down there would
    // leave `auto` with no matchMedia listener for the rest of the component's life — the store would
    // re-subscribe to a dead controller and silently stop following the OS. A refcount cannot tell those
    // two cases apart (a hidden branch and a gone component both read 0), so the signal has to come from
    // the framework. `safeOnDestroy` no-ops outside component init (module scope, a plain module, a
    // test) — that caller owns the controller, and `destroy` is the handle it disposes it with.
    const destroy = (): void => controller.destroy()
    safeOnDestroy(destroy)

    return {
        subscribe: store.subscribe,
        setTheme: (setting) => controller.set(setting),
        toggleTheme: () => controller.toggle(),
        cycleTheme: () => controller.cycle(),
        destroy
    }
}
