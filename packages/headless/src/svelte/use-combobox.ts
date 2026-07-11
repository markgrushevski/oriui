import { getHeadless } from './plugin';
import { nativeCombobox } from './native';
import type { ComboboxControl, UseComboboxOptions } from './contract';
import type { MaybeReactive } from './use-store';

export type { UseComboboxOptions } from './contract';

/**
 * Resolve the active Combobox behavior (Svelte) — the twin of the Vue `useCombobox`. Returns whichever
 * adapter the app registered via `provideHeadless()`, falling back to the native `../core` state-machine
 * adapter; behaviour is identical when unwired, so a swap is optional and per-widget. Returns Svelte
 * stores of the ready-to-spread prop bags plus the visible (filtered) items; item prop-getters are stores
 * of a function (`$getOptionProps(item, i)`).
 *
 * Options are a `MaybeReactive<UseComboboxOptions>`: pass a plain object for a fixed config, or a Svelte
 * store to react to external changes. Build any UI on top, or use the styled `OriCombobox`.
 */
export function useCombobox(options: MaybeReactive<UseComboboxOptions>): ComboboxControl {
    const adapter = getHeadless()?.combobox ?? nativeCombobox;
    return adapter(options);
}
