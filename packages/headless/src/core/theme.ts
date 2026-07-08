/**
 * Theme controller — set the active light/dark theme and keep it correct across RUNTIME toggles.
 *
 * Two jobs, one small module:
 *  1. {@link applyTheme} — flip the `ori-theme_{light,dark}` class on the theme root, the way oriUI's
 *     skins expect (see `@oriui/css` `_themes-color-tokens.css`).
 *  2. work around a Chromium style-invalidation bug that {@link flushThemeInvalidation} documents:
 *     without it, styled components keep the PREVIOUS theme's colours after a runtime toggle.
 *
 * {@link createThemeController} layers `auto` (follow the OS scheme) + persistence on top, reusing the
 * core {@link observeTheme} matchMedia plumbing. Every API is SSR-safe (inert without `document`) and
 * dependency-free — framework adapters (`./vue`, `./svelte` `useTheme`) are thin reactive wrappers.
 */

/** The resolved, applied theme — exactly one of these is ever on the DOM. */
export type ThemeMode = 'light' | 'dark';

/** The user-facing SETTING: a fixed theme, or `auto` to follow `prefers-color-scheme` live. */
export type ThemeSetting = ThemeMode | 'auto';

export interface ApplyThemeOptions {
    /** Element the `ori-theme_*` class is toggled on. Default: `document.documentElement` (the `:root` skin). */
    root?: HTMLElement;
    /**
     * Element whose subtree is force-restyled to defeat the invalidation bug (see
     * {@link flushThemeInvalidation}). Default: `document.body` — gentler than the root (no scrollbar /
     * scroll churn) and still an ancestor of every styled component. Pass a tighter app-root to scope it.
     */
    flushTarget?: HTMLElement | null;
    /** Class prefix; the applied class is `${classPrefix}${mode}`. Default `'ori-theme_'`. */
    classPrefix?: string;
}

/**
 * Force a from-scratch style + paint resolution of `el`'s subtree.
 *
 * WHY: Chromium misses a style invalidation when an inherited custom property changes via an ancestor
 * class toggle (the theme flip) AND descendants BAKE a resolved alias into an element-scoped custom
 * property consumed through a `var()` chain — which is exactly how every styled oriUI component reads
 * its colour (`--ori-color` / `--ori-color-text` baked on the element → `--ori-variant-*` → the
 * longhand). The element's cached computed style is not marked dirty, so it — and its paint — keep the
 * PREVIOUS theme's colour until the box is rebuilt. Neither a forced reflow, a repeated class toggle,
 * nor `@property` registration re-resolves it; only rebuilding the box does. A `display:none`
 * round-trip with a forced reflow between the two writes destroys and recreates the box tree (the
 * cheapest thing short of remounting the subtree), so the components re-resolve against the new theme.
 *
 * Applied SYNCHRONOUSLY in the same task as the class flip, so the toggle's own frame paints correctly.
 * No-op when `el` is null (nothing rendered to flush yet).
 */
export function flushThemeInvalidation(el: HTMLElement | null | undefined): void {
    if (!el) return;
    const prev = el.style.display;
    el.style.display = 'none';
    // Force layout with the element gone, so restoring display is a SECOND style pass (a box rebuild),
    // not a no-op the engine coalesces away. This reflush is the whole point — do not remove it.
    void el.offsetHeight;
    el.style.display = prev;
}

/**
 * Apply a resolved theme: set `ori-theme_{mode}` (removing the opposite) on the root, then flush the
 * invalidation so styled components repaint in the new theme. This is the low-level primitive — call it
 * wherever you flip the theme (or use {@link createThemeController} / the `useTheme` adapters for
 * `auto` + persistence on top). SSR-safe: a no-op without `document`.
 */
export function applyTheme(mode: ThemeMode, options: ApplyThemeOptions = {}): void {
    if (typeof document === 'undefined') return;
    const root = options.root ?? document.documentElement;
    const prefix = options.classPrefix ?? 'ori-theme_';
    root.classList.add(prefix + mode);
    root.classList.remove(prefix + (mode === 'dark' ? 'light' : 'dark'));
    flushThemeInvalidation(options.flushTarget === undefined ? document.body : options.flushTarget);
}

