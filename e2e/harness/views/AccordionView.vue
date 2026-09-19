<script lang="ts" setup>
import { OriAccordion } from '@oriui/vue'
import type { AccordionItem } from '@oriui/vue'

// Two accordions side by side so one navigation proves both modes. The single-open one relies on the
// PLATFORM exclusive-accordion feature (every <details> shares a `name`, Baseline 2024) — the unit
// suite can only assert that the attribute is there, because happy-dom does not implement the
// behaviour the attribute asks for. "Archive" is disabled in both so the guard is testable by pointer
// and by keyboard.
const items: AccordionItem[] = [
    { value: 'shipping', label: 'Shipping' },
    { value: 'returns', label: 'Returns' },
    { value: 'archive', label: 'Archive', disabled: true },
    { value: 'support', label: 'Support' }
]
</script>

<template>
    <div style="padding: 40px; display: grid; gap: 40px">
        <section data-testid="single">
            <OriAccordion :items="items">
                <template #default="{ item }">Panel body for {{ item.label }}.</template>
            </OriAccordion>
        </section>

        <section data-testid="multiple">
            <OriAccordion :items="items" multiple>
                <template #default="{ item }">Panel body for {{ item.label }}.</template>
            </OriAccordion>
        </section>
    </div>
</template>
