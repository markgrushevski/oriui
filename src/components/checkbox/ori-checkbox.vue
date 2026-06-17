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
        :class="[
            'ori-checkbox',
            'ori-color',
            `ori-color_${color}`,
            'ori-font-size',
            `ori-font-size_${size}`,
            { 'ori-checkbox_disabled': disabled }
        ]"
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

<style>
.ori-checkbox {
    display: inline-flex;
    position: relative;
    align-items: center;
    gap: 0.5em;

    font-size: var(--ori-font-size);
    line-height: 1.4;

    cursor: pointer;
}

.ori-checkbox.ori-checkbox_disabled {
    opacity: 0.55;

    cursor: not-allowed;
}

.ori-checkbox__input {
    position: absolute;
    width: 1.15em;
    height: 1.15em;
    margin: 0;

    opacity: 0;

    cursor: inherit;
}

.ori-checkbox__box {
    display: inline-flex;
    box-sizing: border-box;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 1.15em;
    height: 1.15em;

    transition:
        border-color 0.15s ease-out,
        background-color 0.15s ease-out;

    border: 1px solid color-mix(in srgb, currentcolor 40%, transparent);
    border-radius: 0.3em;
}

.ori-checkbox__box::after {
    content: '';
    width: 0.32em;
    height: 0.6em;

    transform: rotate(45deg) scale(0);
    transition: transform 0.15s ease-out;

    border: solid var(--ori-color-on);
    border-width: 0 2px 2px 0;
}

.ori-checkbox__input:checked ~ .ori-checkbox__box {
    border-color: var(--ori-color);

    background-color: var(--ori-color);
}

.ori-checkbox__input:checked ~ .ori-checkbox__box::after {
    transform: rotate(45deg) scale(1);
}

.ori-checkbox__input:focus-visible ~ .ori-checkbox__box {
    outline: 2px solid var(--ori-color);
    outline-offset: 2px;
}
</style>
