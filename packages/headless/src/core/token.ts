/**
 * Token bridge — read the RESOLVED value of an `--ori-*` design token from JS.
 *
 * Why this exists: canvas/WebGL/charting renderers (Konva, ECharts, …) paint outside the CSS cascade
 * and cannot read custom properties, yet they should follow the active skin. And the obvious API is a
 * trap: `getComputedStyle(el).getPropertyValue('--x')` returns the UNresolved `var()` chain for
 * unregistered custom properties (oriUI aliases chain — `--ori-color-primary: var(--ori-color-primary-light)`),
 * so it hands back `var(--ori-color-primary-light)`, not a color. Substitution only happens at a real
 * property's computed-value time — hence the probe: a hidden element whose `color` is `var(<token>)`,
 * read back through `getComputedStyle(probe).color`.
 *
 * Colors-only MVP: the probe reads through the `color` property, so the token must resolve to a
 * `<color>`. Non-color tokens (lengths, shadows) need a differently-typed probe — out of scope here.
 *
 * SSR-safe: every API returns an inert value (`''` / no-op unsubscribe) when `document` is undefined.
 * Zero dependencies.
 */

/**
 * A color no real design token resolves to. When `var(<token>)` is invalid at computed-value time
 * (token undeclared), `color` becomes its unset value — inherited — so the probe's wrapper pins the
 * inherited color to this sentinel and an unresolvable token is detected instead of leaking the
 * host's text color. The 0.004 alpha makes an accidental collision with a real token practically
 * impossible.
 */
const UNRESOLVED_SENTINEL = 'rgba(1, 2, 3, 0.004)';

/**
 * The package targets the DOM and deliberately carries no Node types — declare the bundler-injected
 * `process.env.NODE_ENV` shape locally (module-scoped) so the dev-only guard type-checks. The runtime
 * `typeof` check below keeps plain browser ESM (where no `process` global exists) safe.
 */
declare const process: { env: { NODE_ENV?: string } } | undefined;

/** Tokens already warned about — an unresolvable token warns once, not on every resolve call. */
const warnedTokens = new Set<string>();

/**
 * Dev-only diagnosis for the silent-`''` trap: `''` means SSR, but with a real `document` it means the
 * token genuinely failed to resolve — worth a console.warn naming the token. The `typeof process` guard
 * keeps plain browser ESM (no bundler, no `process` global) from throwing; bundlers inline `NODE_ENV`
 * and strip this whole branch from production builds.
 */
function warnUnresolved(token: string): void {
    if (typeof process === 'undefined' || process.env.NODE_ENV === 'production') return;
    if (warnedTokens.has(token)) return;
    warnedTokens.add(token);
    console.warn(
        `[@oriui/headless] resolveToken: '${token}' did not resolve — returning ''. Either the token is not ` +
            'declared in the active skin/scope, or it is not a <color>: the token bridge is a colors-only MVP ' +
            '(the probe reads through the `color` property), so length/shadow/font tokens do not resolve.'
    );
}

export interface ResolveTokenOptions {
    /**
     * Resolve within this element's cascade context, so subtree token overrides (a scoped skin, a
     * repointed alias on a wrapper) apply. Defaults to `document.documentElement` (the `:root` skin).
     */
    element?: HTMLElement;
}

/**
 * Resolve a custom property (e.g. `'--ori-color-primary'`) to its COMPUTED value — `'rgb(25, 118, 210)'`,
 * not the `var()` chain. Appends a hidden probe (`position: absolute; visibility: hidden` — kept out of
 * flow and paint WITHOUT suppressing style computation), reads `getComputedStyle(probe).color`, removes
 * the probe. Returns `''` when the token is unresolvable or `document` is undefined (SSR) — and in dev
 * builds an unresolvable token (real `document`, no resolution) additionally warns once per token, so
 * the two `''` cases are distinguishable.
 *
 * Synchronous and allocation-light, but it does touch the DOM — cache per frame if you resolve many
 * tokens in a render loop, and re-resolve on theme changes via {@link observeTheme}.
 */
export function resolveToken(token: string, options: ResolveTokenOptions = {}): string {
    if (typeof document === 'undefined') return '';
    const host = options.element ?? document.documentElement;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.visibility = 'hidden';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.color = UNRESOLVED_SENTINEL;

    const probe = document.createElement('div');
    probe.style.color = `var(${token})`;
    wrapper.appendChild(probe);
    host.appendChild(wrapper);

    try {
        const resolved = getComputedStyle(probe).color;
        // Compare against the wrapper's COMPUTED color so both sides carry the engine's normalization.
        if (resolved === '' || resolved === getComputedStyle(wrapper).color) {
            warnUnresolved(token);
            return '';
        }
        return resolved;
    } finally {
        wrapper.remove();
    }
}

export interface ObserveThemeOptions {
    /**
     * The element whose `class` / `style` mutations signal a theme change. Defaults to
     * `document.documentElement`, where oriUI skins toggle (`.dark`, inline token overrides).
     */
    element?: HTMLElement;
}

/**
 * Subscribe to theme changes — the invalidation signal for {@link resolveToken}. Watches the target's
 * `class` + `style` attributes via MutationObserver (skin class toggles, inline token overrides) plus
 * a `matchMedia('(prefers-color-scheme: dark)')` change listener, which covers the app's `auto` skin:
 * an OS scheme flip re-resolves tokens without any attribute mutating. Returns an unsubscribe; no-op
 * (but still safely callable) when `document` is undefined (SSR).
 */
export function observeTheme(callback: () => void, options: ObserveThemeOptions = {}): () => void {
    if (typeof document === 'undefined') return () => {};
    const target = options.element ?? document.documentElement;

    const observer = new MutationObserver(() => callback());
    observer.observe(target, { attributes: true, attributeFilter: ['class', 'style'] });

    const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : undefined;
    const onSchemeChange = (): void => callback();
    media?.addEventListener('change', onSchemeChange);

    return () => {
        observer.disconnect();
        media?.removeEventListener('change', onSchemeChange);
    };
}
