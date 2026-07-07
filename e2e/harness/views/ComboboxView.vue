<script lang="ts" setup>
import { ref } from 'vue';
import { OriCombobox } from '@oriui/vue';
import type { ComboboxItem } from '@oriui/headless/vue';

// Five fixed options with one disabled ("Date") so ArrowDown highlight movement, typeahead filtering
// and disabled-skip are all deterministically assertable.
const options: ComboboxItem[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date', disabled: true },
    { label: 'Elderberry', value: 'elderberry' }
];

const model = ref<string | null>(null);
</script>

<template>
    <div style="max-width: 320px; padding: 40px">
        <OriCombobox v-model="model" label="Fruit" :options="options" placeholder="Search fruit" />
        <p data-testid="cb-model">{{ model ?? '' }}</p>
    </div>
</template>
