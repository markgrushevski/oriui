<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, useId, useTemplateRef } from 'vue'
import type { AnchoredPlacement, ThemeColor } from '../../types'

// WCAG 1.4.13 requires dismissing hover/focus content without moving the pointer or focus — Escape,
// the one part CSS cannot do. One document listener serves every tooltip: each instance registers a
// callback and checks the DOM (`:hover` / focus) to see whether it is the one showing. Show/hide stays CSS.
const shown = new Set<() => void>()

function onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return
    for (const dismiss of shown) dismiss()
}

function register(dismiss: () => void): void {
    if (shown.size === 0) document.addEventListener('keydown', onDocumentKeydown, true)
    shown.add(dismiss)
}

function unregister(dismiss: () => void): void {
    shown.delete(dismiss)
    if (shown.size === 0) document.removeEventListener('keydown', onDocumentKeydown, true)
}

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
    color?: ThemeColor
    /** Tooltip text. For rich content use the #content slot instead (it takes precedence). */
    content?: string
    placement?: AnchoredPlacement
}>()

// SSR-safe id (Vue 3.5) so the trigger's aria-describedby always targets the bubble.
const bubbleId = useId()

// Dismissed state is per instance and lives on the root as `data-ori-dismissed`, which tooltip.css
// gates both show rules on. It re-arms by itself: the moment the pointer or the focus leaves, the
// attribute goes and the tooltip can show again — so Escape dismisses THIS showing, not the tooltip.
const root = useTemplateRef<HTMLElement>('root')
const dismissed = ref(false)

function dismissIfShowing(): void {
    const el = root.value
    if (!el) return
    if (el.matches(':hover') || el.contains(document.activeElement)) dismissed.value = true
}

onMounted(() => register(dismissIfShowing))
onBeforeUnmount(() => unregister(dismissIfShowing))
</script>

<template>
    <span
        ref="root"
        :class="['ori-tooltip', color && `ori-color_${color}`]"
        :data-ori-dismissed="dismissed || undefined"
        @pointerleave="dismissed = false"
        @focusout="dismissed = false"
    >
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
