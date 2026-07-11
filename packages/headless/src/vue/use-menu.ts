import { inject, type MaybeRefOrGetter } from 'vue';
import { ORI_HEADLESS, type MenuControl, type UseMenuOptions } from './contract';
import { nativeMenu } from './native';

export type { UseMenuOptions } from './contract';

/**
 * Resolve the active Menu behavior. Like `useCombobox`, this stays engine-agnostic: it returns whichever
 * adapter the app provided via the OriHeadless plugin, falling back to the native `../core` roving-tabindex
 * adapter when none is configured. The UI watches `open` / `highlightedValue` to move real DOM focus
 * (roving needs it) and wire click-outside / focus-return. Build any UI on top, or use `OriMenu`.
 */
export function useMenu(options: MaybeRefOrGetter<UseMenuOptions>): MenuControl {
    const adapters = inject(ORI_HEADLESS, null);
    const adapter = adapters?.menu ?? nativeMenu;
    return adapter(options);
}
