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
            <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
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
