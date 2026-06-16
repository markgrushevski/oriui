<script setup lang="ts">
import { computed, ref } from 'vue';
import { useOriTheme, SKINS, type SkinId } from '../composables/useOriTheme';

// A no-JS-by-default skin picker: a native <details> dropdown listing every skin with a live
// colour-swatch preview. This is the docs' showcase of the token/skin architecture — switching is
// a single data-ori-skin attribute, zero runtime. Outside-click close is the only scripted bit.
const { skin, setSkin } = useOriTheme();
const root = ref<HTMLDetailsElement>();

const current = computed(() => SKINS.find((s) => s.id === skin.value) ?? SKINS[0]);

function pick(id: SkinId) {
    setSkin(id);
    if (root.value) root.value.open = false;
}

function onDocPointerDown(e: PointerEvent) {
    if (root.value && !root.value.contains(e.target as Node)) root.value.open = false;
}

function onToggle() {
    if (root.value?.open) document.addEventListener('pointerdown', onDocPointerDown);
    else document.removeEventListener('pointerdown', onDocPointerDown);
}
</script>

<template>
    <details ref="root" class="skin-picker" @toggle="onToggle">
        <summary class="skin-picker__trigger">
            <span class="skin-picker__swatches" aria-hidden="true">
                <span v-for="(c, i) in current.swatches" :key="i" class="skin-picker__dot" :style="{ background: c }" />
            </span>
            <span class="skin-picker__label">{{ current.label }}</span>
            <span class="skin-picker__chevron" aria-hidden="true">▾</span>
        </summary>

        <div class="skin-picker__menu" role="menu" aria-label="Skin">
            <button
                v-for="s in SKINS"
                :key="s.id"
                type="button"
                role="menuitemradio"
                :aria-checked="skin === s.id"
                class="skin-picker__item"
                :data-active="skin === s.id || undefined"
                @click="pick(s.id)"
            >
                <span class="skin-picker__swatches" aria-hidden="true">
                    <span v-for="(c, i) in s.swatches" :key="i" class="skin-picker__dot" :style="{ background: c }" />
                </span>
                <span class="skin-picker__label">{{ s.label }}</span>
                <span v-if="skin === s.id" class="skin-picker__check" aria-hidden="true">✓</span>
            </button>
        </div>
    </details>
</template>

<style>
.skin-picker {
    position: relative;
}

.skin-picker__trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    padding: 5px 10px;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-background) 18%, transparent);
    border-radius: 8px;

    color: var(--ori-color-on-background);

    font-size: 13px;
    font-weight: 600;

    list-style: none;
    cursor: pointer;
}

.skin-picker__trigger::-webkit-details-marker {
    display: none;
}

.skin-picker__swatches {
    display: inline-flex;
}

.skin-picker__dot {
    width: 11px;
    height: 11px;

    border-radius: 50%;

    box-shadow: 0 0 0 1.5px var(--ori-color-surface);
}

.skin-picker__dot:not(:first-child) {
    margin-left: -4px;
}

.skin-picker__chevron {
    font-size: 10px;
    opacity: 0.6;
}

.skin-picker__menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 30;

    min-width: 190px;
    padding: 6px;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-background) 12%, transparent);
    border-radius: 12px;

    background: var(--ori-color-surface);

    box-shadow: var(--ori-shadow-lg);
}

.skin-picker__item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    padding: 7px 9px;

    border: 0;
    border-radius: 8px;

    background: none;
    color: var(--ori-color-on-surface);

    font-size: 13px;
    font-weight: 500;
    text-align: left;

    cursor: pointer;
}

.skin-picker__item:hover {
    background: color-mix(in srgb, var(--ori-color-on-surface) 8%, transparent);
}

.skin-picker__item[data-active] {
    color: var(--ori-color-primary);
    font-weight: 700;
}

.skin-picker__check {
    margin-left: auto;
}
</style>
