<script lang="ts" setup>
import { resolveRovingIndex, rovingIntent } from '@oriui/headless'
import { useCompoundTabs } from './context'

// PROTOTYPE (poc/compound-tabs) — the tablist. The roving math is the shared core's, unchanged; what
// changes is where the enabled-predicate comes from. The array API asks the array; here the list must
// read the live DOM, because the root's registry is a Map whose iteration order is registration order,
// not necessarily the order the caller slotted things in if a child was conditionally re-created.
// Reading `[role="tab"]` off the DOM is what the array version already did for the CURRENT index, so
// this is the same technique extended to the whole predicate.
const ctx = useCompoundTabs('OriTabList')

function onKeydown(event: KeyboardEvent): void {
    const intent = rovingIntent(event.key, ctx.orientation.value)
    if (!intent) return

    const root = event.currentTarget as HTMLElement | null
    const target = event.target as HTMLElement | null
    if (!root || !target) return

    const buttons = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'))
    const current = target.closest<HTMLElement>('[role="tab"]')
    const from = current ? buttons.indexOf(current) : -1
    const to = resolveRovingIndex(intent, from, buttons.length, true, (i) => !buttons[i]?.hasAttribute('disabled'))
    const next = to >= 0 ? buttons[to] : undefined
    if (!next) return

    event.preventDefault()
    next.click() // automatic activation — the tab owns its own select()
    next.focus()
}
</script>

<template>
    <div
        role="tablist"
        class="ori-tabs__list"
        :aria-orientation="ctx.orientation.value"
        :aria-label="ctx.label.value"
        @keydown="onKeydown"
    >
        <slot />
    </div>
</template>
