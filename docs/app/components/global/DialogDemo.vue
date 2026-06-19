<script setup lang="ts">
// Live Dialog demo for the docs (MDC renders it as `:dialog-demo`). Wraps the prototype OriDialog
// with a button trigger + sample content so a single inline tag drops into a markdown ::example.
import { OriButton, OriDialog } from '@oriui/vue';
</script>

<template>
    <OriDialog title="Weave a dialog">
        <template #trigger="{ props }">
            <OriButton v-bind="props" text="Open dialog" color="primary" />
        </template>
        <p>
            This modal runs on the native <code>&lt;dialog&gt;</code> element through oriUI's headless contract — focus
            is trapped, <kbd>Esc</kbd> closes it, the page behind is inert, and it's announced as
            <code>aria-modal</code>, all from the platform with no extra dependency. The swappable contract still lets
            an app drop in a different engine by changing one line at the app root.
        </p>
    </OriDialog>
</template>
