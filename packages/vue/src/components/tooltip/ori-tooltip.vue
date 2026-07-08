<script lang="ts" setup>
import { useId } from 'vue';
import type { AnchoredPlacement, ThemeColor } from '../../types';

// OriTooltip — a CSS-driven tooltip overlay, native-first: no JS state machine and no positioning
// engine. The default slot is the trigger; the .ori-tooltip__bubble[role="tooltip"] is always in the
// DOM (so the aria-describedby relationship is stable) but visually hidden — pointer-events:none and
// opacity/visibility:hidden — until the wrapper is hovered or receives focus. Show is pure CSS: the
// wrapper's :focus-within (keyboard) plus :hover wrapped in @media (hover: hover) so a tap on touch
// doesn't leave it stuck open.
//
// Placement rides the shared `.ori-anchored` primitive (CSS Anchor Positioning): the 12-value
// `<side>[-start|-end]` grid with zero-JS collision handling — position-try flips the bubble when the
// preferred side lacks room, and the bare sides anchor-center so the bubble shifts back into view at
// screen edges. No per-instance anchor wiring is needed: the trigger and bubble pair through a shared
// default anchor-name in tooltip.css (the trigger always immediately precedes its bubble, so anchor
// resolution finds the right one); Esc-to-dismiss would need JS (out of scope; the CSS-only model
// dismisses on blur / pointer-leave).
//
// Color: the bubble defaults to a dedicated neutral inverse chip (neutral-900 on neutral-50) — NOT
// var(--ori-color)/var(--ori-color-on), which are globally defined (currentColor) and so would pair
// bg and text from two different sources. When `color` is set the wrapper gets the ori-color utility
// and tooltip.css repoints the bubble's bg + text as a pair from that one role source.
const {
    color,
    content,
    placement = 'top'
} = defineProps<{
    color?: ThemeColor;
    /** Tooltip text. For rich content use the #content slot instead (it takes precedence). */
    content?: string;
    placement?: AnchoredPlacement;
}>();

// SSR-safe id (Vue 3.5) so the trigger's aria-describedby always targets the bubble.
const bubbleId = useId();
</script>

<template>
    <span :class="['ori-tooltip', color && `ori-color_${color}`]">
        <span class="ori-tooltip__trigger" :aria-describedby="bubbleId">
            <!-- bubbleId is exposed so the consumer can put aria-describedby on their OWN focusable
                 control — aria-describedby only announces when the element bearing it is focused, and
                 this wrapper span isn't focusable. -->
            <slot :bubble-id="bubbleId" />
        </span>

        <span
            :id="bubbleId"
            :class="['ori-tooltip__bubble', 'ori-anchored', `ori-anchored_${placement}`]"
            role="tooltip"
        >
            <slot name="content">{{ content }}</slot>
        </span>
    </span>
</template>
