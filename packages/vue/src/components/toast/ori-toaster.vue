<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue'
import { useToast } from '@oriui/headless/vue'
import OriToast from './ori-toast.vue'

const {
    align = 'start',
    hotkey = 'F8',
    label = 'Notifications',
    position = 'top-right'
} = defineProps<{
    /** Body alignment for every toast in the stack — a look of the stack, like `position`. A centred
     *  stack usually pairs with `top-center` / `bottom-center` and one-line status messages. */
    align?: 'start' | 'center'
    /** The key (a `KeyboardEvent.key`) that moves focus to the toasts. */
    hotkey?: string
    /** Accessible name of the toast region; the hotkey is appended to it. */
    label?: string
    position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'
}>()

const { toasts, dismiss, pause, resume } = useToast()
const stack = ref<ComponentPublicInstance>()

// WCAG 2.2.1: a toast must not disappear while someone is reading or using it, so the countdowns stop
// while the pointer or focus is on the stack, or the page is hidden.
const holds = new Set<string>()
function hold(reason: string, on: boolean): void {
    if (on) holds.add(reason)
    else holds.delete(reason)
    if (holds.size) pause()
    else resume()
}

function onFocusOut(event: FocusEvent): void {
    if (!stack.value?.$el.contains(event.relatedTarget as Node | null)) hold('focus', false)
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === hotkey && toasts.length) stack.value?.$el.focus()
}

const onVisibility = (): void => hold('hidden', document.hidden)

// Focus inside a toast that is about to go would drop to <body> without a focusout, leaving the stack paused.
function remove(id: number): void {
    const el = stack.value?.$el as HTMLElement | undefined
    if (el?.contains(document.activeElement)) el.focus()
    dismiss(id)
}

function onAction(id: number, run: () => void): void {
    run()
    remove(id)
}

// The library can't use Nuxt <ClientOnly>; gate the Teleport on mount so SSR markup stays stable.
const mounted = ref(false)
onMounted(() => {
    mounted.value = true
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('visibilitychange', onVisibility)
    holds.clear()
    resume()
})
</script>

<template>
    <Teleport v-if="mounted" to="body">
        <!-- The container is the live region, not the toast: assistive tech only reports mutations
             inside a region it was already tracking, so a region that first appears already holding
             its text goes unannounced. This div is rendered from mount (empty) and toasts are inserted
             into it. aria-atomic="false" keeps the announcement to the new toast instead of re-reading
             the whole stack; a danger toast keeps its own role="alert" for assertive urgency. -->
        <transition-group
            ref="stack"
            tag="div"
            name="ori-toast"
            :class="['ori-toaster', `ori-toaster_${position}`]"
            role="region"
            :aria-label="`${label} (${hotkey})`"
            aria-live="polite"
            aria-atomic="false"
            tabindex="-1"
            @pointerenter="hold('pointer', true)"
            @pointerleave="hold('pointer', false)"
            @focusin="hold('focus', true)"
            @focusout="onFocusOut"
        >
            <ori-toast
                v-for="t in toasts"
                :key="t.id"
                :action-label="t.action?.label"
                :align="align"
                :closable="t.closable"
                :color="t.color"
                :icon="t.icon"
                :text="t.text"
                :title="t.title"
                @action="t.action && onAction(t.id, t.action.onClick)"
                @close="remove(t.id)"
            />
        </transition-group>
    </Teleport>
</template>
