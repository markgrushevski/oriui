<script setup lang="ts">
// Live Popover demo for the docs (MDC renders it as `:popover-demo`). MDC's INLINE `:ori-popover{...}`
// syntax can't fill the `#trigger` scoped slot, so — same approach as `:dialog-demo` — this component
// wraps OriPopover with a real button trigger + sample panel content for a single inline drop-in tag.
import { OriButton, OriPopover } from '@oriui/vue';
import type { AnchoredPlacement } from '@oriui/vue';

const { placement = 'bottom-start' } = defineProps<{
    placement?: AnchoredPlacement;
}>();
</script>

<template>
    <OriPopover :placement="placement" aria-labelledby="popover-demo-title">
        <template #trigger="{ props }">
            <OriButton v-bind="props" text="Open popover" variant="tonal" />
        </template>
        <div style="display: flex; flex-direction: column; gap: 0.35rem; padding: 0.35rem">
            <strong id="popover-demo-title">Weave a popover</strong>
            <p style="margin: 0">
                Positioned with CSS Anchor Positioning and toggled by the Popover API — zero positioning JS.
            </p>
        </div>
    </OriPopover>
</template>
