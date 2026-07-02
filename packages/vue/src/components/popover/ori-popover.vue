<script lang="ts" setup>
import { computed, useId } from 'vue';

// OriPopover — a positioned overlay built on the platform. The trigger opens the panel via the
// Popover API (`popovertarget` → top-layer, light-dismiss, Esc — zero JS); the panel is placed with
// CSS Anchor Positioning (anchor-name / position-anchor + position-area, and collision flip via
// position-try-fallbacks — zero positioning JS, no scroll/resize listeners). Baseline 2026, with
// graceful degradation (older engines place it without the flip). No positioning library.
//
// The default slot is the panel content. The #trigger scoped slot exposes a `props` bag to spread
// onto YOUR trigger — which MUST be a <button> (or OriButton) for the Popover API. The bag carries the
// `popovertarget`, the per-instance `anchor-name`, and `aria-haspopup` / `aria-controls` for the popup
// relationship. There is no `open` state: the Popover API drives visibility in CSS, so the trigger's
// expanded state is unmanaged (a deliberate zero-JS limitation — see DECISIONS.md).
//
// Accessibility: the panel takes a `role` (default "dialog" — a non-modal popup). Give it an accessible
// name by passing `aria-label` / `aria-labelledby` — undeclared attrs fall through to the panel.
defineOptions({ inheritAttrs: false });

const { placement = 'bottom', role = 'dialog' } = defineProps<{
    placement?: 'top' | 'top-end' | 'bottom' | 'bottom-end' | 'left' | 'right';
    /** ARIA role for the panel — "dialog" (default), "menu", "listbox", … per the content it holds. */
    role?: string;
}>();

// SSR-safe unique ids so the popovertarget link and the anchor-name never collide across instances.
const uid = useId();
const panelId = `ori-popover-${uid}`;
const anchorName = `--ori-popover-${uid}`;

// Spread onto the trigger button: opens the panel, names it as this panel's anchor, and conveys the
// popup relationship — `aria-haspopup` mirrors the panel role, `aria-controls` points at the panel.
const triggerProps = computed(() => ({
    popovertarget: panelId,
    'aria-haspopup': role,
    'aria-controls': panelId,
    style: { anchorName }
}));
</script>

<template>
    <slot name="trigger" :props="triggerProps" />

    <div
        v-bind="$attrs"
        :id="panelId"
        popover
        :role="role"
        :class="['ori-popover', 'ori-anchored', `ori-anchored_${placement}`]"
        :style="{ '--ori-anchor': anchorName }"
    >
        <slot />
    </div>
</template>
