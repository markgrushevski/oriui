import { computed, useAttrs, useId, type ComputedRef } from 'vue'
import type { ActionSize } from '../../types'
import { useOriField } from './context'

export interface FieldControlProps {
    describedby?: string
    disabled?: boolean
    error?: string
    hint?: string
    id?: string
    invalid?: boolean
    required?: boolean
    size?: ActionSize
}

export interface FieldGroupProps {
    disabled?: boolean
    label?: string
    name?: string
    required?: boolean
    size?: ActionSize
}

// The ids a control is described by, joined with a caller's own `aria-describedby`. That one arrives
// through `$attrs`, which the templates bind before `:aria-describedby`, so it is lost unless joined here.
function useDescribedBy(own: () => (string | undefined)[]): ComputedRef<string | undefined> {
    const attrs = useAttrs()
    return computed(() => {
        const ids = [...own(), attrs['aria-describedby'] as string | undefined].filter(Boolean)
        return ids.length ? ids.join(' ') : undefined
    })
}

/**
 * The OriField wiring of a control that a `<label for>` names: input, textarea, select, combobox, slider.
 * Inside a field the control takes the field's id, state and description, and the field renders the
 * label, hint and error; standalone it derives its own. `ownId` replaces the standalone id where
 * something else already issues one (the combobox's headless input).
 */
export function useFieldControl(props: () => FieldControlProps, ownId?: () => string) {
    const field = useOriField()
    const uid = ownId ? '' : useId()
    const fieldId = computed(() => field?.id.value ?? (ownId ? ownId() : (props().id ?? uid)))
    const hintId = computed(() => `${fieldId.value}-hint`)
    const errorId = computed(() => `${fieldId.value}-error`)
    // An error replaces the hint, so only the helper actually rendered is referenced.
    const describedBy = useDescribedBy(() => {
        if (field) return [field.describedBy.value]
        const { describedby, error, hint } = props()
        return [error ? errorId.value : hint ? hintId.value : undefined, describedby]
    })
    return {
        inField: Boolean(field),
        fieldId,
        hintId,
        errorId,
        describedBy,
        isInvalid: computed(() => (field ? field.invalid.value : Boolean(props().invalid || props().error))),
        isRequired: computed(() => Boolean(props().required) || (field?.required.value ?? false)),
        isDisabled: computed(() => Boolean(props().disabled) || (field?.disabled.value ?? false)),
        fieldSize: computed(() => field?.size.value ?? props().size)
    }
}

/**
 * The OriField wiring of a group control: radio group, segmented control, color picker. No single element
 * takes a `<label for>`, so the group names itself with `aria-labelledby` and the field drops its label's
 * `for`. A group shows no hint or error of its own; inside a field it is described by the field's.
 */
export function useFieldGroup(props: () => FieldGroupProps) {
    const field = useOriField()
    field?.markGroup?.()
    const uid = useId()
    const ownLabelId = `${uid}-label`
    return {
        inField: Boolean(field),
        groupName: computed(() => props().name ?? uid),
        ownLabelId,
        labelledBy: computed(() => (field ? field.labelId.value : props().label ? ownLabelId : undefined)),
        describedBy: useDescribedBy(() => [field?.describedBy.value]),
        isInvalid: computed(() => field?.invalid.value ?? false),
        isRequired: computed(() => Boolean(props().required) || (field?.required.value ?? false)),
        isDisabled: computed(() => Boolean(props().disabled) || (field?.disabled.value ?? false)),
        groupSize: computed(() => field?.size.value ?? props().size)
    }
}
