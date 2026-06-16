import { inject, type MaybeRefOrGetter } from 'vue';
import { ORI_HEADLESS, type DialogControl, type UseDialogOptions } from './contract';

/**
 * Resolve the dialog behavior. Unlike disclosure, there is NO zero-dep native default — a dialog's
 * focus trap / scroll lock / focus return is exactly the hard behavior we delegate to Zag. So an
 * adapter must be provided (OriHeadless / provideHeadless); otherwise we fail loud with guidance.
 */
export function useDialog(options?: MaybeRefOrGetter<UseDialogOptions>): DialogControl {
    const adapter = inject(ORI_HEADLESS, null)?.dialog;

    if (!adapter) {
        throw new Error(
            '[oriui] OriDialog needs a dialog headless adapter. Install @zag-js/dialog + @zag-js/vue and ' +
                'provide it, e.g. app.use(OriHeadless, { dialog: zagDialog }).'
        );
    }

    return adapter(options);
}
