<script lang="ts" setup>
import { ref } from 'vue'
import { OriTabs } from '@oriui/vue'
import type { TabItem } from '@oriui/vue'

// Horizontal and vertical tablists, each with one disabled tab ("Archive") so arrow keys must SKIP it.
// The unit suite drives `trigger('keydown')` on a wrapper, which never moves real focus — happy-dom has
// no focus management to speak of — so the roving tabindex is asserted there as an attribute and the
// behaviour it exists for (one tab stop for the whole group, focus following the arrow keys) has never
// been exercised in an engine. That is what this view is for.
const items: TabItem[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'specs', label: 'Specs' },
    { value: 'archive', label: 'Archive', disabled: true },
    { value: 'reviews', label: 'Reviews' }
]

const horizontal = ref<string | number>('overview')
const vertical = ref<string | number>('overview')
</script>

<template>
    <div style="padding: 40px; display: grid; gap: 40px">
        <!-- Focusable siblings on both sides: Tab must step INTO the group once and then straight out,
             which is the whole point of a roving tabindex and is invisible without them. -->
        <button data-testid="before">before</button>

        <section data-testid="horizontal">
            <OriTabs v-model="horizontal" :tabs="items">
                <template #panel-overview>Overview panel</template>
                <template #panel-specs>Specs panel</template>
                <template #panel-archive>Archive panel</template>
                <template #panel-reviews>Reviews panel</template>
            </OriTabs>
            <p data-testid="horizontal-value">{{ horizontal }}</p>
        </section>

        <button data-testid="between">between</button>

        <section data-testid="vertical">
            <OriTabs v-model="vertical" :tabs="items" orientation="vertical">
                <template #default="{ tab }">{{ tab.label }} panel</template>
            </OriTabs>
            <p data-testid="vertical-value">{{ vertical }}</p>
        </section>

        <button data-testid="after">after</button>
    </div>
</template>
