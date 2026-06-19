<script setup lang="ts">
// Live floating-badge demo for the docs (MDC renders it as `:badge-demo`). Floating needs an anchor
// in the default slot, which MDC's INLINE `:ori-badge{...}` syntax can't supply — so the floating
// examples use this dedicated component (the same approach as `:dialog-demo`).
import { OriAvatar, OriBadge, OriButton } from '@oriui/ui';

const BELL =
    'M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z';
</script>

<template>
    <div style="display: inline-flex; flex-wrap: wrap; gap: 1.5rem; align-items: center">
        <!-- count over a button -->
        <OriBadge :content="3" floating color="danger" label="3 unread">
            <OriButton text="Inbox" variant="tonal" />
        </OriBadge>

        <!-- capped count over an icon button -->
        <OriBadge :content="130" :max="99" floating color="danger" label="99+ notifications">
            <OriButton :icon="BELL" aria-label="Notifications" variant="tonal" />
        </OriBadge>

        <!-- status dot over an avatar -->
        <OriBadge dot floating color="success" label="Online">
            <OriAvatar text="Ada Lovelace" />
        </OriBadge>
    </div>
</template>
