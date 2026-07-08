import { readable, type Readable } from 'svelte/store';
import { createThemeController, type ThemeControllerOptions, type ThemeMode, type ThemeSetting } from '../core';

/** The reactive value a {@link useTheme} store carries. */
export interface ThemeState {
    /** The current SETTING (`'auto' | 'light' | 'dark'`). */
    theme: ThemeSetting;
    /** The RESOLVED theme on the DOM (`'light' | 'dark'`); tracks the OS scheme in `auto`. */
    resolvedTheme: ThemeMode;
}

export interface ThemeStore extends Readable<ThemeState> {
    /** Set the setting (`'auto'` re-follows the OS), apply it, and persist. */
    setTheme(setting: ThemeSetting): void;
    /** Toggle the resolved theme light ⇄ dark (pins an explicit setting). */
    toggleTheme(): void;
    /** Cycle `auto → light → dark → auto`. */
    cycleTheme(): void;
}

/**
 * Svelte twin of the Vue `useTheme` — the headless {@link createThemeController} as a readable store with
 * imperative setters, and the runtime-toggle invalidation fix baked in (see the core `theme.ts` /
 * `flushThemeInvalidation`). The controller is created (and applies the persisted / default theme)
 * eagerly on call; its OS-scheme listener tears down with the store's last subscriber.
 *
 * ```svelte
 * <script>
 *   const theme = useTheme({ storageKey: 'app-theme', default: 'auto' });
 * </script>
 * <button on:click={theme.cycleTheme}>{$theme.resolvedTheme}</button>
 * ```
 */
export function useTheme(options: ThemeControllerOptions = {}): ThemeStore {
    const controller = createThemeController(options);

    const store = readable<ThemeState>({ theme: controller.get(), resolvedTheme: controller.resolved() }, (set) => {
        const stop = controller.subscribe((theme, resolvedTheme) => set({ theme, resolvedTheme }));
        return () => {
            stop();
            controller.destroy();
        };
    });

    return {
        subscribe: store.subscribe,
        setTheme: (setting) => controller.set(setting),
        toggleTheme: () => controller.toggle(),
        cycleTheme: () => controller.cycle()
    };
}
