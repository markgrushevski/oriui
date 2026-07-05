import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, type Ref } from 'vue';
import { mount } from '@vue/test-utils';
import { get, writable } from 'svelte/store';
import { resolveToken, observeTheme } from '@oriui/headless';
import { useToken, useThemeColor } from '@oriui/headless/vue';
import { useToken as useTokenSvelte, useThemeColor as useThemeColorSvelte } from '@oriui/headless/svelte';

// The token bridge resolves --ori-* custom properties to their COMPUTED values from JS (for canvas /
// Konva / chart consumers) via a hidden color probe — getComputedStyle().getPropertyValue('--x') would
// return the unresolved var() chain. happy-dom handles the whole pipeline natively (verified: var()
// resolution through `color`, alias chains, class-driven overrides, inheritance of the sentinel color,
// MutationObserver on attribute changes), so everything below runs REAL except the
// prefers-color-scheme leg — happy-dom's matchMedia never fires a scheme change, so that one test
// stubs matchMedia and asserts the subscribe/unsubscribe contract.

const BRAND_LIGHT = 'rgb(10, 20, 30)';
const BRAND_DARK = 'rgb(200, 100, 50)';
const ACCENT = 'rgb(1, 128, 64)';
const SCOPED = 'rgb(2, 2, 2)';

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
        .scoped {
            --ori-test-brand: ${SCOPED};
        }
    `;
    document.head.appendChild(sheet);
});

afterEach(() => {
    // Unstub FIRST — the SSR-guard tests stub `document` to undefined, and the DOM cleanup needs the real one.
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    sheet.remove();
    document.documentElement.classList.remove('dark');
});

/** MutationObserver delivery is async — settle a macrotask before asserting observer-driven updates. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

// ---------------------------------------------------------------------------
// Core engine
// ---------------------------------------------------------------------------

describe('resolveToken (core)', () => {
    it('resolves a token through a var() alias chain to the computed color', () => {
        expect(resolveToken('--ori-test-brand')).toBe(BRAND_LIGHT);
    });

    it('resolves against the current theme class on :root', () => {
        document.documentElement.classList.add('dark');
        expect(resolveToken('--ori-test-brand')).toBe(BRAND_DARK);
    });

    it('resolves subtree overrides via options.element', () => {
        const scope = document.createElement('div');
        scope.className = 'scoped';
        document.body.appendChild(scope);

        expect(resolveToken('--ori-test-brand', { element: scope })).toBe(SCOPED);
        expect(resolveToken('--ori-test-brand')).toBe(BRAND_LIGHT);
        scope.remove();
    });

    it('returns "" for an undeclared token (sentinel, not the inherited text color)', () => {
        document.documentElement.style.color = 'rgb(90, 90, 90)';
        expect(resolveToken('--ori-test-definitely-missing')).toBe('');
        document.documentElement.style.removeProperty('color');
    });

    it('creates the probe and removes it again — no DOM residue', () => {
        const created = vi.spyOn(document, 'createElement');
        const before = document.documentElement.children.length;

        expect(resolveToken('--ori-test-brand')).toBe(BRAND_LIGHT);

        expect(created).toHaveBeenCalledWith('div');
        expect(document.documentElement.children.length).toBe(before);
    });

    it('returns "" when document is undefined (SSR guard)', () => {
        vi.stubGlobal('document', undefined);
        expect(resolveToken('--ori-test-brand')).toBe('');
    });
});

describe('observeTheme (core)', () => {
    it('fires on a :root class change and a :root style change', async () => {
        const callback = vi.fn();
        const stop = observeTheme(callback);

        document.documentElement.classList.add('dark');
        await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));

        document.documentElement.style.setProperty('--ori-test-inline', 'red');
        await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(2));

        stop();
        document.documentElement.style.removeProperty('--ori-test-inline');
    });

    it('the unsubscribe disconnects the observer', async () => {
        const callback = vi.fn();
        const stop = observeTheme(callback);
        stop();

        document.documentElement.classList.add('dark');
        await settle();
        expect(callback).not.toHaveBeenCalled();
    });

    it('subscribes to prefers-color-scheme and detaches on unsubscribe (stubbed matchMedia)', () => {
        let schemeListener: (() => void) | undefined;
        const addEventListener = vi.fn((_: string, listener: () => void) => {
            schemeListener = listener;
        });
        const removeEventListener = vi.fn();
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({ matches: false, addEventListener, removeEventListener }))
        );

        const callback = vi.fn();
        const stop = observeTheme(callback);

        expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        schemeListener?.();
        expect(callback).toHaveBeenCalledTimes(1);

        stop();
        expect(removeEventListener).toHaveBeenCalledWith('change', schemeListener);
    });

    it('returns a callable no-op when document is undefined (SSR guard)', () => {
        vi.stubGlobal('document', undefined);
        const stop = observeTheme(vi.fn());
        expect(() => stop()).not.toThrow();
    });
});

// ---------------------------------------------------------------------------
// Vue adapter
// ---------------------------------------------------------------------------

describe('useToken (Vue)', () => {
    function mountToken(initialToken: string) {
        let value!: Readonly<Ref<string>>;
        let valueDuringSetup!: string;

        const wrapper = mount(
            defineComponent({
                props: { token: { type: String, default: initialToken } },
                setup(props) {
                    value = useToken(() => props.token);
                    valueDuringSetup = value.value;
                    return () => h('div', value.value);
                }
            })
        );

        return { wrapper, value: () => value.value, valueDuringSetup };
    }

    it('is "" during setup (SSR-consistent) and resolves on mount', () => {
        const { wrapper, value, valueDuringSetup } = mountToken('--ori-test-brand');

        expect(valueDuringSetup).toBe('');
        expect(value()).toBe(BRAND_LIGHT);
        wrapper.unmount();
    });

    it('re-resolves when the theme observer fires (:root class toggle)', async () => {
        const { wrapper, value } = mountToken('--ori-test-brand');
        expect(value()).toBe(BRAND_LIGHT);

        document.documentElement.classList.add('dark');
        await vi.waitFor(() => expect(value()).toBe(BRAND_DARK));
        wrapper.unmount();
    });

    it('re-resolves when the token getter changes', async () => {
        const { wrapper, value } = mountToken('--ori-test-brand');

        await wrapper.setProps({ token: '--ori-color-testrole' });
        expect(value()).toBe(ACCENT);
        wrapper.unmount();
    });

    it('stops observing on unmount — later theme changes leave the ref untouched', async () => {
        const { wrapper, value } = mountToken('--ori-test-brand');
        wrapper.unmount();

        document.documentElement.classList.add('dark');
        await settle();
        expect(value()).toBe(BRAND_LIGHT);
    });

    it('useThemeColor resolves --ori-color-<role>', () => {
        let value!: Readonly<Ref<string>>;
        const wrapper = mount(
            defineComponent({
                setup() {
                    value = useThemeColor('testrole');
                    return () => h('div');
                }
            })
        );

        expect(value.value).toBe(ACCENT);
        wrapper.unmount();
    });
});

// ---------------------------------------------------------------------------
// Svelte adapter — like tests/svelte-adapter.test.ts, exercised without rendering
// a component: the composables return stores, so get() / subscribe prove the contract.
// ---------------------------------------------------------------------------

describe('useToken (Svelte)', () => {
    it('a plain-string token resolves on first read (lazy store start)', () => {
        expect(get(useTokenSvelte('--ori-test-brand'))).toBe(BRAND_LIGHT);
    });

    it('re-resolves when the token store changes', () => {
        const token = writable('--ori-test-brand');
        const value = useTokenSvelte(token);

        const seen: string[] = [];
        const stop = value.subscribe((v) => seen.push(v));

        token.set('--ori-color-testrole');
        stop();

        expect(seen).toEqual([BRAND_LIGHT, ACCENT]);
    });

    it('re-resolves when the theme observer fires, and tears down with the last subscriber', async () => {
        const value = useTokenSvelte('--ori-test-brand');
        const seen: string[] = [];
        const stop = value.subscribe((v) => seen.push(v));

        document.documentElement.classList.add('dark');
        await vi.waitFor(() => expect(seen).toContain(BRAND_DARK));

        stop();
        document.documentElement.classList.remove('dark');
        await settle();
        expect(seen).toEqual([BRAND_LIGHT, BRAND_DARK]);
    });

    it('useThemeColor resolves --ori-color-<role> and follows a role store', () => {
        expect(get(useThemeColorSvelte('testrole'))).toBe(ACCENT);

        const role = writable('testrole');
        const value = useThemeColorSvelte(role);
        const seen: string[] = [];
        const stop = value.subscribe((v) => seen.push(v));

        role.set('testrole-missing');
        stop();

        expect(seen).toEqual([ACCENT, '']);
    });
});
