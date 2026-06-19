<script lang="ts" setup>
import { useId } from 'vue';
import type { ThemeColor } from '../../types';

// OriTooltip — a CSS-driven tooltip overlay, native-first: no JS state machine and no positioning
// engine. The default slot is the trigger; the .ori-tooltip__bubble[role="tooltip"] is always in the
// DOM (so the aria-describedby relationship is stable) but visually hidden — pointer-events:none and
// opacity/visibility:hidden — until the wrapper is hovered or receives focus. Show is pure CSS: the
// wrapper's :focus-within (keyboard) plus :hover wrapped in @media (hover: hover) so a tap on touch
// doesn't leave it stuck open.
//
// Placement is STATIC (top/bottom/left/right via a class) — collision flip / repositioning would need
// a positioning helper (out of scope here), and Esc-to-dismiss would need JS (also out of scope; the
// CSS-only model dismisses on blur / pointer-leave).
//
// Color: when `color` is set the wrapper gets the ori-color utility, which repoints --ori-color /
// --ori-color-on; the bubble reads them as its fill + on-color. With no color class the bubble falls
// back to a neutral inverse surface (dark chip in light mode). We deliberately DON'T set --ori-color
// in this component's own <style> (it would shadow the ori-color_* utility — a silent no-op); the
// utility repoints it and the bubble reads it with a no-class fallback via var(--ori-color, …).
const {
    color,
    content,
    placement = 'top'
} = defineProps<{
    color?: ThemeColor;
    /** Tooltip text. For rich content use the #content slot instead (it takes precedence). */
    content?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}>();

// SSR-safe id (Vue 3.5) so the trigger's aria-describedby always targets the bubble.
const bubbleId = useId();
</script>

<template>
    <span :class="['ori-tooltip', color && `ori-color ori-color_${color}`]">
        <span class="ori-tooltip__trigger" :aria-describedby="bubbleId">
            <!-- bubbleId is exposed so the consumer can put aria-describedby on their OWN focusable
                 control — aria-describedby only announces when the element bearing it is focused, and
                 this wrapper span isn't focusable. -->
            <slot :bubble-id="bubbleId" />
        </span>

        <span :id="bubbleId" :class="['ori-tooltip__bubble', `ori-tooltip__bubble_${placement}`]" role="tooltip">
            <slot name="content">{{ content }}</slot>
        </span>
    </span>
</template>
