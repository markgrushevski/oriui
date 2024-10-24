<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { ActionSize, CenteredPosition, RadiusSize, ThemeColor } from '../../';

defineOptions({ inheritAttrs: false });

const p = withDefaults(
    defineProps<{
        color?: ThemeColor;
        /** @default "left" */
        iconPosition?: CenteredPosition;
        inline?: boolean;
        /** @default "rounded" */
        radius?: RadiusSize;
        shadow?: boolean;
        /** @default "lg" */
        size?: ActionSize;
        spaced?: boolean;
        subtitle?: string;
        text?: string;
        title?: string;
        reverse?: boolean;
    }>(),
    {
        iconPosition: 'left',
        radius: 'rounded',
        size: 'lg'
    }
);

const loaded = ref(false);

const name = computed(() => {
    const words = p.text?.trim()?.split(' ') ?? [];

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
            'v-avatar',
            {
                'v-avatar_reverse': reverse,
                'v-avatar_inline': inline,
                'v-avatar_titled': title || subtitle,
                [`v-avatar_icon-position_${iconPosition}`]: iconPosition && (title || subtitle),
                [`v-size-action v-size-action_${size}`]: size,
                [`v-size-action-space v-size-action-space_${size}`]: size && spaced,
                [`v-size-radius v-size-radius_${radius}`]: radius,
                [`v-font-size v-font-size_${size}`]: size,
                [`v-color v-color_${color}`]: color
            }
        ]"
    >
        <img v-if="$attrs.src" v-show="loaded" class="v-avatar__image" v-bind="$attrs" @load="loaded = true" />
        <div v-if="!$attrs.src || !loaded" class="v-avatar__backdrop">{{ name }}</div>
        <div v-if="title || subtitle" class="v-avatar__text">
            <div class="v-avatar__title">{{ title }}</div>
            <div class="v-avatar__subtitle">{{ subtitle }}</div>
        </div>
    </div>
</template>

<style>
.v-avatar {
    --v-font-size_md: calc(1rem + 2px);
    --v-color: #00000018;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--v-size-gap) * 1.5);

    width: var(--v-size-action);
    height: var(--v-size-action);

    border-radius: var(--v-size-radius);
}

.v-avatar.v-avatar_inline {
    display: inline-flex;
    margin: 0.25em;
}

.v-avatar.v-avatar_titled {
    width: max-content;
}

.v-avatar.v-avatar_reverse {
    flex-direction: row-reverse;
}

.v-avatar__image,
.v-avatar__backdrop {
    width: 100%;
    height: 100%;

    border-radius: var(--v-size-radius);
}

.v-avatar__backdrop {
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: var(--v-color);
    color: currentcolor;

    font-size: max(10px, var(--v-font-size));
}

.v-avatar.v-avatar_titled .v-avatar__image,
.v-avatar.v-avatar_titled .v-avatar__backdrop {
    width: var(--v-size-action);
    height: var(--v-size-action);
}

.v-avatar__text {
    display: flex;
    flex-direction: column;

    font-size: max(10px, calc(var(--v-font-size) - var(--v-font-size-step_dec) * 2));
    line-height: 1.5;
    white-space: nowrap;
}

.v-avatar.v-avatar_reverse .v-avatar__text {
    align-items: flex-end;
}

.v-avatar__subtitle {
    opacity: 0.8;
    font-size: smaller;
}
</style>
