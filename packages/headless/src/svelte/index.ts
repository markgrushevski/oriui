// Engine-agnostic resolvers components consume
export { useDisclosure } from './use-disclosure';
export { useDialog } from './use-dialog';

// Headless behaviors built directly on the core engine
export { useCombobox, type UseComboboxOptions } from './use-combobox';
export type { ComboboxItem } from '../core';
export { useMenu, type UseMenuOptions } from './use-menu';
export type { MenuItem } from '../core';

// Headless toolbar (WAI-ARIA toolbar — compositional roving tabindex over Svelte context, not a machine)
export {
    useToolbar,
    useToolbarItem,
    useToolbarOrientation,
    useToolbarToggleGroup,
    useToolbarToggleItem,
    type UseToolbarOptions,
    type UseToolbarToggleGroupOptions
} from './use-toolbar';

// Headless tabs (WAI-ARIA tabs — automatic activation; data-driven roving tabindex over stores)
export { useTabs, type UseTabsOptions, type TabItem } from './use-tabs';

// Token bridge — resolved --ori-* tokens for canvas/WebGL/chart consumers, theme-reactive
export { useToken, useThemeColor } from './use-token';

// Theme controller — light/dark + auto + persistence, with the runtime-toggle invalidation fix
export { useTheme, type ThemeState, type ThemeStore } from './use-theme';
export type { ThemeMode, ThemeSetting, ThemeControllerOptions } from '../core';

// Adapter selection (Svelte context)
export { provideHeadless, getHeadless } from './plugin';

// Built-in native adapters (defaults) + the low-level bridge for writing your own
export { nativeDisclosure, nativeDialog, nativeCombobox, nativeMenu } from './native';
export { connectStore } from './use-store';
export { normalizeProps, type SveltePropTypes } from './normalize-props';
export { uid } from './id';

// Contract
export {
    ORI_HEADLESS,
    type UseDisclosureOptions,
    type DisclosureControl,
    type DisclosureAdapter,
    type UseDialogOptions,
    type DialogControl,
    type DialogAdapter,
    type ComboboxControl,
    type ComboboxAdapter,
    type MenuControl,
    type MenuAdapter,
    type HeadlessAdapters
} from './contract';
