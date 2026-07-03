let counter = 0;

/**
 * Generate a process-unique base id for a headless instance. Vue sources this from `useId()`
 * (SSR-stable); Svelte has no framework `useId()` callable outside component init, so we fall back to
 * a module counter. For SSR, pass an explicit `id` to the composable so server and client markup match
 * — a bare counter can drift when the two renders differ in order (see `scope.ts`).
 */
export function uid(prefix: string): string {
    counter += 1;
    return `${prefix}-${counter}`;
}
