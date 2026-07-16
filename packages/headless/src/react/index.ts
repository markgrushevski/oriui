// Engine-agnostic resolver components consume
export { useDisclosure } from './use-disclosure';

// Headless tabs (WAI-ARIA tabs — automatic activation; data-driven roving tabindex, not a machine)
export { useTabs, type UseTabsOptions, type TabItem } from './use-tabs';

// Adapter selection (React context)
export { OriHeadlessProvider, useHeadless } from './plugin';

// Built-in native adapter (default) + the low-level bridge for writing your own
export { nativeDisclosure } from './native';
export { useService } from './use-machine';
export { normalizeProps, type ReactPropTypes } from './normalize-props';

// Contract
export {
    type UseDisclosureOptions,
    type DisclosureControl,
    type DisclosureAdapter,
    type HeadlessAdapters
} from './contract';
