<script lang="ts" setup>
import { ref } from 'vue'
import { OriToaster, useToast } from '@oriui/vue'

// A real OriToaster: countdowns must stop while the pointer or focus is on a toast. The container has
// `pointer-events: none` and only the toasts take the pointer, which happy-dom cannot model.
const { toast } = useToast()
const undone = ref(0)

function push(): void {
    toast({ text: 'File deleted', duration: 1500, action: { label: 'Undo', onClick: () => undone.value++ } })
}
</script>

<template>
    <div style="padding: 40px">
        <button type="button" data-testid="push" @click="push">Push</button>
        <p data-testid="undone">{{ undone }}</p>
        <OriToaster />
    </div>
</template>
