<script lang="ts" setup>
import { mergeProps } from 'vue'
import type { ActionSize, RadiusSize, ThemeColor, Variant } from '../../types'
import { useToolbarToggleItem } from '@oriui/headless/vue'
import { OriButton } from '../button'
import { OriTooltip } from '../tooltip'
import { useItemButton } from './use-item-button'

// OriToolbarToggleItem — a toggle button inside an OriToolbarToggleGroup. Composes OriButton with
// `useToolbarToggleItem`, which supplies the roving props PLUS aria-pressed (derived from the group's
// selection) and the onClick that toggles this `value` in the group. Requires a surrounding
// OriToolbarToggleGroup. The pressed look is styled off [aria-pressed='true'] in toolbar.css.
const {
    ariaLabel,
    color,
    disabled = false,
    icon,
    label,
    radius,
    size,
    tooltip,
    value,
    variant = 'text'
} = defineProps<{
    /** Accessible name for an icon-only control (→ aria-label); falls back to `tooltip`. */
    ariaLabel?: string
    color?: ThemeColor
    disabled?: boolean
    icon?: string
    /** Visible item text. Forwarded to OriButton; the default slot overrides it. */
    label?: string
    radius?: RadiusSize
    size?: ActionSize
    /** Optional tooltip; wires aria-describedby onto the button. */
    tooltip?: string
    /** The value this item contributes to the group's v-model (required). */
    value: string
    variant?: Variant
}>()

defineOptions({ inheritAttrs: false })

const { itemProps } = useToolbarToggleItem(() => value)
const { bindings, describedBy, onClickCapture } = useItemButton(
    () => ({ ariaLabel, color, disabled, icon, label, radius, size, tooltip, variant }),
    itemProps,
    'OriToolbarToggleItem'
)
</script>

<template>
    <OriTooltip v-if="tooltip" :content="tooltip">
        <template #default="{ bubbleId }">
            <OriButton
                ref="button"
                v-bind="mergeProps(bindings, $attrs)"
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

    <OriButton v-else ref="button" v-bind="mergeProps(bindings, $attrs)" @click.capture="onClickCapture">
        <template v-if="$slots.default" #default><slot></slot></template>
    </OriButton>
</template>
