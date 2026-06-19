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
        :class="['ori-switch', `ori-color_${color}`, `ori-font-size_${size}`, { 'ori-switch_disabled': disabled }]"
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
