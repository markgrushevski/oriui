<script lang="ts" setup>
import type { ActionSize, Variant, ThemeColor, CenteredPosition, RadiusSize } from '../../types'
import { OriSpinner } from '../spinner'
import { OriIcon } from '../icon'

const {
    as = 'button',
    color = 'primary',
    disabled,
    iconPosition = 'left',
    loading,
    // `= undefined` is load-bearing: Vue coerces an ABSENT boolean prop to `false`, which would render
    // aria-pressed="false" on every plain (non-toggle) button. An explicit default opts out of that
    // coercion so an unbound `pressed` stays `undefined` — no aria-pressed. Same footgun as
    // OriToolbarButton's `pressed` and OriDialog's `open`.
    pressed = undefined,
    radius = 'full',
    size = 'md',
    variant = 'solid'
} = defineProps<{
    /** Forced `:active` LOOK (→ `data-active`). Not a toggle state — use `pressed` for that. */
    active?: boolean
    /** An HTML tag name, a Component name or Component class reference. */
    as?: string | object
    color?: ThemeColor
    disabled?: boolean
    fluid?: boolean
    icon?: string
    iconPosition?: CenteredPosition
    loading?: boolean
    /** Toggle STATE (→ `aria-pressed` + the pressed look). Omit for a plain action button. */
    pressed?: boolean
    radius?: RadiusSize
    size?: ActionSize
    label?: string
    variant?: Variant
}>()

// `disabled` / `loading` on a non-`button` `as` (a link, a router link) gets no real `disabled`
// attribute, so CSS `pointer-events: none` is the only guard — and it does not stop the keyboard:
// Enter on a focused <a> still navigates. Block activation the way OriToolbarButton already does:
// capture phase + stopImmediatePropagation so a caller's own @click (bubble, same element) never
// runs, plus preventDefault so the browser's own default action (following the href) doesn't either.
// A real <button> needs none of this — the `disabled` attribute below stops the event at the source, and
// the listener must NOT be bound there at all: a capture listener on the root swallows a caller's
// fall-through @click on a real button (tests/button.test.ts pins it). Hence the conditional binding,
// in the camelCase form — `:on-click-capture` does not compile to a capture listener, and the
// `@click.capture` shorthand cannot be made conditional.
function onClickCapture(event: MouseEvent): void {
    if (as !== 'button' && (disabled || loading)) {
        event.stopImmediatePropagation()
        event.preventDefault()
    }
}
</script>

<template>
    <component
        :is="as"
        :class="[
            'ori-button',
            {
                'ori-button_icon': Boolean(icon) && !label,
                'ori-button_fluid': fluid,
                [`ori-button_icon-position_${iconPosition}`]: iconPosition,
                [`ori-button_${size}`]: size,
                [`ori-size-radius_${radius}`]: radius,
                [`ori-font-size_${size}`]: size,
                [`ori-variant_${variant}`]: variant,
                [`ori-color_${color}`]: color
            }
        ]"
        :type="as === 'button' ? 'button' : undefined"
        :disabled="as === 'button' && (disabled || loading) ? true : undefined"
        :aria-disabled="disabled || (loading && as !== 'button') ? 'true' : undefined"
        :aria-busy="loading ? 'true' : undefined"
        :aria-pressed="pressed"
        :data-active="active ? '' : undefined"
        :tabindex="disabled && as !== 'button' ? -1 : undefined"
        :onClickCapture="as === 'button' ? undefined : onClickCapture"
    >
        <slot>
            <ori-icon v-if="icon && !loading" :icon="icon" class="ori-button__icon" />
            <ori-spinner v-else-if="loading" aria-hidden="true" class="ori-button__icon" />

            <span v-if="label" class="ori-button__text">{{ label }}</span>
        </slot>
    </component>
</template>
