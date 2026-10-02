<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { swallowClick } from '../../internal/events'
import { OriIcon } from '../icon'

// OriListItem — one row of an OriList: start (an icon), a label with an optional description, and an end
// (a shortcut hint, a chevron into a sub-panel, or a control of the caller's). The row's element follows
// what it does: `as` wins (a router link component, say); `href` makes a link; a click listener makes a
// button; otherwise it is a plain <div> that only holds content, and only that kind of row may hold a
// control of its own, since a control inside a button or a link is invalid HTML. Attributes and listeners
// go to the row element, not the <li>.
defineOptions({ inheritAttrs: false })

const {
    as,
    chevron = false,
    current = false,
    description,
    disabled = false,
    hint,
    href,
    icon,
    label
} = defineProps<{
    /** The row element: a tag name or a component (a router link). */
    as?: string | object
    /** A chevron at the end: the row opens a sub-panel. */
    chevron?: boolean
    /** The current page or the selected entry → aria-current. */
    current?: boolean
    /** A second line under the label. */
    description?: string
    disabled?: boolean
    /** Text at the end, such as a shortcut ("Ctrl+S"). */
    hint?: string
    /** Renders the row as a link. */
    href?: string
    /** An SVG path drawn at the start (`OriIcon`). */
    icon?: string
    label?: string
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
        if (href && !disabled) bindings.href = href
        if (disabled) {
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
            <span v-if="$slots.start || icon" class="ori-list__start">
                <slot name="start"><OriIcon :icon="icon!" /></slot>
            </span>
            <span class="ori-list__main">
                <slot>
                    <span class="ori-list__label">{{ label }}</span>
                    <span v-if="description" class="ori-list__description">{{ description }}</span>
                </slot>
            </span>
            <span v-if="$slots.end || hint || chevron" class="ori-list__end">
                <slot name="end">
                    <span v-if="hint" class="ori-list__hint">{{ hint }}</span>
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
