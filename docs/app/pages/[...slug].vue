<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const route = useRoute();

const { data: page } = await useAsyncData(`content:${route.path}`, () =>
    queryCollection('docs').path(route.path).first()
);

// Right-hand "On this page" table of contents, derived from the page headings.
const toc = computed(() => page.value?.body?.toc?.links ?? []);

// Scroll-spy: highlight the heading currently in view in the ToC. Client-only (IntersectionObserver),
// re-wired on navigation since this page component is reused across doc routes.
const activeId = ref('');
let headings: HTMLElement[] = [];
let spyTimer: ReturnType<typeof setTimeout> | undefined;
let raf = 0;

// Active section = the last heading scrolled past the header offset. A position scan (vs an
// IntersectionObserver) has no dead zone inside long sections and is correct on a deep-scrolled reload.
function computeActive() {
    raf = 0;
    const offset = 100;
    let current = headings[0]?.id ?? '';
    for (const h of headings) {
        if (h.getBoundingClientRect().top - offset <= 0) current = h.id;
        else break;
    }
    activeId.value = current;
}

function onScroll() {
    if (!raf) raf = requestAnimationFrame(computeActive);
}

// ContentRenderer may populate the heading DOM a tick or two after mount, so retry until it exists.
function setupSpy(attempt = 0) {
    clearTimeout(spyTimer);
    if (!import.meta.client) return;
    window.removeEventListener('scroll', onScroll);
    headings = Array.from(document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]'));
    if (!headings.length) {
        if (attempt < 10) spyTimer = setTimeout(() => setupSpy(attempt + 1), 100);
        return;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    computeActive();
}

onMounted(() => nextTick(() => setupSpy()));
watch(
    () => route.path,
    () => nextTick(() => setupSpy())
);
onBeforeUnmount(() => {
    if (import.meta.client) window.removeEventListener('scroll', onScroll);
    clearTimeout(spyTimer);
    cancelAnimationFrame(raf);
});
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
                    <a
                        :href="`#${link.id}`"
                        class="docs-toc__link"
                        :class="{ 'docs-toc__link_active': activeId === link.id }"
                    >
                        {{ link.text }}
                    </a>
                    <a
                        v-for="child in link.children || []"
                        :key="child.id"
                        :href="`#${child.id}`"
                        class="docs-toc__link docs-toc__link_sub"
                        :class="{ 'docs-toc__link_active': activeId === child.id }"
                    >
                        {{ child.text }}
                    </a>
                </template>
            </nav>
        </aside>
    </div>
</template>
