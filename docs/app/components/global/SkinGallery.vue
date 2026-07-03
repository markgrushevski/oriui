<script setup lang="ts">
// Interactive skin gallery for the docs (MDC renders it as `:skin-gallery`). Each card is the skin's
// identity swatches + intent; clicking one calls the same `useOriTheme` the header picker uses, so the
// whole site reskins instantly — the zero-runtime theming story, shown live. Skins are page-level
// (`:root[data-ori-skin]`), so they can't be scoped to a card; applying site-wide is the honest demo.
import { useOriTheme, SKINS, type SkinId } from '../../composables/useOriTheme';
import { OriBadge, OriButton } from '@oriui/vue';

const { skin, theme, setSkin, toggleTheme } = useOriTheme();

// One-line design intent per skin (mirrors the comments in packages/css `_themes-skins.css`).
const INTENT: Record<SkinId, string> = {
    ori: 'Luminous azure & cyan — the default.',
    sumi: '墨 graphite ink on warm washi paper — the 織り reading.',
    indigo: 'Calm, confident indigo on cool grey.',
    tech: 'Cool, product-UI teal.',
    health: 'Fresh medical green.',
    luxury: 'Warm gold on cream.',
    cyber: 'Neon magenta on near-black.'
};
</script>

<template>
    <div class="skin-gallery">
        <p class="skin-gallery__hint">
            Click a skin to apply it across the whole site — every <code>--ori-color-*</code> token repoints instantly,
            no reload, no flash.
            <button type="button" class="skin-gallery__mode" @click="toggleTheme">
                Switch to {{ theme === 'dark' ? 'light' : 'dark' }}
            </button>
        </p>

        <div class="skin-gallery__grid">
            <button
                v-for="s in SKINS"
                :key="s.id"
                type="button"
                class="skin-gallery__card"
                :data-active="skin === s.id || undefined"
                :aria-pressed="skin === s.id"
                @click="setSkin(s.id)"
            >
                <span class="skin-gallery__swatches" aria-hidden="true">
                    <span v-for="(c, i) in s.swatches" :key="i" class="skin-gallery__dot" :style="{ background: c }" />
                </span>
                <span class="skin-gallery__name">
                    {{ s.label }}
                    <span v-if="skin === s.id" class="skin-gallery__active">active</span>
                </span>
                <span class="skin-gallery__intent">{{ INTENT[s.id] }}</span>
            </button>
        </div>

        <div class="skin-gallery__preview">
            <span class="skin-gallery__preview-label">Live preview — {{ theme }}</span>
            <div class="skin-gallery__preview-row">
                <OriButton text="Fill" variant="fill" />
                <OriButton text="Tonal" variant="tonal" />
                <OriButton text="Outline" variant="outline" />
                <OriBadge :content="5" color="primary">
                    <OriButton text="Inbox" variant="tonal" />
                </OriBadge>
            </div>
        </div>
    </div>
</template>

<style>
.skin-gallery {
    margin: 24px 0;
}

.skin-gallery__hint {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;

    margin: 0 0 16px;

    color: var(--ori-color-on-background);
    font-size: 14px;
}

.skin-gallery__mode {
    padding: 4px 12px;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-background) 18%, transparent);
    border-radius: 8px;

    background: var(--ori-color-surface);
    color: var(--ori-color-on-surface);

    font-size: 13px;
    font-weight: 600;

    cursor: pointer;
}

.skin-gallery__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
}

.skin-gallery__card {
    display: flex;
    flex-direction: column;
    gap: 6px;

    padding: 14px 16px;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-background) 12%, transparent);
    border-radius: 12px;

    background: var(--ori-color-surface);
    color: var(--ori-color-on-surface);

    text-align: left;

    cursor: pointer;
    transition: border-color 0.15s ease;
}

@media (hover: hover) {
    .skin-gallery__card:hover {
        border-color: color-mix(in srgb, var(--ori-color-primary) 55%, transparent);
    }
}

.skin-gallery__card[data-active] {
    border-color: var(--ori-color-primary);
    box-shadow: 0 0 0 1px var(--ori-color-primary);
}

.skin-gallery__swatches {
    display: inline-flex;
    margin-bottom: 2px;
}

.skin-gallery__dot {
    width: 22px;
    height: 22px;

    border-radius: 50%;

    box-shadow: 0 0 0 2px var(--ori-color-surface);
}

.skin-gallery__dot:not(:first-child) {
    margin-left: -8px;
}

.skin-gallery__name {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 15px;
    font-weight: 700;
}

.skin-gallery__active {
    padding: 1px 7px;

    border-radius: 999px;

    background: color-mix(in srgb, var(--ori-color-primary) 16%, transparent);
    color: var(--ori-color-primary);

    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.skin-gallery__intent {
    color: color-mix(in srgb, var(--ori-color-on-surface) 72%, transparent);
    font-size: 12.5px;
    line-height: 1.4;
}

.skin-gallery__preview {
    margin-top: 18px;
    padding: 16px;

    border: 1px dashed color-mix(in srgb, var(--ori-color-on-background) 18%, transparent);
    border-radius: 12px;

    background: var(--ori-color-background);
}

.skin-gallery__preview-label {
    display: block;

    margin-bottom: 12px;

    color: color-mix(in srgb, var(--ori-color-on-background) 65%, transparent);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.skin-gallery__preview-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}
</style>
