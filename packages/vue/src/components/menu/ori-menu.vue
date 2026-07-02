<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, useId, useTemplateRef, watch } from 'vue';
import { useMenu, type MenuItem } from '@oriui/headless/vue';

// OriMenu — a WAI-ARIA menu button: a trigger opens a roving-tabindex menu of actions. Behaviour
// (open/close, Arrow/Home/End roving, Enter/Space activate, Escape/Tab/outside-click close) lives in the
// @oriui/headless menu machine; this SFC renders the styled shell, moves real DOM focus to the active
// item (roving needs it), returns focus to the trigger on close, and wires click-outside. The panel is
// placed with the shared .ori-anchored primitive (CSS Anchor Positioning, zero positioning JS).
//
// The #trigger scoped slot exposes a `props` bag to spread onto YOUR <button>; items come from `items`
// and render through the #item slot (override for icons / shortcuts). Activating an item emits `select`
// with its value, then closes.
defineOptions({ inheritAttrs: false });

const {
    disabled = false,
    items,
    placement = 'bottom'
} = defineProps<{
    disabled?: boolean;
    items: MenuItem[];
    placement?: 'top' | 'top-end' | 'bottom' | 'bottom-end' | 'left' | 'right';
}>();

const emit = defineEmits<{ select: [value: string] }>();

const m = useMenu(() => ({ items, disabled, onSelect: (value) => emit('select', value) }));

// Per-instance anchor-name links the trigger (via the slot props) to the panel's --ori-anchor.
const anchorName = `--ori-menu-${useId()}`;
const triggerProps = computed(() => ({ ...m.triggerProps.value, style: { anchorName } }));

const contentRef = useTemplateRef<HTMLElement>('content');
const triggerEl = (): HTMLElement | null => {
    const id = m.triggerProps.value.id as string | undefined;
    return id ? document.getElementById(id) : null;
};

// Roving: move real focus to the active item whenever the highlight changes while open.
watch(
    () => m.highlightedValue.value,
    async () => {
        if (!m.open.value) return;
        await nextTick();
        contentRef.value?.querySelector<HTMLElement>('[data-highlighted]')?.focus();
    }
);

const onOutsidePointerDown = (event: PointerEvent): void => {
    const target = event.target as Node;
    if (contentRef.value?.contains(target) || triggerEl()?.contains(target)) return;
    m.setOpen(false);
};

// On open, focus the menu (arrows then move into items); on close, return focus to the trigger. The
// outside-click listener lives only while open.
watch(
    () => m.open.value,
    async (open) => {
        if (open) {
            await nextTick();
            if (m.highlightedValue.value === null) contentRef.value?.focus();
            document.addEventListener('pointerdown', onOutsidePointerDown);
        } else {
            document.removeEventListener('pointerdown', onOutsidePointerDown);
            triggerEl()?.focus();
        }
    }
);
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutsidePointerDown));
</script>

<template>
    <slot name="trigger" :props="triggerProps" />

    <div
        v-bind="{ ...$attrs, ...m.contentProps.value }"
        ref="content"
        :class="['ori-menu', 'ori-anchored', `ori-anchored_${placement}`]"
        :style="{ '--ori-anchor': anchorName }"
    >
        <div
            v-for="(item, index) in items"
            :key="item.value"
            v-bind="m.getItemProps(item, index)"
            class="ori-menu__item"
        >
            <slot name="item" :item="item">{{ item.label ?? item.value }}</slot>
        </div>
    </div>
</template>
