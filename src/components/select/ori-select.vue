<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor } from '../../types';

interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

// OriSelect — a native-first styled select: the real <select> owns the dropdown, keyboard and a11y;
// we only style the closed control and draw a decorative chevron. Mirrors OriInput's tokens/spacing
// (border, bg, focus ring reading --ori-color, padding, radius/action-size/font-size aliases) and the
// real-attribute state contract (native `disabled`, `aria-invalid`) styled with attribute selectors.
// Options can come from the `options` prop (rendered as <option>s) or a hand-written default slot.
// v-model holds the selected value; an optional `placeholder` renders a disabled, selected-by-default
// first option. Arbitrary native attrs (name, required, autocomplete, …) fall through to the <select>
// via inheritAttrs:false + v-bind="$attrs".
defineOptions({ inheritAttrs: false });

const {
    color = 'primary',
    disabled = false,
    id,
    invalid = false,
    options = [],
    radius = 'md',
    size = 'md'
} = defineProps<{
    color?: ThemeColor;
    disabled?: boolean;
    id?: string;
    invalid?: boolean;
    options?: SelectOption[];
    placeholder?: string;
    radius?: RadiusSize;
    size?: ActionSize;
}>();

const model = defineModel<string | number>();

// SSR-safe id (Vue 3.5) so a caller's <label for> can target the control without passing one.
const uid = useId();
const fieldId = computed(() => id ?? uid);
</script>

<template>
    <div :class="['ori-select', 'ori-color', `ori-color_${color}`, 'ori-font-size', `ori-font-size_${size}`]">
        <select
            v-bind="$attrs"
            :id="fieldId"
            v-model="model"
            :class="[
                'ori-select__control',
                'ori-size-action',
                `ori-size-action_${size}`,
                'ori-size-radius',
                `ori-size-radius_${radius}`
            ]"
            :disabled="disabled"
            :aria-invalid="invalid ? 'true' : undefined"
        >
            <option v-if="placeholder" value="" disabled :selected="model === undefined">{{ placeholder }}</option>
            <slot>
                <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
                    {{ opt.label }}
                </option>
            </slot>
        </select>

        <span class="ori-select__chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentcolor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </span>
    </div>
</template>

<style>
.ori-select {
    --ori-select-border: color-mix(in srgb, currentcolor 28%, transparent);

    display: inline-flex;
    position: relative;
    align-items: center;

    font-size: var(--ori-font-size);
}

.ori-select__control {
    box-sizing: border-box;
    width: 100%;
    height: var(--ori-size-action);
    padding-inline: 0.75em;
    padding-inline-end: 2.25em;

    transition:
        border-color 0.15s ease-out,
        box-shadow 0.15s ease-out;

    border: 1px solid var(--ori-select-border);
    border-radius: var(--ori-size-radius);

    background: transparent;
    color: inherit;

    font-family: inherit;
    font-size: var(--ori-font-size);
    line-height: 1;

    cursor: pointer;
    appearance: none;
}

.ori-select__control:focus {
    border-color: var(--ori-color);
    outline: none;

    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ori-color) 25%, transparent);
}

.ori-select__control[aria-invalid='true'] {
    border-color: var(--ori-color-danger);
}

.ori-select__control[aria-invalid='true']:focus {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ori-color-danger) 25%, transparent);
}

.ori-select__control:disabled {
    opacity: 0.55;

    background: color-mix(in srgb, currentcolor 4%, transparent);

    cursor: not-allowed;
}

.ori-select__chevron {
    display: inline-flex;
    position: absolute;
    inset-inline-end: 0.75em;
    align-items: center;
    justify-content: center;
    width: 1em;
    height: 1em;

    color: color-mix(in srgb, currentcolor 60%, transparent);

    pointer-events: none;
}

.ori-select__chevron > svg {
    width: 100%;
    height: 100%;
}

.ori-select__control:disabled ~ .ori-select__chevron {
    opacity: 0.55;
}
</style>
