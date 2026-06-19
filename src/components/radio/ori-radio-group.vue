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
