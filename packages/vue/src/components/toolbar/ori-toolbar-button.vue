<script lang="ts" setup>
import { computed, mergeProps, useSlots } from 'vue'
import type { ActionSize, RadiusSize, ThemeColor, Variant } from '../../types'
import { useToolbarItem } from '@oriui/headless/vue'
import { OriButton } from '../button'
import { OriTooltip } from '../tooltip'

// OriToolbarButton — a button that participates in the toolbar's roving tabindex. Composes OriButton
// for the visuals and `useToolbarItem` for the roving props. Two toolbar-specific additions: a `pressed`
// state (→ aria-pressed, for toggle buttons like bold/italic), and a baked `tooltip` that auto-wires
// aria-describedby onto the real <button> — the accessible fix a pure-CSS tooltip can't do on its own.
//
// `disabled` is aria-disabled + STILL FOCUSABLE (WAI-ARIA toolbar discoverability): roving visits it,
// but activation is blocked. inheritAttrs:false so a caller's listeners/attrs land on the <button>,
// not the tooltip wrapper.
const {
    ariaLabel,
    color,
    disabled = false,
    icon,
    label,
    // `= undefined` is load-bearing: Vue coerces an ABSENT boolean prop to `false`, which would render
    // aria-pressed="false" on a plain (non-toggle) button. An explicit default opts out of that coercion
    // so an unbound `pressed` stays `undefined` — no aria-pressed. Same footgun as OriDialog's `open`.
    pressed = undefined,
    radius,
    size,
    tooltip,
    variant = 'text'
} = defineProps<{
    /** Accessible name for an icon-only control (→ aria-label); falls back to `tooltip`. */
    ariaLabel?: string
    color?: ThemeColor
    disabled?: boolean
    icon?: string
    /** Visible button text. Forwarded to OriButton; the default slot overrides it. */
    label?: string
    /** Toggle state → aria-pressed. Omit for a plain action button (no aria-pressed rendered). */
    pressed?: boolean
    radius?: RadiusSize
    size?: ActionSize
    /** Optional tooltip; renders an OriTooltip and wires aria-describedby onto the button. */
    tooltip?: string
    variant?: Variant
}>()

defineOptions({ inheritAttrs: false })

const { itemProps } = useToolbarItem()
const slots = useSlots()

// A11y guardrail (dev only): an icon-only button with no name is an axe `button-name` failure. Warn
// when `icon` is set but there's no `aria-label` / `tooltip` / `label` to name it (mirrors OriToolbar's warn).
if (import.meta.env?.DEV && icon && !ariaLabel && !tooltip && !label) {
    console.warn(
        '[OriToolbarButton] an icon-only button needs an accessible name — pass `aria-label` (or `tooltip` / `label`).'
    )
}

// aria-describedby points the tooltip at the button ONLY when it's a genuine supplementary description
// (something else already names the button). When the name itself falls back to the tooltip text, describing
// with the same text would double-announce (name == description), so it's omitted.
const named = () => Boolean(ariaLabel || label || slots.default)
const describedBy = (bubbleId: string) => (named() ? bubbleId : undefined)

// OriButton props + the toolbar/roving/a11y attributes (the latter fall through to the <button>).
//
// The `aria-label` falls back to `tooltip` ONLY for a button with no visible text. Overriding a
// rendered label with the tooltip would break WCAG 2.5.3 Label in Name: the button reads "Save" and
// answers to "Write the current document to disk", so a voice-control user saying "click Save"
// cannot activate it. That combination became reachable the moment `text` was renamed to `label` —
// before it, the visible text and the accessible name were different props and could not collide.
const buttonBindings = computed(() => ({
    ...itemProps.value,
    color,
    icon,
    label,
    radius,
    size,
    variant,
    'aria-label': ariaLabel ?? (label || slots.default ? undefined : tooltip),
    'aria-pressed': pressed,
    'aria-disabled': disabled || undefined
}))

// Block activation of an aria-disabled item. CSS pointer-events:none already stops the mouse; this
// covers the keyboard (Enter/Space fire a click on a focused button). Capture phase + stopImmediate so
// a caller's own @click (bubble, same element) never runs.
function onClickCapture(event: MouseEvent): void {
    if (disabled) {
        event.stopImmediatePropagation()
        event.preventDefault()
    }
}
</script>

<template>
    <OriTooltip v-if="tooltip" :content="tooltip">
        <template #default="{ bubbleId }">
            <OriButton
                v-bind="mergeProps(buttonBindings, $attrs)"
                :aria-describedby="describedBy(bubbleId)"
                @click.capture="onClickCapture"
            >
                <!-- Forward the caller's children (any icon source) to OriButton; when absent, OriButton
                     falls back to the `icon`/`label` props. The `v-if` keeps that fallback working — an
                     always-present (even empty) slot would suppress it. -->
                <template v-if="$slots.default" #default><slot></slot></template>
            </OriButton>
        </template>
    </OriTooltip>

    <OriButton v-else v-bind="mergeProps(buttonBindings, $attrs)" @click.capture="onClickCapture">
        <template v-if="$slots.default" #default><slot></slot></template>
    </OriButton>
</template>
