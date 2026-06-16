<script setup lang="ts">
import { computed } from 'vue';

const route = useRoute();

const { data: page } = await useAsyncData(`content:${route.path}`, () =>
    queryCollection('docs').path(route.path).first()
);

// Right-hand "On this page" table of contents, derived from the page headings.
const toc = computed(() => page.value?.body?.toc?.links ?? []);
</script>

<template>
    <div class="docs-page">
        <article class="prose">
            <ContentRenderer v-if="page" :value="page" />
            <div v-else>
                <h1>Not found</h1>
                <p>No documentation page exists at this path.</p>
            </div>
        </article>

        <aside v-if="toc.length" class="docs-toc">
            <p class="docs-toc__title">On this page</p>
            <nav class="docs-toc__nav">
                <template v-for="link in toc" :key="link.id">
                    <a :href="`#${link.id}`" class="docs-toc__link">{{ link.text }}</a>
                    <a
                        v-for="child in link.children || []"
                        :key="child.id"
                        :href="`#${child.id}`"
                        class="docs-toc__link docs-toc__link_sub"
                    >
                        {{ child.text }}
                    </a>
                </template>
            </nav>
        </aside>
    </div>
</template>
