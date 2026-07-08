import { describe, it, expect, vi, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { get } from 'svelte/store';
import { applyTheme, flushThemeInvalidation, createThemeController, type ThemeController } from '@oriui/headless';
import { useTheme } from '@oriui/headless/vue';
import { useTheme as useThemeSvelte } from '@oriui/headless/svelte';

// The theme controller flips the `ori-theme_{light,dark}` class and force-restyles a subtree to defeat a
// Chromium invalidation bug (see core theme.ts). happy-dom has no real style engine, so the invalidation
// FIX itself is verified in a real browser (e2e / the manual repro) — here we assert the DOM/state
// contract: class application, auto-resolution via matchMedia, persistence, the subscribe lifecycle, and
// that the flush leaves no `display` residue. The `prefers-color-scheme` leg stubs matchMedia (happy-dom
// never fires a scheme change), same as tests/token.test.ts.

const KEY = 'ori-test-theme';
const cleanup: ThemeController[] = [];

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
    // Unstub FIRST — the SSR-guard test stubs `document` to undefined, and the cleanup below needs the real one.
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    for (const controller of cleanup.splice(0)) controller.destroy();
    document.documentElement.classList.remove('ori-theme_dark', 'ori-theme_light');
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');
    localStorage.clear();
});

// ---------------------------------------------------------------------------
// Core — applyTheme / flushThemeInvalidation
// ---------------------------------------------------------------------------

describe('applyTheme (core)', () => {
    it('sets the mode class and removes the opposite', () => {
        applyTheme('dark');
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);
        expect(document.documentElement.classList.contains('ori-theme_light')).toBe(false);

        applyTheme('light');
        expect(document.documentElement.classList.contains('ori-theme_light')).toBe(true);
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(false);
    });

    it('leaves no display residue on the flush target (body)', () => {
        document.body.style.display = 'flex';
        applyTheme('dark');
        expect(document.body.style.display).toBe('flex');
    });

    it('honours a custom root and classPrefix', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);
        applyTheme('dark', { root, classPrefix: 'theme-', flushTarget: null });
        expect(root.classList.contains('theme-dark')).toBe(true);
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(false);
        root.remove();
    });

    it('flushTarget: null skips the flush (no throw, no residue)', () => {
        expect(() => applyTheme('dark', { flushTarget: null })).not.toThrow();
        expect(document.body.getAttribute('style')).toBeNull();
    });

    it('is a no-op without document (SSR guard)', () => {
        vi.stubGlobal('document', undefined);
        expect(() => applyTheme('dark')).not.toThrow();
    });
});

describe('flushThemeInvalidation (core)', () => {
    it('is a no-op on null / undefined', () => {
        expect(() => flushThemeInvalidation(null)).not.toThrow();
        expect(() => flushThemeInvalidation(undefined)).not.toThrow();
    });

    it('restores the previous inline display', () => {
        const el = document.createElement('div');
        el.style.display = 'grid';
        document.body.appendChild(el);
        flushThemeInvalidation(el);
        expect(el.style.display).toBe('grid');
        el.remove();
    });
});

// ---------------------------------------------------------------------------
// Core — createThemeController
// ---------------------------------------------------------------------------

