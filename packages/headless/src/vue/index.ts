// Engine-agnostic resolvers components consume
export { useDisclosure } from './use-disclosure';
export { useDialog } from './use-dialog';

// Headless behaviors built directly on the core engine
export { useCombobox, type UseComboboxOptions } from './use-combobox';
export type { ComboboxItem } from '../core';

// Adapter selection
export { provideHeadless, OriHeadless } from './plugin';

// Built-in native adapters (defaults) + the low-level bridge for writing your own
export { nativeDisclosure, nativeDialog } from './native';
export { useService } from './use-machine';
export { normalizeProps, type VuePropTypes } from './normalize-props';

// Contract
export {
    ORI_HEADLESS,
    type UseDisclosureOptions,
    type DisclosureControl,
    type DisclosureAdapter,
    type UseDialogOptions,
    type DialogControl,
    type DialogAdapter,
    type HeadlessAdapters
} from './contract';
