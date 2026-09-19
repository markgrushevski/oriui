<script lang="ts" setup>
import { computed, ref, useAttrs, useId, watch } from 'vue'
import type { ThemeColor } from '../../types'
import { useOriField } from '../field/context'

const {
    color = 'primary',
    disabled = false,
    max = 100,
    min = 0,
    modelValue,
    step = 1
} = defineProps<{
    color?: ThemeColor
    disabled?: boolean
    label?: string
    max?: number
    min?: number
    modelValue?: number
    /** Show the current value next to the label. */
    showValue?: boolean
    step?: number
}>()

const emit = defineEmits<{
    'update:modelValue': [value: number]
    change: [value: number]
}>()

// Attributes (aria-label, name, id, …) target the real <input>, not the wrapper — the native
// role/value/keyboard live there, so the accessible name must too (mirrors the other form controls).
defineOptions({ inheritAttrs: false })

// Adopt a surrounding OriField's id + a11y wiring (the field's `<label for>` then names the range);
// standalone the slider wires its own. A slider has no required/size concept, so it takes only the
// field's id / disabled / describedby / invalid.
const field = useOriField()
const inField = Boolean(field)
const uid = useId()
const id = computed(() => field?.id.value ?? uid)
const isDisabled = computed(() => disabled || (field?.disabled.value ?? false))
// A caller's own `aria-describedby` arrives through `$attrs`, and the template binds `v-bind="$attrs"`
// BEFORE `:aria-describedby` — so it has to be joined here, or mergeProps would clobber it.
const attrs = useAttrs()
const describedBy = computed(() => {
    const inherited = attrs['aria-describedby'] as string | undefined
    const ids = [field?.describedBy.value, inherited].filter(Boolean)
    return ids.length ? ids.join(' ') : undefined
})
const isInvalid = computed(() => field?.invalid.value ?? false)

// The thumb is the browser's and moves on its own; the fill and the readout are ours. Reading them
// from `modelValue` made the three disagree whenever the prop did not come back — an unbound
// `<OriSlider />`, or a one-way `:model-value` with no handler, which is what every docs example is.
// Measured before this: drag to 5 and the DOM value is 5 while `--ori-slider-pct` and `showValue`
// both sat at the prop. So mirror the element instead: `internal` tracks what the input actually
// holds, `modelValue` writes INTO it when the parent sends one, and everything on screen reads the
// mirror. A parent that updates late (debounced) no longer fights the drag, and a bare slider works
// the way a bare `<input type="range">` does — the native-first promise the rest of this file keeps.
// Seeded through the watcher rather than `ref(modelValue ?? min)`: reading a destructured prop in root
// scope loses reactivity (vue/no-setup-props-reactivity-loss), so the getter form does both jobs.
const internal = ref<number>()
watch(
    () => modelValue,
    (value) => {
        if (value !== undefined) internal.value = value
    },
    { immediate: true }
)

const current = computed(() => internal.value ?? min)
const percent = computed(() => {
    const span = max - min
    return span > 0 ? ((current.value - min) / span) * 100 : 0
})

function onInput(event: Event) {
    const value = Number((event.target as HTMLInputElement).value)
    internal.value = value
    emit('update:modelValue', value)
}

// Commit-on-release. The native `change` fires ONCE when the value settles — pointer release after a
// drag, or a keyboard step — not on every tick like `input`. So a consumer can commit a whole drag as
// a single undo step (or run a per-release side effect) via `@change`, while `update:modelValue`
// keeps streaming the live value for `v-model`. (Was reachable only as a raw-Event $attrs fallthrough;
// declaring it makes it a first-class typed emit carrying the committed number.)
function onChange(event: Event) {
    emit('change', Number((event.target as HTMLInputElement).value))
}
</script>

<template>
    <div :class="['ori-slider', { [`ori-color_${color}`]: color }]" :data-disabled="isDisabled ? '' : undefined">
        <label v-if="!inField && (label || showValue || $slots.label)" :for="id" class="ori-slider__label">
            <span v-if="label || $slots.label"
                ><slot name="label">{{ label }}</slot></span
            >
            <span v-if="showValue" class="ori-slider__value">{{ current }}</span>
        </label>
        <!-- inside a field the field owns the name; still surface the live value if requested -->
        <div v-else-if="inField && showValue" class="ori-slider__label">
            <span class="ori-slider__value">{{ current }}</span>
        </div>

        <input
            :id="id"
            class="ori-slider__input"
            type="range"
            v-bind="$attrs"
            :min="min"
            :max="max"
            :step="step"
            :value="current"
            :disabled="isDisabled"
            :aria-describedby="describedBy"
            :aria-invalid="isInvalid ? 'true' : undefined"
            :style="{ '--ori-slider-pct': `${percent}%` }"
            @input="onInput"
            @change="onChange"
        />
    </div>
</template>
