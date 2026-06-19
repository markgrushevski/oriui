/**
 * Scope — owns a component instance's deterministic element ids. Ids are derived from one base
 * `id` (which the framework adapter sources from an SSR-stable generator: Vue `useId()`,
 * Svelte `$props.id()`), so server and client markup match and multiple instances never collide.
 *
 * `getRootNode` is the seam for future DOM queries (focus management, shadow DOM); kept minimal now.
 */
export interface Scope {
    id: string;
    getId(part: string): string;
    getRootNode(): Document | ShadowRoot;
}

export function createScope(options: { id: string; getRootNode?: () => Document | ShadowRoot }): Scope {
    const { id, getRootNode } = options;

    return {
        id,
        getId: (part) => `ori-${id}-${part}`,
        getRootNode: getRootNode ?? (() => document)
    };
}
