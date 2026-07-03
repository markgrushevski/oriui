import { getHeadless } from './plugin';
import { nativeDialog } from './native';
import type { DialogControl, UseDialogOptions } from './contract';

/**
 * Resolve the active Dialog behavior. Returns whichever adapter the app provided via
 * `provideHeadless()`, falling back to the native `<dialog>`-backed adapter when none is configured.
 */
export function useDialog(options?: UseDialogOptions): DialogControl {
    const adapter = getHeadless()?.dialog ?? nativeDialog;
    return adapter(options);
}
