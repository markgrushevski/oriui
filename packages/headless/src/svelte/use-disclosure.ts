import { getHeadless } from './plugin';
import { nativeDisclosure } from './native';
import type { DisclosureControl, UseDisclosureOptions } from './contract';

/**
 * Resolve the active Disclosure behavior. Components call this and stay engine-agnostic: it returns
 * whichever adapter the app provided (Zag / custom) via `provideHeadless()`, falling back to the native
 * `../core` adapter when none is configured.
 */
export function useDisclosure(options?: UseDisclosureOptions): DisclosureControl {
    const adapter = getHeadless()?.disclosure ?? nativeDisclosure;
    return adapter(options);
}
