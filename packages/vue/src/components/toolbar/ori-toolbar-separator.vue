<script lang="ts" setup>
import { computed } from 'vue';
import { useToolbarOrientation } from '@oriui/headless/vue';

// OriToolbarSeparator — a non-focusable divider between groups of toolbar controls. Per WAI-ARIA a
// separator's orientation is PERPENDICULAR to the toolbar (a horizontal toolbar gets a vertical rule),
// and the roving navigation skips it (no data-ori-toolbar-item marker). 'horizontal' is the implicit
// aria default, so it's emitted only for the vertical-separator case.
const orientation = useToolbarOrientation();
const separatorVertical = computed(() => orientation() !== 'vertical');
</script>

<template>
    <div
        class="ori-toolbar__separator"
        role="separator"
        :aria-orientation="separatorVertical ? 'vertical' : undefined"
    ></div>
</template>
