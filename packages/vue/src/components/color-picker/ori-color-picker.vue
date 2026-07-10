<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useColorPicker } from '@oriui/headless/vue';
import type { ColorFormat } from '@oriui/headless/vue';
import { OriSlider } from '../slider';
import { OriInput } from '../input';

// OriColorPicker — an INLINE saturation/value + hue + hex + presets panel. It is open-state-agnostic:
// to open from a swatch button, drop it inside <OriPopover> and reuse its #trigger (the widget and the
// overlay are separate — the OriPopover ADR). Behaviour lives in the framework-agnostic `useColorPicker`
// (sRGB + 2D-area math, no adapter/machine); this SFC renders the parts and reuses OriSlider (hue) and
// OriInput (hex). v-model is a lowercase color STRING; `change` commits once per interaction (one undo).
const {
    disabled = false,
    format = 'hex',
    label,
    presets
} = defineProps<{
    disabled?: boolean;
    /** Output format for the emitted string (default `'hex'`). */
    format?: ColorFormat;
    /** Accessible name for the whole control (→ `aria-label`). */
    label?: string;
    /** Preset swatches — a `string[]` of colors, rendered as a single-select roving listbox. */
    presets?: string[];
}>();

const model = defineModel<string>();
const emit = defineEmits<{ change: [value: string] }>();

const cp = useColorPicker(() => ({
    value: model.value,
    format,
    label,
    disabled,
    presets,
    onInput: (next) => {
        model.value = next;
    },
    onChange: (next) => emit('change', next)
}));

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
    <div class="ori-color-picker" role="group" :aria-label="label" :data-disabled="disabled ? '' : undefined">
        <!-- 2D saturation × value area. The two visually-hidden range inputs are the a11y surface
             (role=slider, focusable, form value); the area's keydown routes the arrows in 2D. -->
        <div class="ori-color-picker__area" v-bind="cp.areaProps.value">
            <span class="ori-color-picker__area-thumb" :style="cp.areaThumbStyle.value" aria-hidden="true"></span>
            <input class="ori-color-picker__channel" v-bind="cp.getChannelInputProps('saturation')" />
            <input class="ori-color-picker__channel" v-bind="cp.getChannelInputProps('value')" />
        </div>

        <div class="ori-color-picker__controls">
            <span
                class="ori-color-picker__swatch"
                role="img"
                :aria-label="cp.hex.value"
                :style="{ '--ori-color': cp.swatchColor.value, '--ori-ink': cp.ink.value }"
            >
                <slot name="swatch" :color="cp.swatchColor.value" :ink="cp.ink.value"></slot>
            </span>

            <OriSlider
                class="ori-slider_hue ori-color-picker__hue"
                :model-value="cp.hue.value"
                :min="0"
                :max="360"
                :step="1"
                :disabled="disabled"
                aria-label="Hue"
                @update:model-value="cp.setHue"
                @change="cp.commit"
            />
        </div>

        <OriInput
            class="ori-color-picker__hex"
            :model-value="hexDraft"
            :disabled="disabled"
            :invalid="hexInvalid"
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
    </div>
</template>
