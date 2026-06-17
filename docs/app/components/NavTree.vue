<script setup lang="ts">
// The docs navigation tree, reused by the desktop sidebar and the mobile drawer.
// Sections are top-level (Guide / Components / Composables); a section either holds links
// directly, or nested category groups (Components → Actions / Data input / …) → links.
interface NavLink {
    label: string;
    to: string;
}
interface NavGroup {
    title: string;
    links: NavLink[];
}
interface NavSection {
    title: string;
    links?: NavLink[];
    groups?: NavGroup[];
}

defineProps<{ sections: NavSection[] }>();
const emit = defineEmits<{ navigate: [] }>();
</script>

<template>
    <nav class="docs-navtree">
        <div v-for="section in sections" :key="section.title" class="docs-navtree__section">
            <div class="docs-navtree__heading">{{ section.title }}</div>

            <template v-if="section.links">
                <NuxtLink
                    v-for="link in section.links"
                    :key="link.to"
                    :to="link.to"
                    class="docs-sidebar__link"
                    @click="emit('navigate')"
                >
                    {{ link.label }}
                </NuxtLink>
            </template>

            <template v-if="section.groups">
                <SidebarGroup v-for="group in section.groups" :key="group.title" :title="group.title">
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
    </nav>
</template>
