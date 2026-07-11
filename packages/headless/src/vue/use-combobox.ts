import { inject, type MaybeRefOrGetter } from 'vue';
import { ORI_HEADLESS, type ComboboxControl, type UseComboboxOptions } from './contract';
import { nativeCombobox } from './native';

export type { UseComboboxOptions } from './contract';

/**
 * Resolve the active Combobox behavior. Components call this and stay engine-agnostic: it returns
 * whichever adapter the app provided (a custom / Zag-backed one) via the OriHeadless plugin, falling
 * back to the native `../core` state-machine adapter when none is configured — so a combobox needs no
 * extra dependency, and a swap is optional and per-widget, not a rewrite. Build any UI on the returned
 * prop bags + visible items, or use the styled `OriCombobox`.
 */
export function useCombobox(options: MaybeRefOrGetter<UseComboboxOptions>): ComboboxControl {
    const adapters = inject(ORI_HEADLESS, null);
    const adapter = adapters?.combobox ?? nativeCombobox;
    return adapter(options);
}
