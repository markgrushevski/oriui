<script lang="ts" setup>
import { ref } from 'vue'
import { OriCombobox, OriMenu } from '@oriui/vue'
import type { ComboboxItem, MenuItem } from '@oriui/headless/vue'

// Each overlay sits in a box with a transform (it becomes the containing block of a fixed descendant)
// and overflow:hidden (it clips one): a panel outside the top layer would be misplaced and cut off.
const items: MenuItem[] = [
    { label: 'Edit', value: 'edit' },
    { label: 'Duplicate', value: 'duplicate' },
    { label: 'Archive', value: 'archive' },
    { label: 'Delete', value: 'delete' }
]
const options: ComboboxItem[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Elderberry', value: 'elderberry' }
]
const model = ref<string | null>(null)
</script>

<template>
    <div style="display: flex; gap: 160px; padding: 40px">
        <div data-testid="menu-box" style="height: 60px; padding: 8px; overflow: hidden; transform: translateX(0)">
            <OriMenu :items="items">
                <template #trigger="{ props }">
                    <button v-bind="props" class="ori-button" data-testid="menu-trigger">Actions</button>
                </template>
            </OriMenu>
        </div>
        <div
            data-testid="combobox-box"
            style="width: 240px; height: 100px; padding: 8px; overflow: hidden; transform: translateX(0)"
        >
            <OriCombobox v-model="model" label="Fruit" :options="options" />
        </div>
    </div>
</template>
