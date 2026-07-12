// Theme controller — apply light/dark + defeat the runtime-toggle invalidation bug (see theme.ts)
export {
    applyTheme,
    flushThemeInvalidation,
    createThemeController,
    type ThemeMode,
    type ThemeSetting,
    type ApplyThemeOptions,
    type ThemeControllerOptions,
    type ThemeController
} from './theme';

// Shared primitives
export * from './types';
export * from './anatomy';
export * from './merge-props';
export * from './scope';
export * from './machine';
export * from './token';
export * from './roving';
export * from './roving-dom';
export * from './dismiss';

// Components — namespaced (mirrors Zag's `import * as disclosure from '@zag-js/...'`)
export * as disclosure from './disclosure';
export * as combobox from './combobox';
export * as menu from './menu';

// Public data shapes consumers pass in + the per-item state a UI reads back (flat, not namespaced)
export type { ComboboxItem, ComboboxOptionState } from './combobox';
export type { MenuItem, MenuItemState } from './menu';
