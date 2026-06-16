<script setup lang="ts">
const NuxtLink = resolveComponent('NuxtLink');

const features = [
    {
        title: 'Three woven layers',
        text: 'Styled components, headless behavior, and standalone CSS — each consumable on its own, sharing one token contract.'
    },
    {
        title: 'Zero-runtime theming',
        text: 'Skins and sizes are pure CSS custom properties under @layer. Switch theme or skin with a single attribute — no JS, no Tailwind.'
    },
    {
        title: 'Accessible by default',
        text: 'Real disabled and aria state, focus-visible rings, and contrast-checked on-color tokens. A portfolio-grade, a11y-first foundation.'
    }
];
</script>

<template>
    <section class="home">
        <p class="home__kicker">織り · weaving</p>
        <h1 class="home__title">Weave your UI, layer by layer</h1>
        <p class="home__tagline">
            Prototype fast — scale without rewriting. A layered Vue 3 UI library woven around shared design tokens.
        </p>

        <div class="home__cta">
            <OriButton :as="NuxtLink" to="/guide/get-started" text="Get started" color="primary" />
            <OriButton
                :as="NuxtLink"
                to="/components/button"
                text="Browse components"
                variant="outline"
                color="primary"
            />
        </div>

        <div class="home__features">
            <OriCard v-for="f in features" :key="f.title" class="home__feature" :title="f.title" :text="f.text" />
        </div>
    </section>
</template>
