<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ActionSize, ThemeColor } from '../../types';

// OriSwitch — a real <input type="checkbox" role="switch">, visually hidden over a track + thumb.
// Same approach as OriCheckbox (native control for keyboard/a11y/forms; accent + focus ring from the
// ori-color token), but presented as an on/off toggle. v-model is a boolean.
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
}>();

const model = defineModel<boolean>();

const uid = useId();
const fieldId = computed(() => id ?? uid);
</script>

<template>
    <label
        :for="fieldId"
        :class="[
            'ori-switch',
            'ori-color',
            `ori-color_${color}`,
            'ori-font-size',
            `ori-font-size_${size}`,
            { 'ori-switch_disabled': disabled }
        ]"
    >
        <input
            v-bind="$attrs"
            :id="fieldId"
            v-model="model"
            class="ori-switch__input"
            type="checkbox"
            role="switch"
            :disabled="disabled"
            :required="required"
            :aria-invalid="invalid ? 'true' : undefined"
        />
        <span class="ori-switch__track" aria-hidden="true">
            <span class="ori-switch__thumb"></span>
        </span>
        <span v-if="label" class="ori-switch__label">{{ label }}</span>
    </label>
</template>

<style>
.ori-switch {
    display: inline-flex;
    position: relative;
    align-items: center;
    gap: 0.5em;

    font-size: var(--ori-font-size);
    line-height: 1.4;

    cursor: pointer;
}

.ori-switch.ori-switch_disabled {
    opacity: 0.55;

    cursor: not-allowed;
}

.ori-switch__input {
    position: absolute;
    width: 2.2em;
    height: 1.2em;
    margin: 0;

    opacity: 0;

    cursor: inherit;
}

.ori-switch__track {
    display: inline-flex;
    box-sizing: border-box;
    flex-shrink: 0;
    align-items: center;
    width: 2.2em;
    height: 1.2em;
    padding: 2px;

    transition: background-color 0.15s ease-out;

    border-radius: 1em;

    background-color: color-mix(in srgb, currentcolor 30%, transparent);
}

.ori-switch__thumb {
    width: calc(1.2em - 4px);
    height: calc(1.2em - 4px);

    transform: translateX(0);
    transition: transform 0.15s ease-out;

    border-radius: 50%;

    background-color: #ffffff;

    box-shadow: 0 1px 2px color-mix(in srgb, #000000 35%, transparent);
}

.ori-switch__input:checked ~ .ori-switch__track {
    background-color: var(--ori-color);
}

.ori-switch__input:checked ~ .ori-switch__track .ori-switch__thumb {
    transform: translateX(1em);
}

.ori-switch__input:focus-visible ~ .ori-switch__track {
    outline: 2px solid var(--ori-color);
    outline-offset: 2px;
}
</style>
