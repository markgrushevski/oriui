<script lang="ts" setup>
import { useId } from 'vue';

// OriPopover — a positioned overlay built on the platform. The trigger opens the panel via the
// Popover API (`popovertarget` → top-layer, light-dismiss, Esc — zero JS); the panel is placed with
// CSS Anchor Positioning (anchor-name / position-anchor + position-area, and collision flip via
// position-try-fallbacks — zero positioning JS, no scroll/resize listeners). Baseline 2026, with
// graceful degradation (older engines place it without the flip). No positioning library.
//
// The default slot is the panel content. The #trigger scoped slot exposes the attributes to spread
// onto YOUR trigger — which must be a <button> (or OriButton) for the Popover API: the `popovertarget`
// and the per-instance `anchor-name`.
defineOptions({ inheritAttrs: false });

const { placement = 'bottom' } = defineProps<{
    placement?: 'top' | 'top-end' | 'bottom' | 'bottom-end' | 'left' | 'right';
}>();

// SSR-safe unique ids so the popovertarget link and the anchor-name never collide across instances.
const uid = useId();
const panelId = `ori-popover-${uid}`;
const anchorName = `--ori-popover-${uid}`;

// Spread onto the trigger button: opens the panel + names it as this panel's anchor.
const triggerProps = {
    popovertarget: panelId,
    style: { anchorName }
};
</script>

<template>
    <slot name="trigger" v-bind="triggerProps" />

    <div
        :id="panelId"
        popover
        :class="['ori-popover', `ori-popover_${placement}`]"
        :style="{ '--ori-anchor': anchorName }"
    >
        <slot />
    </div>
</template>
