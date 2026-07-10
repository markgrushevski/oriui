<script lang="ts" setup>
import { computed, mergeProps } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor, Variant } from '../../types';
import { useToolbarToggleItem } from '@oriui/headless/vue';
import { OriButton } from '../button';
import { OriTooltip } from '../tooltip';

// OriToolbarToggleItem — a toggle button inside an OriToolbarToggleGroup. Composes OriButton with
// `useToolbarToggleItem`, which supplies the roving props PLUS aria-pressed (derived from the group's
// selection) and the onClick that toggles this `value` in the group. Requires a surrounding
// OriToolbarToggleGroup. The pressed look is styled off [aria-pressed='true'] in toolbar.css.
const {
    color,
    disabled = false,
    icon,
    label,
    radius,
    size,
    text,
    tooltip,
    value,
    variant = 'text'
} = defineProps<{
    color?: ThemeColor;
    disabled?: boolean;
    icon?: string;
    /** Accessible name for an icon-only item (→ aria-label); falls back to `tooltip`. */
    label?: string;
    radius?: RadiusSize;
    size?: ActionSize;
    text?: string;
    /** Optional tooltip; wires aria-describedby onto the button. */
    tooltip?: string;
    /** The value this item contributes to the group's v-model (required). */
    value: string;
    variant?: Variant;
}>();

defineOptions({ inheritAttrs: false });

const { itemProps } = useToolbarToggleItem(() => value);

// Dev-only: warn on a nameless icon-only item (axe `button-name`); describedby only when `label` names
// it (else name == tooltip, a double-announce) — see OriToolbarButton for the rationale.
if (import.meta.env?.DEV && icon && !label && !tooltip && !text) {
    console.warn(
        '[OriToolbarToggleItem] an icon-only item needs an accessible name — pass `label` (or `tooltip` / `text`).'
    );
}
const describedBy = (bubbleId: string) => (label ? bubbleId : undefined);

const buttonBindings = computed(() => ({
    ...itemProps.value,
    color,
    icon,
    radius,
    size,
    text,
    variant,
    'aria-label': label ?? tooltip,
    'aria-disabled': disabled || undefined
}));

function onClickCapture(event: MouseEvent): void {
    if (disabled) {
        event.stopImmediatePropagation();
        event.preventDefault();
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
            />
        </template>
    </OriTooltip>

    <OriButton v-else v-bind="mergeProps(buttonBindings, $attrs)" @click.capture="onClickCapture" />
</template>
