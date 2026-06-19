<script lang="ts" setup>
import type { ThemeColor } from '../../types';
import { OriIcon } from '../icon';

const { closable = false, color = 'surface' } = defineProps<{
    closable?: boolean;
    color?: ThemeColor;
    icon?: string;
    text?: string;
    title?: string;
}>();

defineEmits<{ close: [] }>();
</script>

<template>
    <div :class="['ori-toast', { [`ori-color_${color}`]: color }]" :role="color === 'danger' ? 'alert' : 'status'">
        <ori-icon v-if="icon" :icon="icon" class="ori-toast__icon" />

        <div class="ori-toast__body">
            <div v-if="title" class="ori-toast__title">{{ title }}</div>
            <div v-if="text || $slots.default" class="ori-toast__text">
                <slot>{{ text }}</slot>
            </div>
        </div>

        <button
            v-if="closable"
            class="ori-toast__close"
            type="button"
            aria-label="Dismiss notification"
            @click="$emit('close')"
        >
            ×
        </button>
    </div>
</template>
