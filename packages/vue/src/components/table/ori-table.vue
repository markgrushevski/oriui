<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, useAttrs, useId, useSlots, useTemplateRef } from 'vue'

// OriTable — a styled <table> in a scroll box. The rows are yours (thead / tbody / tfoot in the default
// slot); the component adds the classes, the caption and the scroll box's accessibility: while the table
// is wider or taller than its box, the box is a tab stop, so a keyboard can scroll it, and a region named
// like the table (its caption, or the `aria-label` / `aria-labelledby` you give it). A table with no name
// gets no region, since an unnamed region is a landmark nobody can tell apart. A table that fits adds no
// tab stop. Attributes go to the <table>.
defineOptions({ inheritAttrs: false })

const {
    caption,
    captionHidden = false,
    hover = false,
    maxHeight,
    size = 'md',
    stickyHeader = false,
    striped = false
} = defineProps<{
    /** The table's name, rendered as its <caption>. */
    caption?: string
    /** Keep the caption for assistive technology only. */
    captionHidden?: boolean
    /** Tint the row under the pointer. */
    hover?: boolean
    /** A height for the scroll box (any CSS length); pairs with `stickyHeader`. */
    maxHeight?: string
    /** Cell density. */
    size?: 'sm' | 'md' | 'lg'
    /** Keep the header row in view while the rows scroll. */
    stickyHeader?: boolean
    /** Shade every other body row. */
    striped?: boolean
}>()

const slots = useSlots()
const captionId = `${useId()}-caption`
// A function, not a computed: `useSlots()` is not reactive, so a computed would cache a slot's absence.
const hasCaption = () => Boolean(caption) || Boolean(slots.caption)

// A function for the same reason: attributes are not reactive either, and the render reads it fresh.
const attrs = useAttrs()
function name(): Record<string, string> | undefined {
    if (hasCaption()) return { 'aria-labelledby': captionId }
    const labelledBy = attrs['aria-labelledby'] as string | undefined
    if (labelledBy) return { 'aria-labelledby': labelledBy }
    const label = attrs['aria-label'] as string | undefined
    return label ? { 'aria-label': label } : undefined
}

const scrollEl = useTemplateRef<HTMLElement>('scroll')
const scrolls = ref(false)
let observer: ResizeObserver | undefined

function measure(): void {
    const el = scrollEl.value
    if (el) scrolls.value = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
}

onMounted(() => {
    measure()
    const el = scrollEl.value
    if (!el || typeof ResizeObserver === 'undefined') return
    observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
    <div
        ref="scroll"
        class="ori-table-scroll"
        :style="maxHeight ? { maxHeight } : undefined"
        v-bind="scrolls ? name() : undefined"
        :role="scrolls && name() ? 'region' : undefined"
        :tabindex="scrolls ? 0 : undefined"
    >
        <table
            v-bind="$attrs"
            :class="[
                'ori-table',
                `ori-table_${size}`,
                {
                    'ori-table_caption-hidden': captionHidden,
                    'ori-table_hover': hover,
                    'ori-table_sticky-header': stickyHeader,
                    'ori-table_striped': striped
                }
            ]"
        >
            <caption v-if="hasCaption()" :id="captionId">
                <slot name="caption">{{ caption }}</slot>
            </caption>
            <slot></slot>
        </table>
    </div>
</template>
