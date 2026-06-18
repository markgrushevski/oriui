<script setup lang="ts">
// Live Dialog demo for the docs (MDC renders it as `:dialog-demo`). Wraps the prototype OriDialog
// with a button trigger + sample content so a single inline tag drops into a markdown ::example.
import { OriButton, OriDialog } from '@oriui/ui';
</script>

<template>
    <OriDialog title="Weave a dialog">
        <template #trigger="{ props }">
            <OriButton v-bind="props" text="Open dialog" color="primary" />
        </template>
        <p>
            This modal's behaviour comes from <strong>Zag</strong> through oriUI's swappable headless contract — focus
            is trapped, <kbd>Esc</kbd> closes it, the page behind is scroll-locked, and it's announced as
            <code>aria-modal</code>. The same markup runs on a different engine by changing one line at the app root.
        </p>
    </OriDialog>
</template>
