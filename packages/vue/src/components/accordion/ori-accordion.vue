<script lang="ts" setup>
import { computed, useId, useSlots, watchEffect } from 'vue'
import type { RadiusSize, ThemeColor } from '../../types'

/**
 * One disclosure in `<OriAccordion>`'s `items` prop. `label` is the `<summary>` text.
 *
 * The display key is `label`, matching `TabItem` / `SelectOption` / `RadioOption` / `ComboboxItem` /
 * `MenuItem` — one collection-item shape across the catalog, so an item array can be mapped from the
 * same source data whichever component renders it. It was `title` until the pre-1.0 convergence; see
 * the DEV warning below, which names the rename when a stale `title` arrives.
 */
export interface AccordionItem {
    value: string | number
    label: string
    disabled?: boolean
}

// OriAccordion — a disclosure list built on the native <details>/<summary> elements: zero-JS, keyboard
// and screen-reader accessible out of the box, and form/find-in-page friendly (the native-first thesis).
// Open state IS the native `open` attribute, styled with the `details[open]` attribute selector — no JS
// toggling. Single-open (exclusive) mode uses the platform exclusive-accordion feature (Baseline 2024):
// every <details> shares one `name`, so the browser closes the siblings when one opens. `multiple` drops
// the shared name so each item opens independently. The accent (open marker + chevron) rides the shared
// ori-color utility, read through the resolved --ori-color alias like the rest of the library.
//
// Panel content: `#panel-<value>` renders into its own section; the scoped `#default="{ item }"` slot is
// a shared template rendered into every section without one, so ids inside it repeat (see OriTabs for
// the `panel-` prefix). Content is not gated on `open`: a closed <details> keeps it in the DOM so
// find-in-page can reveal it.
const {
    color = 'primary',
    items,
    multiple = false,
    radius = 'md'
} = defineProps<{
    color?: ThemeColor
    items: AccordionItem[]
    multiple?: boolean
    radius?: RadiusSize
}>()

// SSR-safe shared name for the native exclusive accordion; only applied when not `multiple`, so the
// browser enforces single-open. `undefined` in multiple mode means each <details> toggles on its own.
const uid = useId()
const groupName = computed(() => (multiple ? undefined : uid))

// A native <summary> has no real `disabled` state — aria-disabled + tabindex=-1 are advisory and don't
// stop Enter/Space/click from toggling its <details>. Block the toggle ourselves so a disabled item is
// genuinely inert for keyboard + AT, not just dimmed (the a11y-correct source of truth).
function blockDisabled(event: Event, disabled?: boolean): void {
    if (disabled) event.preventDefault()
}

// `AccordionItem.title` was renamed to `label` before 1.0 to converge with every other collection
// item in the catalog. TypeScript already rejects the old key, but a plainly-typed array (JS, JSON
// from an API, an `as any` demo) would silently render empty summaries — so name the rename here
// rather than leaving the caller to diff the markup. Ships only in DEV; `import.meta.env.DEV` is a
// compile-time constant, so the whole block is dropped from the production bundle.
if (import.meta.env.DEV) {
    const slots = useSlots()
    watchEffect(() => {
        // Typed as the caller may actually have built it, not as the prop promises: `label` optional
        // (that is the whole failure mode) and the retired `title` visible to the check.
        const loose = items as ReadonlyArray<Partial<AccordionItem> & { title?: unknown }>
        const stale = loose
            .filter((item) => item.label === undefined && typeof item.title === 'string')
            .map((item) => String(item.value))
        if (stale.length)
            console.warn(
                `[OriAccordion] item(s) ${stale.join(', ')} pass \`title\`, which was renamed to \`label\` ` +
                    'before 1.0 (matching TabItem / SelectOption / RadioOption / ComboboxItem / MenuItem). ' +
                    'Rename the key — the summary renders empty otherwise.'
            )

        // A `#panel-<value>` slot whose value is a typo, or whose item was removed, consumes nothing
        // and Vue never warns about an unconsumed slot — the section silently falls back to `#default`
        // or renders empty. Exact match against the item values, with the same empty-collection guard
        // as OriTabs: an empty `items` is "not loaded yet", and every panel slot is an orphan against
        // an empty set.
        if (items.length === 0) return
        const values = new Set(items.map((item) => `panel-${item.value}`))
        const orphans = Object.keys(slots).filter((name) => name.startsWith('panel-') && !values.has(name))
        if (orphans.length)
            console.warn(
                `[OriAccordion] panel slot(s) #${orphans.join(', #')} match no item value — check the ` +
                    `spelling against \`items\` (${items.map((item) => item.value).join(', ')}).`
            )
    })
}
</script>

<template>
    <div
        :class="[
            'ori-accordion',
            `ori-color_${color}`,
            {
                [`ori-size-radius_${radius}`]: radius
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
                <span class="ori-accordion__title"
                    ><slot name="title" :item="item">{{ item.label }}</slot></span
                >
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
                <slot :name="`panel-${item.value}`" :item="item">
                    <slot :item="item" />
                </slot>
            </div>
        </details>
    </div>
</template>
