<script setup lang="ts">
// One top-level nav section (Guide / Components / Composables …), collapsible via the headless
// Disclosure primitive. A section either lists links directly, or holds nested category groups
// (each its own collapsible SidebarGroup) → links.
import { useDisclosure } from '@oriui/vue';

interface NavLink {
    label: string;
    to: string;
}
interface NavGroup {
    title: string;
    links: NavLink[];
}

defineProps<{ title: string; links?: NavLink[]; groups?: NavGroup[] }>();
const emit = defineEmits<{ navigate: [] }>();

const { triggerProps, contentProps, open } = useDisclosure(() => ({ defaultOpen: true }));
</script>

<template>
    <div class="docs-navtree__section">
        <button class="docs-navtree__heading" v-bind="triggerProps">
            {{ title }}
            <span class="docs-navtree__chevron" :data-open="open || undefined" aria-hidden="true">›</span>
        </button>

        <div class="docs-navtree__body" v-bind="contentProps">
            <template v-if="links">
                <NuxtLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    class="docs-sidebar__link"
                    @click="emit('navigate')"
                >
                    {{ link.label }}
                </NuxtLink>
            </template>

            <template v-if="groups">
                <SidebarGroup v-for="group in groups" :key="group.title" :title="group.title">
                    <NuxtLink
                        v-for="link in group.links"
                        :key="link.to"
                        :to="link.to"
                        class="docs-sidebar__link"
                        @click="emit('navigate')"
                    >
                        {{ link.label }}
                    </NuxtLink>
                </SidebarGroup>
            </template>
        </div>
    </div>
</template>
