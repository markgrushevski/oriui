import { createNormalizer, type Dict, type PropTypes } from '../core';

export interface SveltePropTypes extends PropTypes {
    element: Record<string, unknown>;
    button: Record<string, unknown>;
}

const propMap: Record<string, string> = {
    className: 'class',
    htmlFor: 'for',
    defaultValue: 'value',
    defaultChecked: 'checked'
};

// Svelte 5 binds DOM event handlers as lowercase attributes (`onclick`, not `onClick`) and takes
// `class` / `for` verbatim. So: drop `undefined` (absent attributes don't render), remap the few
// renamed keys, and lowercase any `onXxx` handler key so a `{...props}` spread lands as a real Svelte
// event handler. aria-/data- attributes already match and pass through untouched.
export const normalizeProps = createNormalizer<SveltePropTypes>((props: Dict) => {
    const result: Dict = {};

    for (const key in props) {
        const value = props[key];
        if (value === undefined) continue;

        if (key in propMap) {
            result[propMap[key] as string] = value;
        } else if (/^on[A-Z]/.test(key)) {
            result[key.toLowerCase()] = value;
        } else {
            result[key] = value;
        }
    }

    return result;
});
