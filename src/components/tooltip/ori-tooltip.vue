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

<style>
.ori-tooltip {
    /* Default neutral chip: an inverse surface so the tip reads on any page background. A color class
       repoints --ori-color / --ori-color-on, which the bubble below picks up via the fallbacks. */
    --ori-tooltip-bg: var(--ori-color, var(--ori-neutral-900));
    --ori-tooltip-color: var(--ori-color-on, var(--ori-neutral-50));
    --ori-tooltip-gap: 0.5em;
    --ori-tooltip-arrow: 0.375em;

    /* Small fixed corner; the bubble doesn't take the size/radius utilities, so define a local token
       (not a raw scale token, which would be out of scope here and fall back to a magic literal). */
    --ori-tooltip-radius: 0.25rem;

    display: inline-flex;
    position: relative;
}

.ori-tooltip__trigger {
    display: inline-flex;
}

.ori-tooltip__bubble {
    visibility: hidden;

    /* Always in the DOM for the aria-describedby relationship, but inert + invisible until shown. */
    position: absolute;
    z-index: 1;

    box-sizing: border-box;
    max-width: 16rem;
    padding: 0.375em 0.625em;

    transition:
        opacity 0.15s ease-out,
        visibility 0.15s ease-out;

    border-radius: var(--ori-tooltip-radius);

    opacity: 0;
    background-color: var(--ori-tooltip-bg);
    box-shadow: var(--ori-shadow-md);
    color: var(--ori-tooltip-color);

    font-size: 0.8125em;
    font-weight: 500;
    line-height: 1.35;
    text-align: center;
    white-space: normal;

    pointer-events: none;
    overflow-wrap: break-word;
}

/* The arrow — a rotated square sharing the bubble's fill. Decorative, so aria-hidden isn't needed
   (it's a pseudo-element, invisible to assistive tech). */
.ori-tooltip__bubble::after {
    content: '';
    position: absolute;

    width: calc(var(--ori-tooltip-arrow) * 2);
    height: calc(var(--ori-tooltip-arrow) * 2);

    background-color: var(--ori-tooltip-bg);
}

/* ---- Placement: top ---- */
.ori-tooltip__bubble.ori-tooltip__bubble_top {
    inset-block-end: calc(100% + var(--ori-tooltip-gap));
    inset-inline-start: 50%;

    transform: translateX(-50%);
}

.ori-tooltip__bubble.ori-tooltip__bubble_top::after {
    inset-block-start: 100%;
    inset-inline-start: 50%;

    transform: translate(-50%, -50%) rotate(45deg);
}

/* ---- Placement: bottom ---- */
.ori-tooltip__bubble.ori-tooltip__bubble_bottom {
    inset-block-start: calc(100% + var(--ori-tooltip-gap));
    inset-inline-start: 50%;

    transform: translateX(-50%);
}

.ori-tooltip__bubble.ori-tooltip__bubble_bottom::after {
    inset-block-end: 100%;
    inset-inline-start: 50%;

    transform: translate(-50%, 50%) rotate(45deg);
}

/* ---- Placement: left ---- */
.ori-tooltip__bubble.ori-tooltip__bubble_left {
    inset-block-start: 50%;
    inset-inline-end: calc(100% + var(--ori-tooltip-gap));

    transform: translateY(-50%);
}

.ori-tooltip__bubble.ori-tooltip__bubble_left::after {
    inset-block-start: 50%;
    inset-inline-start: 100%;

    transform: translate(-50%, -50%) rotate(45deg);
}

/* ---- Placement: right ---- */
.ori-tooltip__bubble.ori-tooltip__bubble_right {
    inset-block-start: 50%;
    inset-inline-start: calc(100% + var(--ori-tooltip-gap));

    transform: translateY(-50%);
}

.ori-tooltip__bubble.ori-tooltip__bubble_right::after {
    inset-block-start: 50%;
    inset-inline-end: 100%;

    transform: translate(50%, -50%) rotate(45deg);
}

/* Show on keyboard focus (works on touch + desktop). */
.ori-tooltip:focus-within .ori-tooltip__bubble {
    visibility: visible;
    opacity: 1;
}

/* Show on hover only where hover is real, so a tap on touch doesn't leave it stuck open. */
@media (hover: hover) {
    .ori-tooltip:hover .ori-tooltip__bubble {
        visibility: visible;
        opacity: 1;
    }
}
</style>
