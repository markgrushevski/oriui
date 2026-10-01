<script lang="ts" setup>
import { ref } from 'vue'
import { OriDialog, OriDrawer } from '@oriui/vue'
import type { DrawerSide } from '@oriui/vue'

// A tall page (so scroll lock is observable), a modal drawer whose side `?side=` picks, a non-modal drawer
// inside a transformed, clipping box (so the top layer is observable), and a dialog for the scroll lock.
const side = ref<DrawerSide>((new URLSearchParams(location.search).get('side') as DrawerSide | null) ?? 'end')
const long = new URLSearchParams(location.search).has('long')
const outsideClicks = ref(0)
</script>

<template>
    <div style="min-height: 3000px; padding: 40px">
        <!-- Kept clear of the start-side drawer, which covers the left 20rem when open. -->
        <button type="button" data-testid="outside" style="margin-left: 600px" @click="outsideClicks++">
            Outside {{ outsideClicks }}
        </button>

        <OriDrawer :side="side" title="Filters">
            <template #trigger="{ props }">
                <button v-bind="props" type="button" data-testid="open-modal">Open drawer</button>
            </template>
            <label>Name <input type="text" data-testid="name" /></label>
            <div v-if="long" style="height: 2000px">Long content</div>
            <template #footer><button type="button" data-testid="apply">Apply</button></template>
        </OriDrawer>

        <div style="height: 40px; padding-left: 600px; overflow: hidden; transform: translateX(0)">
            <OriDrawer :modal="false" side="start" title="Menu">
                <template #trigger="{ props }">
                    <button v-bind="props" type="button" data-testid="open-panel">Menu</button>
                </template>
                <button type="button" data-testid="panel-item">New drawing</button>
            </OriDrawer>
        </div>

        <OriDialog title="Confirm">
            <template #trigger="{ props }">
                <button v-bind="props" type="button" data-testid="open-dialog">Open dialog</button>
            </template>
            <p>Sure?</p>
        </OriDialog>
    </div>
</template>
