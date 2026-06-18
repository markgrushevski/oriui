<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { RadiusSize, ThemeColor } from '../../types';

interface AccordionItem {
    value: string | number;
    title: string;
    disabled?: boolean;
}

// OriAccordion — a disclosure list built on the native <details>/<summary> elements: zero-JS, keyboard
// and screen-reader accessible out of the box, and form/find-in-page friendly (the native-first thesis).
// Open state IS the native `open` attribute, styled with the `details[open]` attribute selector — no JS
// toggling. Single-open (exclusive) mode uses the platform exclusive-accordion feature (Baseline 2024):
// every <details> shares one `name`, so the browser closes the siblings when one opens. `multiple` drops
// the shared name so each item opens independently. The accent (open marker + chevron) rides the shared
// ori-color utility, read through the resolved --ori-color alias like the rest of the library.
const {
    color = 'primary',
    items,
    multiple = false,
    radius = 'md'
} = defineProps<{
    color?: ThemeColor;
    items: AccordionItem[];
    multiple?: boolean;
    radius?: RadiusSize;
}>();

// SSR-safe shared name for the native exclusive accordion; only applied when not `multiple`, so the
// browser enforces single-open. `undefined` in multiple mode means each <details> toggles on its own.
const uid = useId();
const groupName = computed(() => (multiple ? undefined : uid));

// A native <summary> has no real `disabled` state — aria-disabled + tabindex=-1 are advisory and don't
// stop Enter/Space/click from toggling its <details>. Block the toggle ourselves so a disabled item is
// genuinely inert for keyboard + AT, not just dimmed (the a11y-correct source of truth).
function blockDisabled(event: Event, disabled?: boolean): void {
    if (disabled) event.preventDefault();
}
</script>

<template>
    <div
        :class="[
            'ori-accordion',
            'ori-color',
            `ori-color_${color}`,
            {
                [`ori-size-radius ori-size-radius_${radius}`]: radius
            }
        ]"
    >
        <details v-for="item in items" :key="item.value" class="ori-accordion__item" :name="groupName">
            <summary
                class="ori-accordion__trigger"
                :aria-disabled="item.disabled ? 'true' : undefined"
                :tabindex="item.disabled ? -1 : undefined"
                @click="blockDisabled($event, item.disabled)"
                @keydown.enter="blockDisabled($event, item.disabled)"
                @keydown.space="blockDisabled($event, item.disabled)"
            >
                <span class="ori-accordion__title">{{ item.title }}</span>
                <svg
                    class="ori-accordion__icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </summary>

            <div class="ori-accordion__panel">
                <slot :item="item" />
            </div>
        </details>
    </div>
</template>

<style>
.ori-accordion {
    display: flex;
    flex-direction: column;

    overflow: hidden;

    border: 1px solid color-mix(in srgb, currentcolor 14%, transparent);
    border-radius: var(--ori-size-radius);
}

.ori-accordion__item + .ori-accordion__item {
    border-block-start: 1px solid color-mix(in srgb, currentcolor 14%, transparent);
}

.ori-accordion__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75em;
    padding: 0.75em 1em;

    font-weight: 500;
    line-height: 1.4;

    list-style: none;
    cursor: pointer;
    user-select: none;
}

/* Drop the native disclosure triangle (WebKit/Blink + the standards marker) for the custom chevron. */
.ori-accordion__trigger::-webkit-details-marker {
    display: none;
}

.ori-accordion__trigger::marker {
    content: '';
}

@media (hover: hover) {
    .ori-accordion__trigger:hover {
        background-color: color-mix(in srgb, var(--ori-color, currentcolor) 8%, transparent);
    }
}

.ori-accordion__trigger:focus-visible {
    outline: 2px solid var(--ori-color, currentcolor);
    outline-offset: -2px;
}

.ori-accordion__trigger[aria-disabled='true'] {
    opacity: 0.55;
    cursor: not-allowed;

    pointer-events: none;
}

.ori-accordion__title {
    flex: 1 1 auto;
}

.ori-accordion__icon {
    flex-shrink: 0;
    width: 1.25em;
    height: 1.25em;

    transition: transform 0.2s ease-out;
    stroke-width: 2;
    stroke-linecap: round;
    stroke: currentcolor;

    fill: none;

    color: var(--ori-color, currentcolor);
    stroke-linejoin: round;
}

.ori-accordion__item[open] .ori-accordion__icon {
    transform: rotate(180deg);
}

.ori-accordion__item[open] .ori-accordion__title {
    color: var(--ori-color, currentcolor);
}

.ori-accordion__panel {
    padding: 0 1em 0.875em;

    line-height: 1.5;
}
</style>
