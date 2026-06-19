<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor } from '../../types';

defineOptions({ inheritAttrs: false });

const {
    radius = 'rounded',
    size = 'lg',
    text
} = defineProps<{
    color?: ThemeColor;
    inline?: boolean;
    radius?: RadiusSize;
    size?: ActionSize;
    spaced?: boolean;
    subtitle?: string;
    text?: string;
    title?: string;
    reverse?: boolean;
}>();

const loaded = ref(false);

const name = computed(() => {
    const words = text?.trim()?.split(' ') ?? [];

    if (words.length > 0) {
        const [word1, word2] = words;
        const letter1 = word1?.[0] ?? '';
        const letter2 = word2?.[0] ?? '';
        return letter1.toUpperCase() + letter2.toUpperCase();
    }

    return '';
});
</script>

<template>
    <div
        :class="[
            'ori-avatar',
            {
                'ori-avatar_reverse': reverse,
                'ori-avatar_inline': inline,
                'ori-avatar_titled': title || subtitle,
                [`ori-size-action ori-size-action_${size}`]: size,
                [`ori-size-action-space ori-size-action-space_${size}`]: size && spaced,
                [`ori-size-radius ori-size-radius_${radius}`]: radius,
                [`ori-font-size ori-font-size_${size}`]: size,
                [`ori-color ori-color_${color}`]: color
            }
        ]"
    >
        <img
            v-if="$attrs.src"
            v-show="loaded"
            class="ori-avatar__image"
            v-bind="$attrs"
            :alt="text || ''"
            @load="loaded = true"
        />
        <div v-if="!$attrs.src || !loaded" aria-hidden="true" class="ori-avatar__backdrop">{{ name }}</div>
        <div v-if="title || subtitle" class="ori-avatar__text">
            <div class="ori-avatar__title">{{ title }}</div>
            <div class="ori-avatar__subtitle">{{ subtitle }}</div>
        </div>
    </div>
</template>
