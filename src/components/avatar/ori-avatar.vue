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
    shadow?: boolean;
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
        <img v-if="$attrs.src" v-show="loaded" class="ori-avatar__image" v-bind="$attrs" @load="loaded = true" />
        <div v-if="!$attrs.src || !loaded" class="ori-avatar__backdrop">{{ name }}</div>
        <div v-if="title || subtitle" class="ori-avatar__text">
            <div class="ori-avatar__title">{{ title }}</div>
            <div class="ori-avatar__subtitle">{{ subtitle }}</div>
        </div>
    </div>
</template>

<style>
.ori-avatar {
    --ori-font-size_md: calc(1rem + 2px);
    --ori-color: #00000018;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--ori-size-gap) * 1.5);

    width: var(--ori-size-action);
    height: var(--ori-size-action);

    border-radius: var(--ori-size-radius);
}

.ori-avatar.ori-avatar_inline {
    display: inline-flex;
    margin: 0.25em;
}

.ori-avatar.ori-avatar_titled {
    width: max-content;
}

.ori-avatar.ori-avatar_reverse {
    flex-direction: row-reverse;
}

.ori-avatar__image,
.ori-avatar__backdrop {
    width: 100%;
    height: 100%;

    border-radius: var(--ori-size-radius);
}

.ori-avatar__backdrop {
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: var(--ori-color);
    color: currentcolor;

    font-size: max(10px, var(--ori-font-size));
}

.ori-avatar.ori-avatar_titled .ori-avatar__image,
.ori-avatar.ori-avatar_titled .ori-avatar__backdrop {
    width: var(--ori-size-action);
    height: var(--ori-size-action);
}

.ori-avatar__text {
    display: flex;
    flex-direction: column;

    font-size: max(10px, calc(var(--ori-font-size) - var(--ori-font-size-step_dec) * 2));
    line-height: 1.5;
    white-space: nowrap;
}

.ori-avatar.ori-avatar_reverse .ori-avatar__text {
    align-items: flex-end;
}

.ori-avatar__subtitle {
    opacity: 0.8;
    font-size: smaller;
}
</style>
