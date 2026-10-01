<script setup lang="ts">
// Live SegmentedControl demo for the docs (MDC renders it as `:segmented-control-demo`). MDC's inline
// `:ori-segmented-control{...}` cannot fill the scoped `#option` slot or echo the bound `v-model`, so
// this wraps two controls: one that prints its model, one whose segments carry a count.
import { ref } from 'vue'
import { OriSegmentedControl } from '@oriui/vue'

const theme = ref('auto')
const themes = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' }
]

const filter = ref('all')
const filters = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Flagged', value: 'flagged' }
]
const counts: Record<string, number> = { all: 24, unread: 3, flagged: 1 }
</script>

<template>
    <div style="display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start">
        <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start">
            <OriSegmentedControl v-model="theme" label="Theme" :options="themes" />
            <p style="margin: 0; font-size: 0.85em">
                v-model: <strong>{{ theme }}</strong>
            </p>
        </div>

        <OriSegmentedControl v-model="filter" label="Show" :options="filters">
            <template #option="{ option }">
                {{ option.label }}
                <span style="margin-inline-start: 0.4em; font-variant-numeric: tabular-nums">{{
                    counts[option.value]
                }}</span>
            </template>
        </OriSegmentedControl>
    </div>
</template>
