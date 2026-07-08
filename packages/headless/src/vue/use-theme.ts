import { onScopeDispose, ref, type Ref } from 'vue';
import { createThemeController, type ThemeControllerOptions, type ThemeMode, type ThemeSetting } from '../core';

export interface UseThemeReturn {
    /** The current SETTING (`'auto' | 'light' | 'dark'`) — reactive. */
    theme: Ref<ThemeSetting>;
    /** The RESOLVED theme on the DOM (`'light' | 'dark'`) — reactive; tracks the OS scheme in `auto`. */
    resolvedTheme: Ref<ThemeMode>;
    /** Set the setting (`'auto'` re-follows the OS), apply it, and persist. */
    setTheme: (setting: ThemeSetting) => void;
    /** Toggle the resolved theme light ⇄ dark (pins an explicit setting). */
    toggleTheme: () => void;
    /** Cycle `auto → light → dark → auto`. */
    cycleTheme: () => void;
}

/**
 * Vue binding for the headless {@link createThemeController} — light/dark with `auto` (live OS scheme)
 * and persistence, and the runtime-toggle invalidation fix baked in (see the core `theme.ts` /
 * `flushThemeInvalidation`). The controller applies the persisted / default theme immediately in setup
 * (before mount — no post-mount flash in a SPA) and tears down its OS-scheme listener on scope dispose.
 *
 * ```ts
 * const { resolvedTheme, cycleTheme } = useTheme({ storageKey: 'app-theme', default: 'auto' });
 * // <button @click="cycleTheme">{{ resolvedTheme }}</button>
 * ```
 *
 * SSR (Nuxt): construction is inert on the server, so pair it with an inline head script that sets the
 * `ori-theme_*` class before first paint to avoid a flash / hydration mismatch.
 */
export function useTheme(options: ThemeControllerOptions = {}): UseThemeReturn {
    const controller = createThemeController(options);
    const theme = ref(controller.get()) as Ref<ThemeSetting>;
    const resolvedTheme = ref(controller.resolved()) as Ref<ThemeMode>;

    const stop = controller.subscribe((setting, resolved) => {
        theme.value = setting;
        resolvedTheme.value = resolved;
    });

    onScopeDispose(() => {
        stop();
        controller.destroy();
    });

    return {
        theme,
        resolvedTheme,
        setTheme: (setting) => controller.set(setting),
        toggleTheme: () => controller.toggle(),
        cycleTheme: () => controller.cycle()
    };
}
