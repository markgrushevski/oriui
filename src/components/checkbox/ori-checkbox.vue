<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ActionSize, ThemeColor } from '../../types';

// OriCheckbox — a real <input type="checkbox"> kept in the DOM for free keyboard/a11y/form behavior,
// visually hidden over a styled box. v-model accepts a boolean (single) or an array (native group via
// the `value` prop). State is the native attribute; the accent + focus ring come from the ori-color
// token, and the focus ring rides :focus-visible on the box.
defineOptions({ inheritAttrs: false });

const {
    color = 'primary',
    disabled = false,
    id,
    size = 'md'
} = defineProps<{
    color?: ThemeColor;
    disabled?: boolean;
    id?: string;
    invalid?: boolean;
    label?: string;
    required?: boolean;
    size?: ActionSize;
    /** Bound to the array model for a native checkbox group; omit for a single boolean. */
    value?: string | number;
}>();

const model = defineModel<boolean | (string | number)[]>();

const uid = useId();
const fieldId = computed(() => id ?? uid);
</script>

<template>
    <label
        :for="fieldId"
        :class="['ori-checkbox', `ori-color_${color}`, `ori-font-size_${size}`, { 'ori-checkbox_disabled': disabled }]"
    >
        <input
            v-bind="$attrs"
            :id="fieldId"
            v-model="model"
            class="ori-checkbox__input"
            type="checkbox"
            :value="value"
            :disabled="disabled"
            :required="required"
            :aria-invalid="invalid ? 'true' : undefined"
        />
        <span class="ori-checkbox__box" aria-hidden="true"></span>
        <span v-if="label" class="ori-checkbox__label">{{ label }}</span>
    </label>
</template>
