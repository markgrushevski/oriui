// Shared primitives
export * from './types';
export * from './anatomy';
export * from './merge-props';
export * from './scope';
export * from './machine';

// Components — namespaced (mirrors Zag's `import * as disclosure from '@zag-js/...'`)
export * as disclosure from './disclosure';
export * as combobox from './combobox';
export * as menu from './menu';

// Public data shapes consumers pass in (flat, not namespaced)
export type { ComboboxItem } from './combobox';
export type { MenuItem } from './menu';