export interface ThemeControllerOptions extends ApplyThemeOptions {
    /** Initial setting when nothing is persisted. Default `'auto'`. */
    default?: ThemeSetting;
    /**
     * `localStorage` key the setting is read from / written to. `null` disables persistence.
     * Default `'ori-theme'`.
     */
    storageKey?: string | null;
}

export interface ThemeController {
    /** The current SETTING (`'auto' | 'light' | 'dark'`). */
    get(): ThemeSetting;
    /** The RESOLVED theme currently applied to the DOM (`'light' | 'dark'`). */
    resolved(): ThemeMode;
    /** Set the setting (`'auto'` re-follows the OS), apply it, and persist. */
    set(setting: ThemeSetting): void;
    /** Toggle the RESOLVED theme (light ⇄ dark) and pin it as an explicit setting (drops `auto`). */
    toggle(): void;
    /** Cycle the setting `auto → light → dark → auto`. */
    cycle(): void;
    /** Subscribe to changes; fires with `(setting, resolved)`. Returns an unsubscribe. */
    subscribe(listener: (setting: ThemeSetting, resolved: ThemeMode) => void): () => void;
    /** Stop the OS-scheme listener and drop all subscribers. */
    destroy(): void;
}

function prefersDark(): boolean {
    return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}

function isSetting(value: unknown): value is ThemeSetting {
    return value === 'auto' || value === 'light' || value === 'dark';
}

/**
 * Stateful theme controller: resolves `auto` against the OS scheme (live), persists the setting, and
 * applies via {@link applyTheme} on every change. Framework-agnostic — `./vue` and `./svelte` `useTheme`
 * wrap it for reactivity. Applies the initial theme immediately on construction (client-side) so there
 * is no post-mount flash in a SPA; for SSR, gate construction behind mount or set the class in an inline
 * head script. SSR-safe: without `document` it holds the setting but touches nothing.
 */
export function createThemeController(options: ThemeControllerOptions = {}): ThemeController {
    const { default: fallback = 'auto', storageKey = 'ori-theme', ...applyOptions } = options;
    const hasDocument = typeof document !== 'undefined';
    const canStore = hasDocument && storageKey != null && typeof localStorage !== 'undefined';

    const read = (): ThemeSetting => {
        if (!canStore) return fallback;
        const stored = localStorage.getItem(storageKey as string);
        return isSetting(stored) ? stored : fallback;
    };

    let setting: ThemeSetting = read();
    const listeners = new Set<(setting: ThemeSetting, resolved: ThemeMode) => void>();

    const resolve = (): ThemeMode => (setting === 'auto' ? (prefersDark() ? 'dark' : 'light') : setting);

    const apply = (): void => {
        if (!hasDocument) return;
        applyTheme(resolve(), applyOptions);
        if (canStore) localStorage.setItem(storageKey as string, setting);
        for (const listener of listeners) listener(setting, resolve());
    };

    // `auto` reacts to OS scheme flips (no attribute mutates, so a MutationObserver would miss it). Listen
    // to matchMedia DIRECTLY rather than the core `observeTheme` — the controller owns the theme class, so
    // watching class/style would just re-fire on our own writes (a re-apply loop). matchMedia is the only
    // signal it can't produce itself.
    const media =
        hasDocument && typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : undefined;
    const onSchemeChange = (): void => {
        if (setting === 'auto') apply();
    };
    media?.addEventListener('change', onSchemeChange);

    // Apply the persisted / default theme up front.
    apply();

    return {
        get: () => setting,
        resolved: resolve,
        set(next: ThemeSetting) {
            setting = next;
            apply();
        },
        toggle() {
            setting = resolve() === 'dark' ? 'light' : 'dark';
            apply();
        },
        cycle() {
            setting = setting === 'auto' ? 'light' : setting === 'light' ? 'dark' : 'auto';
            apply();
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        destroy() {
            media?.removeEventListener('change', onSchemeChange);
            listeners.clear();
        }
    };
}
