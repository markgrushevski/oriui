<script lang="ts" setup>
import { computed, mergeProps } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor, Variant } from '../../types';
import { useToolbarItem } from '@oriui/headless/vue';
import { OriButton } from '../button';
import { OriTooltip } from '../tooltip';

// OriToolbarButton — a button that participates in the toolbar's roving tabindex. Composes OriButton
// for the visuals and `useToolbarItem` for the roving props. Two toolbar-specific additions: a `pressed`
// state (→ aria-pressed, for toggle buttons like bold/italic), and a baked `tooltip` that auto-wires
// aria-describedby onto the real <button> — the accessible fix a pure-CSS tooltip can't do on its own.
//
// `disabled` is aria-disabled + STILL FOCUSABLE (WAI-ARIA toolbar discoverability): roving visits it,
// but activation is blocked. inheritAttrs:false so a caller's listeners/attrs land on the <button>,
// not the tooltip wrapper.
const {
    color,
    disabled = false,
    icon,
    label,
    // `= undefined` is load-bearing: Vue coerces an ABSENT boolean prop to `false`, which would render
    // aria-pressed="false" on a plain (non-toggle) button. An explicit default opts out of that coercion
    // so an unbound `pressed` stays `undefined` — no aria-pressed. Same footgun as OriDialog's `open`.
    pressed = undefined,
    radius,
    size,
    text,
    tooltip,
    variant = 'text'
} = defineProps<{
    color?: ThemeColor;
    disabled?: boolean;
    icon?: string;
    /** Accessible name for an icon-only button (→ aria-label); falls back to `tooltip`. */
    label?: string;
    /** Toggle state → aria-pressed. Omit for a plain action button (no aria-pressed rendered). */
    pressed?: boolean;
    radius?: RadiusSize;
    size?: ActionSize;
    text?: string;
    /** Optional tooltip; renders an OriTooltip and wires aria-describedby onto the button. */
    tooltip?: string;
    variant?: Variant;
}>();

defineOptions({ inheritAttrs: false });

const { itemProps } = useToolbarItem();

// A11y guardrail (dev only): an icon-only button with no name is an axe `button-name` failure. Warn
// when `icon` is set but there's no `label` / `tooltip` / `text` to name it (mirrors OriToolbar's warn).
if (import.meta.env?.DEV && icon && !label && !tooltip && !text) {
    console.warn(
        '[OriToolbarButton] an icon-only button needs an accessible name — pass `label` (or `tooltip` / `text`).'
    );
}

// aria-describedby points the tooltip at the button ONLY when it's a genuine supplementary description
// (a `label` names the button). When the name itself falls back to the tooltip text, describing with the
// same text would double-announce (name == description), so it's omitted.
const describedBy = (bubbleId: string) => (label ? bubbleId : undefined);

// OriButton props + the toolbar/roving/a11y attributes (the latter fall through to the <button>).
const buttonBindings = computed(() => ({
    ...itemProps.value,
    color,
    icon,
    radius,
    size,
    text,
    variant,
    'aria-label': label ?? tooltip,
    'aria-pressed': pressed,
    'aria-disabled': disabled || undefined
}));

// Block activation of an aria-disabled item. CSS pointer-events:none already stops the mouse; this
// covers the keyboard (Enter/Space fire a click on a focused button). Capture phase + stopImmediate so
// a caller's own @click (bubble, same element) never runs.
function onClickCapture(event: MouseEvent): void {
    if (disabled) {
        event.stopImmediatePropagation();
        event.preventDefault();
    }
}
</script>

<template>
    <OriTooltip v-if="tooltip" :content="tooltip">
        <template #default="{ bubbleId }">
            <OriButton
                v-bind="mergeProps(buttonBindings, $attrs)"
                :aria-describedby="describedBy(bubbleId)"
                @click.capture="onClickCapture"
            >
                <!-- Forward the caller's children (any icon source) to OriButton; when absent, OriButton
                     falls back to the `icon`/`text` props. The `v-if` keeps that fallback working — an
                     always-present (even empty) slot would suppress it. -->
                <template v-if="$slots.default" #default><slot></slot></template>
            </OriButton>
        </template>
    </OriTooltip>

    <OriButton v-else v-bind="mergeProps(buttonBindings, $attrs)" @click.capture="onClickCapture">
        <template v-if="$slots.default" #default><slot></slot></template>
    </OriButton>
</template>
