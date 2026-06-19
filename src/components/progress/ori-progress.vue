<script lang="ts" setup>
import { computed } from 'vue';
import type { RadiusSize, ThemeColor } from '../../types';

const {
    color = 'primary',
    indeterminate = false,
    label = 'Loading',
    max = 100,
    radius = 'rounded',
    size = 'md',
    value = 0
} = defineProps<{
    color?: ThemeColor;
    indeterminate?: boolean;
    label?: string;
    max?: number;
    radius?: RadiusSize;
    size?: 'sm' | 'md' | 'lg';
    value?: number;
}>();

const clamped = computed(() => Math.min(Math.max(value, 0), max));
const percent = computed(() => (max > 0 ? (clamped.value / max) * 100 : 0));
</script>

<template>
    <div
        :class="[
            'ori-progress',
            `ori-progress_${size}`,
            {
                [`ori-size-radius ori-size-radius_${radius}`]: radius,
                [`ori-color ori-color_${color}`]: color
            }
        ]"
        role="progressbar"
        :aria-label="label"
        :aria-valuemin="0"
        :aria-valuemax="max"
        :aria-valuenow="indeterminate ? undefined : clamped"
    >
        <div class="ori-progress__track">
            <div
                class="ori-progress__indicator"
                :data-indeterminate="indeterminate ? '' : undefined"
                :style="indeterminate ? undefined : { width: `${percent}%` }"
            ></div>
        </div>
    </div>
</template>
