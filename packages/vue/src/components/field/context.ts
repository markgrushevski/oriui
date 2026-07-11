import { inject, type ComputedRef, type InjectionKey } from 'vue';
import type { ActionSize } from '../../types';

// The contract an OriField provides to a descendant control. A control reads this (when present) to
// adopt the field's identity + a11y wiring instead of computing its own and rendering a duplicate
// label / hint / error — so the label/hint/error/required contract has one source of truth.
export interface OriFieldContext {
    /** The id shared by the field's `<label for>` and the control. */
    id: ComputedRef<string>;
    /** The `<label>` element's own id — for group/composite controls that name themselves via
     *  `aria-labelledby` (radiogroup, combobox listbox, color-picker) rather than `<label for>`. */
    labelId: ComputedRef<string>;
    /** `aria-describedby` pointing at the rendered hint or error (or undefined when neither shows). */
    describedBy: ComputedRef<string | undefined>;
    /** Whether the field is invalid (an `error` is set, or `invalid` was passed). */
    invalid: ComputedRef<boolean>;
    /** Whether the field is required (drives the control's native `required`). */
    required: ComputedRef<boolean>;
    /** Whether the field is disabled (drives the control's native `disabled`). */
    disabled: ComputedRef<boolean>;
    /** The field's action-size, propagated so the control matches the label/hint scale. */
    size: ComputedRef<ActionSize>;
}

export const oriFieldKey: InjectionKey<OriFieldContext> = Symbol('ori-field');

/**
 * Read the surrounding `OriField` context, if any. Text controls (OriInput / OriSelect / OriTextarea)
 * call this to auto-wire when nested inside an `OriField`; returns `undefined` when used standalone.
 */
export function useOriField(): OriFieldContext | undefined {
    return inject(oriFieldKey, undefined);
}
