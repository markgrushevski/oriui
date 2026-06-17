<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ActionSize, ThemeColor } from '../../types';

interface RadioOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

// OriRadioGroup — a "choose one" control. A role="radiogroup" container names the set via
// aria-labelledby; each option is a real <input type="radio"> sharing one `name` (so the browser
// enforces single-select + native form submission), visually hidden over a styled circle. v-model
// holds the selected value. Unlabelled groups can pass aria-label, which falls through to the root.
const {
    color = 'primary',
    disabled = false,
    name,
    options = [],
    size = 'md'
} = defineProps<{
    color?: ThemeColor;
    disabled?: boolean;
    inline?: boolean;
    label?: string;
    /** Shared radio `name`; auto-generated (useId) when omitted. */
    name?: string;
    options?: RadioOption[];
    required?: boolean;
    size?: ActionSize;
}>();

const model = defineModel<string | number>();

const uid = useId();
const groupName = computed(() => name ?? uid);
const labelId = computed(() => `${uid}-label`);
</script>

<template>
    <div
        :class="[
            'ori-radio-group',
            'ori-color',
            `ori-color_${color}`,
            'ori-font-size',
            `ori-font-size_${size}`,
            { 'ori-radio-group_inline': inline }
        ]"
        role="radiogroup"
        :aria-labelledby="label ? labelId : undefined"
        :aria-required="required ? 'true' : undefined"
    >
        <div v-if="label" :id="labelId" class="ori-radio-group__label">{{ label }}</div>

        <div class="ori-radio-group__options">
            <label
                v-for="opt in options"
                :key="opt.value"
                :class="['ori-radio', { 'ori-radio_disabled': disabled || opt.disabled }]"
            >
                <input
                    v-model="model"
                    class="ori-radio__input"
                    type="radio"
                    :name="groupName"
                    :value="opt.value"
                    :disabled="disabled || opt.disabled"
                    :required="required"
                />
                <span class="ori-radio__circle" aria-hidden="true"></span>
                <span class="ori-radio__label">{{ opt.label }}</span>
            </label>
        </div>
    </div>
</template>

<style>
.ori-radio-group {
    display: inline-flex;
    flex-direction: column;
    gap: 0.5em;

    font-size: var(--ori-font-size);
    line-height: 1.4;
}

.ori-radio-group__label {
    font-weight: 500;
}

.ori-radio-group__options {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
}

.ori-radio-group.ori-radio-group_inline .ori-radio-group__options {
    flex-flow: row wrap;
    gap: 1em;
}

.ori-radio {
    display: inline-flex;
    position: relative;
    align-items: center;
    gap: 0.5em;

    cursor: pointer;
}

.ori-radio.ori-radio_disabled {
    opacity: 0.55;

    cursor: not-allowed;
}

.ori-radio__input {
    position: absolute;
    width: 1.15em;
    height: 1.15em;
    margin: 0;

    opacity: 0;

    cursor: inherit;
}

.ori-radio__circle {
    display: inline-flex;
    box-sizing: border-box;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 1.15em;
    height: 1.15em;

    transition: border-color 0.15s ease-out;

    border: 1px solid color-mix(in srgb, currentcolor 40%, transparent);
    border-radius: 50%;
}

.ori-radio__circle::after {
    content: '';
    width: 0.6em;
    height: 0.6em;

    transform: scale(0);
    transition: transform 0.15s ease-out;

    border-radius: 50%;

    background-color: var(--ori-color);
}

.ori-radio__input:checked ~ .ori-radio__circle {
    border-color: var(--ori-color);
}

.ori-radio__input:checked ~ .ori-radio__circle::after {
    transform: scale(1);
}

.ori-radio__input:focus-visible ~ .ori-radio__circle {
    outline: 2px solid var(--ori-color);
    outline-offset: 2px;
}
</style>
