import { getHeadless } from './plugin';
import { nativeMenu } from './native';
import type { MenuControl, UseMenuOptions } from './contract';
import type { MaybeReactive } from './use-store';

export type { UseMenuOptions } from './contract';

/**
 * Resolve the active Menu behavior (Svelte) — the twin of the Vue `useMenu`. Returns whichever adapter
 * the app registered via `provideHeadless()`, falling back to the native `../core` roving-tabindex
 * adapter. The UI watches `open` / `highlightedValue` to move real DOM focus (roving needs it) and to
 * wire click-outside / focus-return. Item prop-getters are stores of a function (`$getItemProps(item, i)`).
 *
 * Options are a `MaybeReactive<UseMenuOptions>`: a plain object for a fixed menu, or a Svelte store to
 * react to external changes. Build any UI on top, or use the styled `OriMenu`.
 */
export function useMenu(options: MaybeReactive<UseMenuOptions>): MenuControl {
    const adapter = getHeadless()?.menu ?? nativeMenu;
    return adapter(options);
}
