<script setup lang="ts">
// Live List demos for the docs (MDC renders it as `:list-demo{kind="…"}`). MDC cannot parse a named slot
// (`#end`) three blocks deep (example > list > item), and its attributes cannot carry a click listener, so
// every demo whose rows act or fill a slot lives here; the rest of the page uses inline `:ori-list` markup.
import { ref } from 'vue'
import { OriIcon, OriList, OriListItem, OriSegmentedControl, OriSurface, OriSwitch, OriTag } from '@oriui/vue'

const { kind = 'actions' } = defineProps<{ kind?: 'actions' | 'control' | 'custom' | 'panel' | 'selectable' }>()

const plus = 'M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z'
const save =
    'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z'
const download = 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'
const moon =
    'M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z'
const image =
    'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'
const bell =
    'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'
const passed =
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
const failed = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'

const last = ref('')

const views = [
    { value: 'layers', label: 'Layers', description: 'Stack, reorder and hide' },
    { value: 'brushes', label: 'Brushes', description: 'Size, opacity and shape' },
    { value: 'palette', label: 'Palette', description: 'Swatches and recent colors' }
]
const view = ref('layers')

const notify = ref(true)
const theme = ref('auto')
const themes = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' }
]
</script>

<template>
    <div v-if="kind === 'actions'" style="width: 100%; max-width: 24rem">
        <OriList divided>
            <OriListItem label="New drawing" hint="Ctrl+N" @click="last = 'New drawing'" />
            <OriListItem label="Save" hint="Ctrl+S" @click="last = 'Save'" />
            <OriListItem label="Export" chevron @click="last = 'Export'" />
            <OriListItem label="Revert to saved" disabled @click="last = 'Revert to saved'" />
        </OriList>
        <p style="margin: 0.5rem 0 0; font-size: 0.85em">
            Last activated: <strong>{{ last || 'nothing yet' }}</strong>
        </p>
    </div>

    <div v-else-if="kind === 'selectable'" style="width: 100%; max-width: 24rem">
        <OriList>
            <OriListItem
                v-for="v in views"
                :key="v.value"
                :label="v.label"
                :description="v.description"
                :current="view === v.value"
                @click="view = v.value"
            />
        </OriList>
        <p style="margin: 0.5rem 0 0; font-size: 0.85em">
            Current: <strong>{{ view }}</strong>
        </p>
    </div>

    <OriList v-else-if="kind === 'control'" divided style="width: 100%; max-width: 24rem">
        <OriListItem :icon="bell" label="Notifications" description="Mentions and replies">
            <template #end>
                <OriSwitch v-model="notify" aria-label="Notifications" />
            </template>
        </OriListItem>
        <OriListItem :icon="moon" label="Theme">
            <template #end>
                <OriSegmentedControl v-model="theme" aria-label="Theme" size="sm" :options="themes" />
            </template>
        </OriListItem>
    </OriList>

    <OriList v-else-if="kind === 'custom'" divided style="width: 100%; max-width: 24rem">
        <OriListItem label="Build 128" description="Deployed 4 minutes ago">
            <template #start>
                <OriIcon :icon="passed" color="success" />
            </template>
            <template #end>
                <OriTag label="Passed" color="success" />
            </template>
        </OriListItem>
        <OriListItem label="Build 127" description="Failed 1 hour ago">
            <template #start>
                <OriIcon :icon="failed" color="danger" />
            </template>
            <template #end>
                <OriTag label="Failed" color="danger" />
            </template>
        </OriListItem>
    </OriList>

    <OriSurface v-else style="width: 100%; max-width: 26rem; padding: 0.375rem">
        <OriList divided>
            <OriListItem :icon="plus" label="New drawing" hint="Ctrl+N" @click="last = 'New drawing'" />
            <OriListItem :icon="save" label="Save" hint="Ctrl+S" @click="last = 'Save'" />
            <OriListItem :icon="download" label="Export" chevron @click="last = 'Export'" />
            <OriListItem :icon="moon" label="Theme">
                <template #end>
                    <OriSegmentedControl v-model="theme" aria-label="Theme" size="sm" :options="themes" />
                </template>
            </OriListItem>
            <OriListItem :icon="image" label="Gallery" description="Your saved drawings" href="#common-patterns" />
        </OriList>
    </OriSurface>
</template>
