import { useHeadless } from './plugin';
import { nativeDialog } from './native';
import type { DialogControl, UseDialogOptions } from './contract';

/**
 * Resolve the active Dialog behaviour. Returns whichever adapter the app provided via
 * `<OriHeadlessProvider>`, falling back to the native `<dialog>`-backed adapter when none is configured. The
 * native default gives the focus trap, `Esc`, `::backdrop`, top-layer and focus-return for free
 * (`showModal()`), so a dialog needs no extra dependency — Zag is an optional per-widget swap, not a
 * requirement. (Rules of hooks: the resolved adapter must be stable across a component's lifetime.)
 */
export function useDialog(options: UseDialogOptions = {}): DialogControl {
    const adapters = useHeadless();
    const adapter = adapters?.dialog ?? nativeDialog;
    return adapter(options);
}
