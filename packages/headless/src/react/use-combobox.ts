import { useHeadless } from './plugin';
import { nativeCombobox } from './native';
import type { ComboboxControl, UseComboboxOptions } from './contract';

/**
 * Resolve the active Combobox behaviour — the WAI-ARIA listbox-combobox. Returns whichever adapter the app
 * provided via `<OriHeadlessProvider>`, falling back to the native `../core` engine when none is configured.
 * (Rules of hooks: the resolved adapter must be stable across a component's lifetime.)
 */
export function useCombobox(options: UseComboboxOptions): ComboboxControl {
    const adapters = useHeadless();
    const adapter = adapters?.combobox ?? nativeCombobox;
    return adapter(options);
}
