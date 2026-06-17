import { inject, type MaybeRefOrGetter } from 'vue';
import { ORI_HEADLESS, type DisclosureControl, type UseDisclosureOptions } from './contract';
import { nativeDisclosure } from './native';

/**
 * Resolve the active Disclosure behavior. Components call this and stay engine-agnostic: it
 * returns whichever adapter the app provided (Zag / custom) via the OriHeadless plugin, falling
 * back to the native `@oriui/core` adapter when none is configured.
 */
export function useDisclosure(options?: MaybeRefOrGetter<UseDisclosureOptions>): DisclosureControl {
    const adapters = inject(ORI_HEADLESS, null);
    const adapter = adapters?.disclosure ?? nativeDisclosure;
    return adapter(options);
}
