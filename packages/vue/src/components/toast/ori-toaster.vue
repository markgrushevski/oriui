<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useToast } from '@oriui/headless/vue'
import OriToast from './ori-toast.vue'

const { position = 'top-right' } = defineProps<{
    position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'
}>()

const { toasts, dismiss } = useToast()

// The library can't use Nuxt <ClientOnly>; gate the Teleport on mount so SSR markup stays stable.
const mounted = ref(false)
onMounted(() => (mounted.value = true))
</script>

<template>
    <Teleport v-if="mounted" to="body">
        <!-- The container is the live region, not the toast: assistive tech only reports mutations
             inside a region it was already tracking, so a region that first appears already holding
             its text goes unannounced. This div is rendered from mount (empty) and toasts are inserted
             into it. aria-atomic="false" keeps the announcement to the new toast instead of re-reading
             the whole stack; a danger toast keeps its own role="alert" for assertive urgency. -->
        <transition-group
            tag="div"
            name="ori-toast"
            :class="['ori-toaster', `ori-toaster_${position}`]"
            aria-live="polite"
            aria-atomic="false"
        >
            <ori-toast
                v-for="t in toasts"
                :key="t.id"
                :closable="t.closable"
                :color="t.color"
                :icon="t.icon"
                :text="t.text"
                :title="t.title"
                @close="dismiss(t.id)"
            />
        </transition-group>
    </Teleport>
</template>
