import { useHeadless } from './plugin';
import { nativeDisclosure } from './native';
import type { DisclosureControl, UseDisclosureOptions } from './contract';

/**
 * Resolve the active Disclosure behaviour. Components call this and stay engine-agnostic: it returns
 * whichever adapter the app provided (custom / Zag) via `<OriHeadlessProvider>`, falling back to the
 * native `../core` adapter when none is configured.
 *
 * (Rules of hooks: the resolved adapter runs hooks, so it must be stable across a component's lifetime —
 * pick adapters once at the root; see plugin.ts.)
 */
export function useDisclosure(options: UseDisclosureOptions = {}): DisclosureControl {
    const adapters = useHeadless();
    const adapter = adapters?.disclosure ?? nativeDisclosure;
    return adapter(options);
}
