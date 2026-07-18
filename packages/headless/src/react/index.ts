// Engine-agnostic resolvers components consume
export { useDisclosure } from './use-disclosure';
export { useDialog } from './use-dialog';

// Headless behaviours built directly on the core engine (resolved through the swappable contract)
export { useCombobox } from './use-combobox';
export type { ComboboxItem } from '../core';
export { useMenu } from './use-menu';
export type { MenuItem } from '../core';

// Headless toolbar (WAI-ARIA toolbar — compositional roving tabindex via React context, not a machine)
export {
    useToolbar,
    useToolbarItem,
    useToolbarOrientation,
    useToolbarToggleGroup,
    useToolbarToggleItem,
    type UseToolbarOptions,
    type UseToolbarToggleGroupOptions
} from './use-toolbar';

// Headless tabs (WAI-ARIA tabs — automatic activation; data-driven roving tabindex, not a machine)
export { useTabs, type UseTabsOptions, type TabItem } from './use-tabs';

// Headless toast queue — a framework-agnostic singleton projected into React via useSyncExternalStore
export { useToast, type ToastColor, type ToastItem, type ToastOptions } from './use-toast';

// Headless color picker — compositional sRGB + 2D-area helpers (not a machine); React binding
export { useColorPicker, type UseColorPickerOptions } from './use-color-picker';
export type { ColorFormat, HSVA } from '../core/color-picker';

// Headless dismiss layer — outside-pointerdown / focus-out close for non-platform overlays (Menu/Combobox)
export { useDismissable, type UseDismissableOptions } from './use-dismissable';

// Token bridge — resolved --ori-* tokens for canvas/WebGL/chart consumers, theme-reactive
export { useToken, useThemeColor } from './use-token';

// Theme controller — light/dark + auto + persistence, with the runtime-toggle invalidation fix
export { useTheme, type UseThemeReturn } from './use-theme';
export type { ThemeMode, ThemeSetting, ThemeControllerOptions } from '../core';

// Adapter selection (React context)
export { OriHeadlessProvider, useHeadless } from './plugin';

// Built-in native adapters (defaults) + the low-level bridge for writing your own
export { nativeDisclosure, nativeDialog, nativeCombobox, nativeMenu } from './native';
export { useService } from './use-machine';
export { normalizeProps, type ReactPropTypes } from './normalize-props';

// Contract
export {
    type UseDisclosureOptions,
    type DisclosureControl,
    type DisclosureAdapter,
    type UseDialogOptions,
    type DialogControl,
    type DialogAdapter,
    type UseComboboxOptions,
    type ComboboxControl,
    type ComboboxAdapter,
    type UseMenuOptions,
    type MenuControl,
    type MenuAdapter,
    type HeadlessAdapters
} from './contract';
