import { inject, type MaybeRefOrGetter } from 'vue';
import { ORI_HEADLESS, type DialogControl, type UseDialogOptions } from './contract';
import { nativeDialog } from './native';

/**
 * Resolve the active Dialog behavior. Components call this and stay engine-agnostic: it returns
 * whichever adapter the app provided (custom / Zag) via the OriHeadless plugin, falling back to the
 * native `<dialog>`-backed adapter when none is configured. The native default gives the focus trap,
 * `Esc`, `::backdrop`, top-layer and focus-return for free (`showModal()`), so a dialog needs no
 * extra dependency — Zag is an optional per-widget swap, not a requirement.
 */
export function useDialog(options?: MaybeRefOrGetter<UseDialogOptions>): DialogControl {
    const adapters = inject(ORI_HEADLESS, null);
    const adapter = adapters?.dialog ?? nativeDialog;
    return adapter(options);
}
