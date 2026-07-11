<script lang="ts" setup>
import { computed, provide, ref, watch } from 'vue';
import { useColorPicker } from '@oriui/headless/vue';
import type { ColorFormat } from '@oriui/headless/vue';
import { OriSlider } from '../slider';
import { OriInput } from '../input';
import { OriButton } from '../button';
import { oriFieldKey, useOriField } from '../field/context';

// OriColorPicker — an INLINE saturation/value + hue (+ optional alpha) + hex + presets panel. It is
// open-state-agnostic: to open from a swatch button, drop it inside <OriPopover> and reuse its #trigger
// (the widget and the overlay are separate — the OriPopover ADR). Behaviour lives in the
// framework-agnostic `useColorPicker` (sRGB + 2D-area math, no adapter/machine); this SFC renders the
// parts and reuses OriSlider (hue/alpha) and OriInput (hex). v-model is a lowercase color STRING;
// `change` commits once per interaction (one undo).
const {
    alpha = false,
    disabled = false,
    eyedropper = false,
    form,
    format = 'hex',
    label,
    name,
    presets
} = defineProps<{
    /** Add an alpha channel — a checkerboard slider and `#rrggbbaa` / `rgba()` / `hsla()` output. */
    alpha?: boolean;
    disabled?: boolean;
    /** Show an eyedropper trigger (EyeDropper API; auto-hidden where the browser lacks it). */
    eyedropper?: boolean;
    /** Associate the submitted value's hidden input with a form by id (when not a descendant of it). */
    form?: string;
    /** Output format for the emitted string (default `'hex'`). */
    format?: ColorFormat;
    /** Accessible name for the whole control (→ `aria-label`). */
    label?: string;
    /** Submit the current color under this field name via a hidden input (a color always has a value). */
    name?: string;
    /** Preset swatches — a `string[]` of colors, rendered as a single-select roving listbox. */
    presets?: string[];
}>();

const model = defineModel<string>();
const emit = defineEmits<{ change: [value: string] }>();

// A color-picker names itself via aria-label(ledby), so inside an OriField it points at the field's
// label id + adopts its describedby / disabled; standalone it keeps its own `label` → aria-label. It has
// no size / required / invalid concept, so those field bits don't apply. `isDisabled` feeds the engine.
const field = useOriField();
const isDisabled = computed(() => disabled || (field?.disabled.value ?? false));
const isInvalid = computed(() => field?.invalid.value ?? false);
const labelledBy = computed(() => field?.labelId.value);
const describedBy = computed(() => field?.describedBy.value);
// Keep the own aria-label unless the field actually supplies a labelledby (a label-less field must not
// blank the picker's name).
const ariaLabel = computed(() => (labelledBy.value ? undefined : label));

// This picker COMPOSES field-aware children (OriSlider ×2, OriInput hex, OriButton eyedropper). Since
// the field context flows via provide/inject to the whole subtree, shield the children so they render
// standalone — otherwise each adopts field.id (duplicate ids) and the hex error is suppressed. The
// picker's OWN isDisabled is forwarded to them explicitly below so field-disabled still propagates.
provide(oriFieldKey, undefined);

const cp = useColorPicker(() => ({
    value: model.value,
    format,
    alpha,
    eyedropper,
    disabled: isDisabled.value,
    presets,
    onInput: (next) => {
        model.value = next;
    },
    onChange: (next) => emit('change', next)
}));

// Form submission. A color control always carries a value (like a native <input type=color>), so the
// hidden input submits the current color in the emitted format — never empty, even before interaction
// (whereas the v-model can start undefined). `isDisabled` excludes it from FormData, matching a native
// disabled control. Rendered only when `name` is set.
const submittedColor = computed(() => cp.value.value);

// A single-path eyedropper glyph (MDI-style) for the pick-from-screen trigger.
const EYEDROPPER_ICON =
    'M19.35 11.72 17.22 13.85 15.81 12.43 8.1 20.14 3.5 22 2 20.5 3.86 15.9 11.57 8.19 10.15 6.78 12.28 4.65 19.35 11.72M16.76 3C17.93 1.83 19.83 1.83 21 3 22.17 4.17 22.17 6.07 21 7.24L19.08 9.16 14.84 4.92 16.76 3Z';

