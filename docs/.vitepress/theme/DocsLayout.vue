<script setup>
import DefaultTheme from 'vitepress/theme';
import { ref, onMounted, watch } from 'vue';

const Layout = DefaultTheme.Layout;
const skin = ref('neutral');

function apply(value) {
    const el = document.documentElement;
    if (value === 'ori') el.setAttribute('data-ori-skin', 'ori');
    else el.removeAttribute('data-ori-skin');
}

onMounted(() => {
    skin.value = localStorage.getItem('ori-skin') === 'ori' ? 'ori' : 'neutral';
    apply(skin.value);
});

watch(skin, (value) => {
    localStorage.setItem('ori-skin', value);
    apply(value);
});
</script>

<template>
    <Layout>
        <!-- Light/dark rides VitePress's built-in appearance toggle (our dark selector is
             :root.dark, which VitePress sets on <html>). This adds only the skin switch. -->
        <template #nav-bar-content-after>
            <ClientOnly>
                <button
                    class="ori-skin-toggle"
                    type="button"
                    :title="`oriUI skin: ${skin}`"
                    @click="skin = skin === 'ori' ? 'neutral' : 'ori'"
                >
                    skin: {{ skin }}
                </button>
            </ClientOnly>
        </template>
    </Layout>
</template>

<style>
:root {
    --color-cookie: #f4be68;
    --color-glass: #ebe6dc;
    --color-lid: #e6be86;

    --vp-button-brand-active-bg: #e6be86ff;
    --vp-button-brand-hover-bg: #f4be68ff;
    --vp-button-brand-bg: #f4be68d0;
    --vp-home-hero-name-color: transparent;
    --vp-home-hero-name-background: linear-gradient(
        90deg,
        var(--color-cookie) 0%,
        var(--color-glass) 56%,
        var(--color-lid) 80%
    );

    --vp-custom-block-font-size: 16px;
}

.ori-skin-toggle {
    margin-left: 12px;
    padding: 4px 10px;

    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;

    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);

    font-size: 12px;
    font-weight: 600;

    cursor: pointer;
    transition:
        border-color 0.2s,
        background-color 0.2s;
}

.ori-skin-toggle:hover {
    border-color: var(--vp-c-brand-1);
}

.custom-block .vij.flex {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 16px;
}

.custom-block .vij.flex.nowrap {
    flex-wrap: nowrap;
}

.custom-block .vij.flex.column {
    flex-direction: column;
    align-items: flex-start;
    justify-content: start;
}

.custom-block .vij.flex.between {
    justify-content: space-between;
}

.custom-block .vij.flex.stretch {
    align-items: stretch;
}

.custom-block .vij.flex.center {
    align-items: center;
}
</style>
