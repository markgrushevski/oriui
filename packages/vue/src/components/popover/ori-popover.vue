<script lang="ts" setup>
import { computed, useId } from 'vue'
import type { AnchoredPlacement } from '../../types'

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
defineOptions({ inheritAttrs: false })

/**
 * The closed vocabulary `aria-haspopup` accepts on a trigger. Deliberately NOT the same set as the
 * panel's `role`: a popover panel is legitimately a `group`, a `region`, a `tooltip` or roleless, and
 * none of those are legal `aria-haspopup` tokens — so narrowing `role` to this union would forbid valid
 * markup, while widening this to `string` is what used to make the trigger bag un-spreadable.
 */
type PopupRole = 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid'

const POPUP_ROLES: readonly string[] = ['dialog', 'menu', 'listbox', 'tree', 'grid']

const {
    haspopup,
    placement = 'bottom-start',
    role = 'dialog'
} = defineProps<{
    /** What the TRIGGER announces it opens (`aria-haspopup`). Defaults to `role` when the panel's role
     *  is one of the five ARIA popup types, else to "dialog" — set it explicitly when the panel carries
     *  a role outside that vocabulary (`group`, `region`, …). */
    haspopup?: PopupRole
    placement?: AnchoredPlacement
    /** ARIA role for the PANEL — "dialog" (default), "menu", "listbox", "group", … per the content it
     *  holds. Unconstrained on purpose: the panel's role is a wider set than `aria-haspopup`'s. */
    role?: string
}>()

// SSR-safe unique ids so the popovertarget link and the anchor-name never collide across instances.
const uid = useId()
const panelId = `ori-popover-${uid}`
const anchorName = `--ori-popover-${uid}`

// The trigger's popup HINT, resolved from the two concerns kept apart above: an explicit `haspopup`
// wins; otherwise mirror `role` when it happens to be one of the five popup types (the ergonomic case
// — `role="menu"` should not need a second prop), and fall back to "dialog" when it is not, because a
// generic popup is what a `group`/`region` panel is from the trigger's point of view. The mirror used
// to be unconditional, which is what leaked `string` into the bag below.
const popupRole = computed<PopupRole>(() => haspopup ?? (POPUP_ROLES.includes(role) ? (role as PopupRole) : 'dialog'))

// Spread onto the trigger button: opens the panel, names it as this panel's anchor, and conveys the
// popup relationship. Every value here is typed as narrowly as the attribute it feeds, so the bag
// `v-bind`s onto a real <button> without a cast — the whole point of splitting `haspopup` off `role`.
const triggerProps = computed(() => ({
    popovertarget: panelId,
    'aria-haspopup': popupRole.value,
    'aria-controls': panelId,
    style: { anchorName }
}))
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