// The hex field holds a local draft so a partial entry isn't reformatted mid-type; it commits on
// blur / Enter. cp.hex changes (drag, hue, preset) re-seed the draft.
const hexDraft = ref(cp.hex.value);
const hexInvalid = ref(false);
watch(
    () => cp.hex.value,
    (hex) => {
        hexDraft.value = hex;
        hexInvalid.value = false;
    }
);
function onHexInput(next: string | undefined): void {
    hexDraft.value = next ?? '';
    hexInvalid.value = false;
}
function commitHex(): void {
    hexInvalid.value = !cp.setHex(hexDraft.value);
}
</script>

<template>
    <div
        class="ori-color-picker"
        role="group"
        :aria-label="ariaLabel"
        :aria-labelledby="labelledBy"
        :aria-describedby="describedBy"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :data-disabled="isDisabled ? '' : undefined"
    >
        <!-- 2D saturation × value area. The two visually-hidden range inputs are the a11y surface: each
             owns one axis (saturation = horizontal keys, brightness = vertical), so every keystroke
             announces on the focused slider. Pointer drag on the area moves both axes at once. -->
        <div class="ori-color-picker__area" v-bind="cp.areaProps.value">
            <span class="ori-color-picker__area-thumb" :style="cp.areaThumbStyle.value" aria-hidden="true"></span>
            <input class="ori-color-picker__channel" v-bind="cp.getChannelInputProps('saturation')" />
            <input class="ori-color-picker__channel" v-bind="cp.getChannelInputProps('value')" />
        </div>

        <div class="ori-color-picker__controls">
            <span
                class="ori-color-picker__swatch"
                :class="{ 'ori-color-picker__swatch_alpha': alpha }"
                role="img"
                :aria-label="cp.hex.value"
                :style="{ '--ori-color': cp.swatchColor.value, '--ori-ink': cp.ink.value }"
            >
                <slot name="swatch" :color="cp.swatchColor.value" :ink="cp.ink.value"></slot>
            </span>

            <div class="ori-color-picker__sliders">
                <OriSlider
                    class="ori-slider_hue ori-color-picker__hue"
                    :model-value="cp.hue.value"
                    :min="0"
                    :max="359"
                    :step="1"
                    :disabled="isDisabled"
                    aria-label="Hue"
                    :aria-valuetext="`${Math.round(cp.hue.value)}°`"
                    @update:model-value="cp.setHue"
                    @change="cp.commit"
                />

                <OriSlider
                    v-if="alpha"
                    class="ori-slider_alpha ori-color-picker__alpha"
                    :model-value="Math.round(cp.alpha.value * 100)"
                    :min="0"
                    :max="100"
                    :step="1"
                    :disabled="isDisabled"
                    :style="{ '--ori-color': cp.opaqueColor.value }"
                    aria-label="Alpha"
                    :aria-valuetext="`${Math.round(cp.alpha.value * 100)}%`"
                    @update:model-value="(v) => cp.setAlpha(v / 100)"
                    @change="cp.commit"
                />
            </div>

            <OriButton
                v-if="eyedropper && cp.eyedropperSupported.value"
                class="ori-color-picker__eyedropper"
                variant="outline"
                :icon="EYEDROPPER_ICON"
                :disabled="isDisabled"
                aria-label="Pick a color from the screen"
                @click="cp.openEyeDropper"
            />
        </div>

        <OriInput
            class="ori-color-picker__hex"
            :model-value="hexDraft"
            :disabled="disabled"
            :error="hexInvalid ? 'Enter a valid hex color' : undefined"
            aria-label="Hex color"
            autocapitalize="none"
            autocomplete="off"
            spellcheck="false"
            @update:model-value="onHexInput"
            @blur="commitHex"
            @keydown.enter="commitHex"
        />

        <div
            v-if="presets && presets.length"
            class="ori-color-picker__presets"
            v-bind="cp.presetGroupProps.value"
            @keydown="cp.onPresetKeydown"
        >
            <button
                v-for="(preset, i) in presets"
                :key="preset"
                class="ori-color-picker__preset"
                v-bind="cp.getPresetProps(preset, i)"
            >
                <slot
                    name="preset"
                    :preset="preset"
                    :index="i"
                    :selected="cp.getPresetProps(preset, i)['aria-selected']"
                ></slot>
            </button>
        </div>

        <!-- Submit the current color under `name` (a color control has no empty state — mirrors a native
             <input type=color>). Disabled excludes it from FormData. -->
        <input
            v-if="name"
            type="hidden"
            :name="name"
            :form="form"
            :value="submittedColor"
            :disabled="isDisabled || undefined"
        />
    </div>
</template>
