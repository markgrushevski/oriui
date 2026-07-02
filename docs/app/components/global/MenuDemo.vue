<script setup lang="ts">
// Live Menu demo for the docs (MDC renders it as `:menu-demo`). MDC's INLINE `:ori-menu{...}` syntax
// can't fill the `#trigger` scoped slot or pass the `items` prop, so — same approach as `:dialog-demo`
// / `:popover-demo` — this component wraps OriMenu with a real button trigger + sample items for a
// single inline drop-in tag.
import { ref } from 'vue';
import { OriButton, OriMenu } from '@oriui/vue';
import type { AnchoredPlacement } from '@oriui/vue';

const { placement = 'bottom-start' } = defineProps<{
    placement?: AnchoredPlacement;
}>();

const items = [
    { value: 'new', label: 'New file' },
    { value: 'open', label: 'Open…' },
    { value: 'rename', label: 'Rename', disabled: true },
    { value: 'delete', label: 'Delete' }
];

const selected = ref<string | null>(null);
</script>

<template>
    <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-start">
        <OriMenu :items="items" :placement="placement" @select="(value) => (selected = value)">
            <template #trigger="{ props }">
                <OriButton v-bind="props" text="Actions" variant="tonal" />
            </template>
        </OriMenu>
        <p v-if="selected" style="margin: 0; font-size: 0.85em">
            Selected: <strong>{{ selected }}</strong>
        </p>
    </div>
</template>
