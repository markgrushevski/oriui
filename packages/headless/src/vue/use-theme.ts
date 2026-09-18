import { onScopeDispose, ref, type Ref } from 'vue'
import { createThemeController, type ThemeControllerOptions, type ThemeMode, type ThemeSetting } from '../core'

export interface UseThemeReturn {
    /** The current SETTING (`'auto' | 'light' | 'dark'`) — reactive. */
    theme: Ref<ThemeSetting>
    /** The RESOLVED theme on the DOM (`'light' | 'dark'`) — reactive; tracks the OS scheme in `auto`. */
    resolvedTheme: Ref<ThemeMode>
    /** Set the setting (`'auto'` re-follows the OS), apply it, and persist. */
    setTheme: (setting: ThemeSetting) => void
    /** Toggle the resolved theme light ⇄ dark (pins an explicit setting). */
    toggleTheme: () => void
    /** Cycle `auto → light → dark → auto`. */
    cycleTheme: () => void
    /**
     * Stop the OS-scheme listener for good. Called automatically when the effect scope that created the
     * composable is disposed (a component unmounting) — call it by hand ONLY when `useTheme` was called
     * outside a scope (module scope, a plain `.ts` module, a test), where there is nothing to hook.
     * Idempotent. Mirrors the Svelte twin's `ThemeStore.destroy`.
     */
    destroy: () => void
}

/**
 * Vue binding for the headless {@link createThemeController} — light/dark with `auto` (live OS scheme)
 * and persistence, and the runtime-toggle invalidation fix baked in (see the core `theme.ts` /
 * `flushThemeInvalidation`). The controller applies the persisted / default theme immediately in setup
 * (before mount — no post-mount flash in a SPA) and tears down its OS-scheme listener on scope dispose —
 * outside an effect scope there is nothing to dispose, so that caller owns {@link UseThemeReturn.destroy}.
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
    const controller = createThemeController(options)
    const theme = ref(controller.get()) as Ref<ThemeSetting>
    const resolvedTheme = ref(controller.resolved()) as Ref<ThemeMode>

    const stop = controller.subscribe((setting, resolved) => {
        theme.value = setting
        resolvedTheme.value = resolved
    })

    const destroy = (): void => {
        stop()
        controller.destroy()
    }

    // `onScopeDispose` no-ops outside an effect scope (module scope, a plain module, a test) — exactly the
    // case where the MutationObserver + matchMedia listener would otherwise leak for the life of the page.
    // `destroy` is the handle that caller disposes it with, so the miss is deliberate: pass `failSilently`
    // to suppress Vue's dev warning rather than telling a correct caller they did something wrong. Same
    // shape as the Svelte twin (`safeOnDestroy` + `destroy()`).
    onScopeDispose(destroy, true)

    return {
        theme,
        resolvedTheme,
        setTheme: (setting) => controller.set(setting),
        toggleTheme: () => controller.toggle(),
        cycleTheme: () => controller.cycle(),
        destroy
    }
}
