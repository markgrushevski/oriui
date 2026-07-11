<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ThemeColor } from '../../types';

const {
    color = 'primary',
    max = 100,
    min = 0,
    modelValue,
    step = 1
} = defineProps<{
    color?: ThemeColor;
    disabled?: boolean;
    label?: string;
    max?: number;
    min?: number;
    modelValue?: number;
    /** Show the current value next to the label. */
    showValue?: boolean;
    step?: number;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: number];
    change: [value: number];
}>();

// Attributes (aria-label, name, id, …) target the real <input>, not the wrapper — the native
// role/value/keyboard live there, so the accessible name must too (mirrors the other form controls).
defineOptions({ inheritAttrs: false });

const id = useId();
const current = computed(() => modelValue ?? min);
const percent = computed(() => {
    const span = max - min;
    return span > 0 ? ((current.value - min) / span) * 100 : 0;
});

function onInput(event: Event) {
    emit('update:modelValue', Number((event.target as HTMLInputElement).value));
}

// Commit-on-release. The native `change` fires ONCE when the value settles — pointer release after a
// drag, or a keyboard step — not on every tick like `input`. So a consumer can commit a whole drag as
// a single undo step (or run a per-release side effect) via `@change`, while `update:modelValue`
// keeps streaming the live value for `v-model`. (Was reachable only as a raw-Event $attrs fallthrough;
// declaring it makes it a first-class typed emit carrying the committed number.)
function onChange(event: Event) {
    emit('change', Number((event.target as HTMLInputElement).value));
}
</script>

<template>
    <div :class="['ori-slider', { [`ori-color_${color}`]: color }]" :data-disabled="disabled ? '' : undefined">
        <label v-if="label || showValue || $slots.label" :for="id" class="ori-slider__label">
            <span v-if="label || $slots.label"
                ><slot name="label">{{ label }}</slot></span
            >
            <span v-if="showValue" class="ori-slider__value">{{ current }}</span>
        </label>

        <input
            :id="id"
            class="ori-slider__input"
            type="range"
            v-bind="$attrs"
            :min="min"
            :max="max"
            :step="step"
            :value="current"
            :disabled="disabled"
            :style="{ '--ori-slider-pct': `${percent}%` }"
            @input="onInput"
            @change="onChange"
        />
    </div>
</template>
