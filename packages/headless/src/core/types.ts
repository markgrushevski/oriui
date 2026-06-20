/**
 * Framework-neutral prop dictionary produced by a `connect()` prop-getter and handed to a
 * per-framework `normalizeProps` before it is spread onto an element.
 */
export type Dict = Record<string, unknown>;

/**
 * Branding interface: each framework adapter widens these to its own element/attribute types
 * (Vue's `HTMLAttributes`, Svelte's, React's). The core only relies on the shape, not the types.
 */
export interface PropTypes {
    element: Record<string, unknown>;
    button: Record<string, unknown>;
}

/**
 * The seam every adapter implements: a per-element transform that maps the neutral prop dict to
 * a framework's binding convention (e.g. Svelte lowercases `onClick` -> `onclick`).
 */
export interface NormalizeProps<T extends PropTypes = PropTypes> {
    element(props: Dict): T['element'];
    button(props: Dict): T['button'];
}

/**
 * Build a NormalizeProps from a single transform. Most frameworks use the same transform for
 * every element kind; the split exists only so adapters can refine the return types.
 */
export function createNormalizer<T extends PropTypes = PropTypes>(transform: (props: Dict) => Dict): NormalizeProps<T> {
    return {
        element: transform as NormalizeProps<T>['element'],
        button: transform as NormalizeProps<T>['button']
    };
}
