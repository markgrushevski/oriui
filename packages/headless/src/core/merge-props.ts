import type { Dict } from './types'

/**
 * Merge prop dicts left-to-right, type-aware, so a consumer can layer their own handler / class /
 * style on top of a prop-getter without clobbering it:
 *   - `on*` handlers that are both functions are chained;
 *   - `class` / `className` are concatenated;
 *   - `style` objects are shallow-merged;
 *   - everything else: a later defined value wins.
 *
 * **Vue users: use Vue's own `mergeProps` instead** (`import { mergeProps } from 'vue'`). The names
 * collide and Vue's understands the framework's own prop forms — array / object `class`, `style`
 * strings, `onClick` arrays — which this one does not. This export exists for the framework-free and
 * Svelte / React paths, where there is no such helper.
 *
 * **`class` / `className` values must be STRINGS.** The concat branch joins the sides with a space, so
 * an array or object-syntax class stringifies to garbage (`[object Object]`); normalize before merging.
 *
 * Design follows Zag.js's `mergeProps` (MIT); implementation is our own.
 */

type AnyFn = (...args: unknown[]) => void

const isFn = (value: unknown): value is AnyFn => typeof value === 'function'
const isHandler = (key: string): boolean => key.length > 2 && key[0] === 'o' && key[1] === 'n'

function chain(...fns: unknown[]): AnyFn {
    return (...args: unknown[]) => {
        for (const fn of fns) if (isFn(fn)) fn(...args)
    }
}

export function mergeProps(...sources: Dict[]): Dict {
    const result: Dict = {}

    for (const props of sources) {
        for (const key in props) {
            const prev = result[key]
            const next = props[key]

            if (isHandler(key) && isFn(prev) && isFn(next)) {
                result[key] = chain(prev, next)
            } else if (key === 'class' || key === 'className') {
                // Concatenate — but a blank / absent side contributes nothing, so a consumer layering
                // `class: props.class ?? ''` cannot WIPE the bag's own classes (the falsy-side rule clsx
                // and Zag's mergeProps use). Both sides blank keeps the later value, so the key survives.
                const parts = [prev, next].filter(Boolean)
                result[key] = parts.length > 0 ? parts.join(' ') : (next ?? prev)
            } else if (key === 'style' && isObject(prev) && isObject(next)) {
                result[key] = { ...prev, ...next }
            } else {
                result[key] = next !== undefined ? next : prev
            }
        }
    }

    return result
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}
