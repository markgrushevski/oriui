import { createNormalizer, type Dict, type PropTypes } from '../core';

export interface ReactPropTypes extends PropTypes {
    element: Record<string, unknown>;
    button: Record<string, unknown>;
}

// React spells a few DOM attributes in camelCase. The neutral dict already uses React-style `className`
// / `htmlFor` (the Vue/Svelte normalizers are the ones that remap those away), so the renames left are the
// lowercase HTML attributes the core can emit verbatim; `class` / `for` are kept defensively.
const attrMap: Record<string, string> = {
    tabindex: 'tabIndex',
    readonly: 'readOnly',
    maxlength: 'maxLength',
    autocomplete: 'autoComplete',
    autofocus: 'autoFocus',
    spellcheck: 'spellCheck',
    contenteditable: 'contentEditable',
    class: 'className',
    for: 'htmlFor'
};

// The neutral dict uses Vue-style handler keys (`onClick`, `onKeydown`), which match React for single-word
// events but not multi-word ones (`onKeydown` → React `onKeyDown`). Map the compound events oriUI emits;
// single-word `onXxx` handlers (`onClick` / `onInput` / `onFocus` / `onChange`) already match React and pass
// through unchanged. This is a hand-maintained allowlist — React's casing is per-event, not algorithmic
// (`ondblclick` → `onDoubleClick`) — so it MUST grow when a new machine's `connect` emits a compound handler
// not listed here; an unmapped `onXxx` would pass through mis-cased and React would drop it silently.
// (Today's core connects emit only `onClick` + `onKeydown`, both covered.)
const eventMap: Record<string, string> = {
    onKeydown: 'onKeyDown',
    onKeyup: 'onKeyUp',
    onKeypress: 'onKeyPress',
    onPointerdown: 'onPointerDown',
    onPointerup: 'onPointerUp',
    onPointermove: 'onPointerMove',
    onMousedown: 'onMouseDown',
    onMouseup: 'onMouseUp',
    onMousemove: 'onMouseMove',
    onMouseenter: 'onMouseEnter',
    onMouseleave: 'onMouseLeave'
};

// React binds handlers as PascalCase props and spells a few attributes in camelCase. So: drop `undefined`
// (absent attributes don't render), rename the compound event keys + the camelCase attributes, and pass
// everything else (aria-/data-/`onClick`/`id`/`role`/`hidden`/`disabled`/…) through untouched.
export const normalizeProps = createNormalizer<ReactPropTypes>((props: Dict) => {
    const result: Dict = {};

    for (const key in props) {
        const value = props[key];
        if (value === undefined) continue;

        if (key in eventMap) {
            result[eventMap[key] as string] = value;
        } else if (key in attrMap) {
            result[attrMap[key] as string] = value;
        } else {
            result[key] = value;
        }
    }

    return result;
});
