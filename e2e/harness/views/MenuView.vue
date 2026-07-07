<script lang="ts" setup>
import { ref } from 'vue';
import { OriMenu } from '@oriui/vue';
import type { MenuItem } from '@oriui/headless/vue';

// Four items with one disabled ("Archive") so ArrowUp/Down skip-the-disabled and Home/End are testable.
// The activated value is mirrored into `[data-testid=selected]` so Enter/Space activation is observable.
const items: MenuItem[] = [
    { label: 'Edit', value: 'edit' },
    { label: 'Duplicate', value: 'duplicate' },
    { label: 'Archive', value: 'archive', disabled: true },
    { label: 'Delete', value: 'delete' }
];

const selected = ref('');
</script>

<template>
    <div style="padding: 40px">
        <OriMenu :items="items" @select="selected = $event">
            <template #trigger="{ props }">
                <button v-bind="props" class="ori-button" data-testid="menu-trigger">Actions</button>
            </template>
        </OriMenu>
        <p data-testid="selected">{{ selected }}</p>
    </div>
</template>
