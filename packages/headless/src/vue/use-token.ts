import { onMounted, onScopeDispose, readonly, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import { observeTheme, resolveToken } from '../core';

/**
 * Reactive bridge to a resolved `--ori-*` token — for consumers that paint outside the CSS cascade
 * (Konva/canvas/WebGL, charts) but must follow the active skin. Wraps the core `resolveToken` probe
 * (see its JSDoc for why `getComputedStyle().getPropertyValue('--x')` is not enough): `''` during SSR
 * and before mount (server and first client render match), resolves on mount, then re-resolves when
 * the token changes (pass a getter/ref — a plain string is a fixed snapshot) and on theme changes via
 * the core `observeTheme` (skin class/style toggles + OS scheme flips). Colors-only MVP: the token
 * must resolve to a `<color>`. The observer is torn down on scope dispose (component unmount).
 */
export function useToken(token: MaybeRefOrGetter<string>): Readonly<Ref<string>> {
    const value = shallowRef('');
    let stop: (() => void) | undefined;

    const resolve = (): void => {
        value.value = resolveToken(toValue(token));
    };

    onMounted(() => {
        resolve();
        stop = observeTheme(resolve);
    });

    // Getter-based watch keeps a props-sourced token reactive (vue/no-setup-props-reactivity-loss);
    // gated on `stop` so a pre-mount change can't resolve early and diverge from the server render.
    watch(
        () => toValue(token),
        () => {
            if (stop) resolve();
        }
    );

    onScopeDispose(() => stop?.());

    return readonly(value);
}

/**
 * Sugar over {@link useToken} for the color roles: `useThemeColor('primary')` resolves
 * `--ori-color-primary` (reactive when `color` is a getter/ref).
 */
export function useThemeColor(color: MaybeRefOrGetter<string>): Readonly<Ref<string>> {
    return useToken(() => `--ori-color-${toValue(color)}`);
}
