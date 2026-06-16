<script setup lang="ts">
const route = useRoute();

const { data: page } = await useAsyncData(`content:${route.path}`, () =>
    queryCollection('docs').path(route.path).first()
);
</script>

<template>
    <article class="prose">
        <ContentRenderer v-if="page" :value="page" />
        <div v-else>
            <h1>Not found</h1>
            <p>No documentation page exists at this path.</p>
        </div>
    </article>
</template>
