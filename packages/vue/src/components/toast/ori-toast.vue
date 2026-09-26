<script lang="ts" setup>
import type { ThemeColor } from '../../types'
import { OriButton } from '../button'
import { OriIcon } from '../icon'

const {
    align = 'start',
    closable = false,
    color = 'surface'
} = defineProps<{
    /** Label of an action button, such as "Undo". The button emits `action`. */
    actionLabel?: string
    /** Where the body sits in the card. `center` also lifts the dismiss button out of the flex flow, so
     *  the text is centred on the CARD rather than on the space the button leaves behind. */
    align?: 'start' | 'center'
    closable?: boolean
    color?: ThemeColor
    icon?: string
    text?: string
    title?: string
}>()

defineEmits<{ action: []; close: [] }>()
</script>

<template>
    <div
        :class="['ori-toast', { [`ori-color_${color}`]: color, 'ori-toast_align-center': align === 'center' }]"
        :role="color === 'danger' ? 'alert' : 'status'"
    >
        <slot name="icon">
            <ori-icon v-if="icon" :icon="icon" class="ori-toast__icon" />
        </slot>

        <div class="ori-toast__body">
            <div v-if="title || $slots.title" class="ori-toast__title">
                <slot name="title">{{ title }}</slot>
            </div>
            <div v-if="text || $slots.default" class="ori-toast__text">
                <slot>{{ text }}</slot>
            </div>
        </div>

        <ori-button
            v-if="actionLabel"
            class="ori-toast__action"
            :label="actionLabel"
            size="sm"
            variant="soft"
            @click="$emit('action')"
        />

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
