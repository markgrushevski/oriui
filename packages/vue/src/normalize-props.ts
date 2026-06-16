import { createNormalizer, type Dict, type PropTypes } from '@oriui/core';

export interface VuePropTypes extends PropTypes {
    element: Record<string, unknown>;
    button: Record<string, unknown>;
}

// Vue keeps `onXxx` listener keys and accepts aria-/data- attributes verbatim when spread with
// `v-bind`, so the transform is mostly pass-through: drop `undefined` (so absent attributes don't
// render) and remap the few names Vue spells differently.
const propMap: Record<string, string> = {
    className: 'class',
    htmlFor: 'for',
    defaultValue: 'value',
    defaultChecked: 'checked'
};

export const normalizeProps = createNormalizer<VuePropTypes>((props: Dict) => {
    const result: Dict = {};

    for (const key in props) {
        const value = props[key];
        if (value === undefined) continue;
        result[propMap[key] ?? key] = value;
    }

    return result;
});
