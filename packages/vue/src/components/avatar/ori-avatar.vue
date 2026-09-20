<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { ActionSize, RadiusSize, ThemeColor } from '../../types'

defineOptions({ inheritAttrs: false })

const {
    name,
    radius = 'full',
    size = 'lg'
} = defineProps<{
    color?: ThemeColor
    inline?: boolean
    /** The person or entity the avatar stands for: drives the initials fallback and the image `alt`. */
    name?: string
    radius?: RadiusSize
    size?: ActionSize
    spaced?: boolean
    subtitle?: string
    title?: string
    reverse?: boolean
}>()

const loaded = ref(false)

const initials = computed(() => {
    const words = name?.trim()?.split(' ') ?? []

    if (words.length > 0) {
        const [word1, word2] = words
        const letter1 = word1?.[0] ?? ''
        const letter2 = word2?.[0] ?? ''
        return letter1.toUpperCase() + letter2.toUpperCase()
    }

    return ''
})
</script>

<template>
    <div
        :class="[
            'ori-avatar',
            {
                'ori-avatar_reverse': reverse,
                'ori-avatar_inline': inline,
                'ori-avatar_titled': title || subtitle || $slots.title || $slots.subtitle,
                [`ori-avatar_${size}`]: size,
                [`ori-size-action-space_${size}`]: size && spaced,
                [`ori-size-radius_${radius}`]: radius,
                [`ori-font-size_${size}`]: size,
                [`ori-color_${color}`]: color
            }
        ]"
    >
        <img
            v-if="$attrs.src"
            v-show="loaded"
            class="ori-avatar__image"
            v-bind="$attrs"
            :alt="name || ''"
            @load="loaded = true"
        />
        <div v-if="!$attrs.src || !loaded" aria-hidden="true" class="ori-avatar__backdrop">
            <slot name="fallback">{{ initials }}</slot>
        </div>
        <div v-if="title || subtitle || $slots.title || $slots.subtitle" class="ori-avatar__text">
            <div class="ori-avatar__title">
                <slot name="title">{{ title }}</slot>
            </div>
            <div class="ori-avatar__subtitle">
                <slot name="subtitle">{{ subtitle }}</slot>
            </div>
        </div>
    </div>
</template>
