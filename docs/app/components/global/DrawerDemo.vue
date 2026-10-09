<script setup lang="ts">
// Live Drawer demo for the docs (MDC renders it as `:drawer-demo`). OriDrawer's #trigger is a scoped slot,
// which MDC's inline syntax cannot fill, so this wrapper supplies the trigger, a body and a footer. With no
// `side` it shows a picker; pass one (`side="bottom"`) to pin the demo to that edge. Stray attributes
// (`dir="rtl"`) fall through to the root element, which the drawer inherits its direction from.
import { computed, ref } from 'vue'
import { OriButton, OriDrawer, OriRadioGroup } from '@oriui/vue'
import type { DrawerSide } from '@oriui/vue'

const {
    label,
    modal = true,
    side,
    size
} = defineProps<{
    /** Trigger text; defaults to a description of the demo. */
    label?: string
    /** `false` opens the drawer non-modal: the page behind stays live. */
    modal?: boolean
    /** Pins the demo to one edge and hides the picker. */
    side?: DrawerSide
    /** `--ori-drawer-size` for this instance, e.g. `32rem`. */
    size?: string
}>()

const sides = [
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' }
]

const open = ref(false)
const picked = ref<string | number>('end')
const current = computed(() => side ?? (picked.value as DrawerSide))
const triggerLabel = computed(() => label ?? (modal ? 'Open drawer' : 'Open non-modal drawer'))
</script>

<template>
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
        <OriRadioGroup v-if="!side" v-model="picked" label="Side" orientation="horizontal" :options="sides" />

        <OriDrawer
            v-model:open="open"
            title="Filters"
            :modal="modal"
            :side="current"
            :style="size ? { '--ori-drawer-size': size } : undefined"
        >
            <template #trigger="{ props }">
                <OriButton v-bind="props" :label="triggerLabel" :variant="modal ? 'solid' : 'outline'" />
            </template>

            <p style="margin: 0">
                Docked to the <strong>{{ current }}</strong> edge.
                {{
                    modal
                        ? 'The page behind is inert, focus stays inside, and Esc closes it.'
                        : 'The page behind stays live: scroll it, click it, or press Esc to close this.'
                }}
            </p>

            <template #footer>
                <OriButton label="Cancel" variant="text" @click="open = false" />
                <OriButton label="Apply" @click="open = false" />
            </template>
        </OriDrawer>
    </div>
</template>
