<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { swallowClick } from '../../internal/events'
import { OriIcon } from '../icon'

// OriListItem — one row of an OriList: a prepended icon, a label with an optional subtitle, and an appended
// end (short text such as a shortcut, a chevron into a sub-panel, or a control of the caller's). The row's element follows
// what it does: `as` wins (a router link component, say); `href` makes a link; a click listener makes a
// button; otherwise it is a plain <div> that only holds content, and only that kind of row may hold a
// control of its own, since a control inside a button or a link is invalid HTML. Attributes and listeners
// go to the row element, not the <li>.
defineOptions({ inheritAttrs: false })

const {
    as,
    chevron = false,
    current = false,
    disabled = false,
    href,
    icon,
    label,
    meta,
    subtitle
} = defineProps<{
    /** The row element: a tag name or a component (a router link). */
    as?: string | object
    /** A chevron at the end: the row opens a sub-panel. */
    chevron?: boolean
    /** The current page or the selected entry → aria-current. */
    current?: boolean
    disabled?: boolean
    /** Renders the row as a link. */
    href?: string
    /** An SVG path drawn before the label (`OriIcon`). */
    icon?: string
    label?: string
    /** Short text at the end of the row, such as a shortcut ("Ctrl+S") or a value ("800 × 600"). */
    meta?: string
    /** A second line under the label. */
    subtitle?: string
}>()

const attrs = useAttrs()
const tag = computed(() => as ?? (href ? 'a' : attrs.onClick ? 'button' : 'div'))
// A link is an <a> or a component (a router link); any other tag is a static row like the <div>.
const isLink = computed(() => tag.value === 'a' || typeof tag.value !== 'string')

// Only keys that say something are bound. An `undefined` one would still be a fall-through attribute on a
// component row and erase what that component sets itself (a router link's own href and aria-current).
const rowBindings = computed(() => {
    const bindings: Record<string, unknown> = {}
    if (tag.value === 'button') {
        bindings.type = 'button'
        if (disabled) bindings.disabled = true
    } else if (isLink.value) {
        // A disabled link has no href, so it is neither followed nor focused; its clicks are swallowed too.
        // An <a> without href has no role of its own, so it keeps `link` explicitly to be announced as one.
        if (href && !disabled) bindings.href = href
        if (disabled) {
            if (tag.value === 'a') bindings.role = 'link'
            bindings['aria-disabled'] = 'true'
            bindings.onClickCapture = swallowClick
        }
    }
    if (current) bindings['aria-current'] = isLink.value ? 'page' : 'true'
    return bindings
})
</script>

<template>
    <li class="ori-list__item">
        <component :is="tag" class="ori-list__row" v-bind="{ ...rowBindings, ...$attrs }">
            <span v-if="$slots.prepend || icon" class="ori-list__prepend">
                <slot name="prepend"><OriIcon :icon="icon!" /></slot>
            </span>
            <span class="ori-list__main">
                <slot>
                    <span class="ori-list__label">{{ label }}</span>
                    <span v-if="subtitle" class="ori-list__subtitle">{{ subtitle }}</span>
                </slot>
            </span>
            <span v-if="$slots.append || meta || chevron" class="ori-list__append">
                <slot name="append">
                    <span v-if="meta" class="ori-list__meta">{{ meta }}</span>
                    <svg
                        v-if="chevron"
                        class="ori-list__chevron"
                        viewBox="0 0 24 24"
                        width="1em"
                        height="1em"
                        aria-hidden="true"
                    >
                        <path
                            d="m9 6 6 6-6 6"
                            fill="none"
                            stroke="currentcolor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </slot>
            </span>
        </component>
    </li>
</template>
