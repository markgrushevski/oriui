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

<style>
.ori-progress {
    --ori-progress-height: 8px;

    display: block;
    width: 100%;
}

.ori-progress.ori-progress_sm {
    --ori-progress-height: 4px;
}

.ori-progress.ori-progress_lg {
    --ori-progress-height: 12px;
}

.ori-progress__track {
    position: relative;

    width: 100%;
    height: var(--ori-progress-height);

    overflow: hidden;

    border-radius: var(--ori-size-radius);

    /* Neutral track (from the inherited text color), not a tint of --ori-color: the filled-vs-unfilled
       boundary must clear 3:1 for any role — a same-hue tint fails for pale roles (e.g. warn). */
    background-color: color-mix(in srgb, currentcolor 14%, transparent);
}

.ori-progress__indicator {
    width: 0;
    height: 100%;

    transition: width 0.25s ease-out;

    border-radius: var(--ori-size-radius);

    background-color: var(--ori-color);
}

.ori-progress__indicator[data-indeterminate] {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;

    width: 40%;

    transition: none;

    animation: ori-progress-indeterminate 1.4s ease-in-out infinite;
}

@keyframes ori-progress-indeterminate {
    0% {
        inset-inline-start: -40%;
        width: 40%;
    }

    50% {
        width: 60%;
    }

    100% {
        inset-inline-start: 100%;
        width: 40%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .ori-progress__indicator {
        transition: none;
    }

    .ori-progress__indicator[data-indeterminate] {
        inset-inline-start: 0;
        width: 100%;

        animation: none;
    }
}
</style>
