<script setup lang="ts">
// Dogfood: the docs sidebar groups are collapsible via the headless Disclosure primitive
// from @oriui/headless/vue (built on the framework-agnostic @oriui/headless).
import { useDisclosure } from '@oriui/headless/vue';

defineProps<{ title: string }>();

const { triggerProps, contentProps, open } = useDisclosure(() => ({ defaultOpen: true }));
</script>

<template>
    <div class="docs-sidebar__group">
        <button class="docs-sidebar__title" v-bind="triggerProps">
            {{ title }}
            <span class="docs-sidebar__chevron" :data-open="open || undefined" aria-hidden="true">›</span>
        </button>
        <div class="docs-sidebar__links" v-bind="contentProps">
            <slot />
        </div>
    </div>
</template>
