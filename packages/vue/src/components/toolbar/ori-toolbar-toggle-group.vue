<script lang="ts" setup>
import { useToolbarToggleGroup } from '@oriui/headless/vue';

// OriToolbarToggleGroup — a role="group" of mutually-related toggle buttons layered over the toolbar's
// flat roving order (its OriToolbarToggleItem children are still toolbar items, reached by the same
// arrow navigation). `type="single"` keeps one value (deselectable), `"multiple"` keeps a set; bind the
// selection with `v-model` (a string for single, string[] for multiple).
const { label, type = 'single' } = defineProps<{
    /** Accessible name for the group (→ aria-label). */
    label?: string;
    type?: 'single' | 'multiple';
}>();

const model = defineModel<string | string[]>();

const { groupProps } = useToolbarToggleGroup({
    type: () => type,
    value: () => model.value,
    onChange: (value) => {
        model.value = value;
    }
});
</script>

<template>
    <!-- role="group" does not take aria-orientation (not in its ARIA supported-properties); the group is
         just a named cluster over the toolbar's flat roving order. -->
    <div v-bind="groupProps" class="ori-toolbar__group" :aria-label="label">
        <slot></slot>
    </div>
</template>