describe('createThemeController (core)', () => {
    const make = (options?: Parameters<typeof createThemeController>[0]) => {
        const controller = createThemeController(options);
        cleanup.push(controller);
        return controller;
    };

    it('applies a fixed default and its class up front', () => {
        const controller = make({ default: 'dark', storageKey: null });
        expect(controller.get()).toBe('dark');
        expect(controller.resolved()).toBe('dark');
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);
    });

    it('resolves auto against the OS scheme', () => {
        stubMatchMedia(true);
        const controller = make({ default: 'auto', storageKey: null });
        expect(controller.get()).toBe('auto');
        expect(controller.resolved()).toBe('dark');
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);
    });

    it('reads a persisted setting from localStorage', () => {
        localStorage.setItem(KEY, 'dark');
        const controller = make({ default: 'auto', storageKey: KEY });
        expect(controller.get()).toBe('dark');
    });

    it('persists the setting on change', () => {
        const controller = make({ default: 'light', storageKey: KEY });
        controller.set('dark');
        expect(localStorage.getItem(KEY)).toBe('dark');
    });

    it('storageKey: null neither reads nor writes localStorage', () => {
        localStorage.setItem(KEY, 'dark');
        const controller = make({ default: 'light', storageKey: null });
        expect(controller.get()).toBe('light'); // ignored the stored value
        controller.set('dark');
        expect(localStorage.getItem(KEY)).toBe('dark'); // untouched (still our seed, not re-written under a null key)
    });

    it('set applies the new mode class', () => {
        const controller = make({ default: 'light', storageKey: null });
        controller.set('dark');
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);
        expect(document.documentElement.classList.contains('ori-theme_light')).toBe(false);
    });

    it('toggle flips the resolved theme and pins an explicit setting', () => {
        stubMatchMedia(false); // auto -> light
        const controller = make({ default: 'auto', storageKey: null });
        expect(controller.resolved()).toBe('light');
        controller.toggle();
        expect(controller.get()).toBe('dark');
        expect(controller.resolved()).toBe('dark');
    });

    it('cycle goes auto -> light -> dark -> auto', () => {
        const controller = make({ default: 'auto', storageKey: null });
        controller.cycle();
        expect(controller.get()).toBe('light');
        controller.cycle();
        expect(controller.get()).toBe('dark');
        controller.cycle();
        expect(controller.get()).toBe('auto');
    });

    it('auto re-applies on an OS scheme change; a pinned setting ignores it', () => {
        const media = stubMatchMedia(false);
        const controller = make({ default: 'auto', storageKey: null });
        expect(controller.resolved()).toBe('light');

        media.fire(true);
        expect(controller.resolved()).toBe('dark');
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);

        controller.set('light'); // pin explicit
        media.fire(false);
        media.fire(true); // scheme flips again, but we are pinned to light now
        expect(controller.resolved()).toBe('light');
    });

    it('notifies subscribers on change and stops after unsubscribe', () => {
        const controller = make({ default: 'light', storageKey: null });
        const seen: string[] = [];
        const stop = controller.subscribe((setting, resolved) => seen.push(`${setting}/${resolved}`));

        controller.set('dark');
        stop();
        controller.set('light');

        expect(seen).toEqual(['dark/dark']);
    });

    it('destroy detaches the OS-scheme listener', () => {
        const media = stubMatchMedia(false);
        const controller = createThemeController({ default: 'auto', storageKey: null });
        controller.destroy();
        expect(media.mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('holds its setting but touches nothing without document (SSR guard)', () => {
        vi.stubGlobal('document', undefined);
        const controller = createThemeController({ default: 'dark', storageKey: null });
        expect(controller.get()).toBe('dark');
        expect(() => controller.destroy()).not.toThrow();
    });
});

// ---------------------------------------------------------------------------
// Vue adapter
// ---------------------------------------------------------------------------

describe('useTheme (Vue)', () => {
    function mountTheme(options?: Parameters<typeof useTheme>[0]) {
        let api!: ReturnType<typeof useTheme>;
        const wrapper = mount(
            defineComponent({
                setup() {
                    api = useTheme(options);
                    return () => h('div', api.resolvedTheme.value);
                }
            })
        );
        return { wrapper, api: () => api };
    }

    it('exposes reactive theme / resolvedTheme and applies on setup', () => {
        const { wrapper, api } = mountTheme({ default: 'dark', storageKey: null });
        expect(api().theme.value).toBe('dark');
        expect(api().resolvedTheme.value).toBe('dark');
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);
        wrapper.unmount();
    });

    it('setTheme / toggleTheme / cycleTheme update the refs and the DOM', async () => {
        const { wrapper, api } = mountTheme({ default: 'light', storageKey: null });

        api().setTheme('dark');
        await wrapper.vm.$nextTick();
        expect(api().resolvedTheme.value).toBe('dark');
        expect(wrapper.text()).toBe('dark');

        api().toggleTheme();
        expect(api().resolvedTheme.value).toBe('light');

        api().cycleTheme(); // light -> dark
        expect(api().theme.value).toBe('dark');
        wrapper.unmount();
    });

    it('tears the controller down on unmount', () => {
        const media = stubMatchMedia(false);
        const { wrapper } = mountTheme({ default: 'auto', storageKey: null });
        wrapper.unmount();
        expect(media.mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
});

// ---------------------------------------------------------------------------
// Svelte adapter
// ---------------------------------------------------------------------------

describe('useTheme (Svelte)', () => {
    it('the store carries the setting + resolved theme, applied eagerly', () => {
        const theme = useThemeSvelte({ default: 'dark', storageKey: null });
        expect(get(theme)).toEqual({ theme: 'dark', resolvedTheme: 'dark' });
        expect(document.documentElement.classList.contains('ori-theme_dark')).toBe(true);
    });

    it('setters update the store', () => {
        const theme = useThemeSvelte({ default: 'light', storageKey: null });
        const seen: string[] = [];
        const stop = theme.subscribe((s) => seen.push(s.resolvedTheme));

        theme.setTheme('dark');
        theme.toggleTheme(); // dark -> light
        stop();

        expect(seen).toEqual(['light', 'dark', 'light']);
    });

    it('tears down the controller with the last subscriber', () => {
        const media = stubMatchMedia(false);
        const theme = useThemeSvelte({ default: 'auto', storageKey: null });
        const stop = theme.subscribe(() => {});
        stop();
        expect(media.mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
});
