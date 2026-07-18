import { useHeadless } from './plugin';
import { nativeMenu } from './native';
import type { MenuControl, UseMenuOptions } from './contract';

/**
 * Resolve the active Menu behaviour — the WAI-ARIA menu-button + roving tabindex. Returns whichever adapter
 * the app provided via `<OriHeadlessProvider>`, falling back to the native `../core` engine when none is
 * configured. (Rules of hooks: the resolved adapter must be stable across a component's lifetime.)
 */
export function useMenu(options: UseMenuOptions): MenuControl {
    const adapters = useHeadless();
    const adapter = adapters?.menu ?? nativeMenu;
    return adapter(options);
}
