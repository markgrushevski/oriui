<script setup lang="ts">
// The docs navigation tree, reused by the desktop sidebar and the mobile drawer.
// Each section (Guide / Components / Composables) is a collapsible <NavSection>.
interface NavLink {
    label: string;
    to: string;
}
interface NavGroup {
    title: string;
    links: NavLink[];
}
interface NavSectionItem {
    title: string;
    links?: NavLink[];
    groups?: NavGroup[];
}

defineProps<{ sections: NavSectionItem[] }>();
const emit = defineEmits<{ navigate: [] }>();
</script>

<template>
    <nav class="docs-navtree">
        <NavSection
            v-for="section in sections"
            :key="section.title"
            :title="section.title"
            :links="section.links"
            :groups="section.groups"
            @navigate="emit('navigate')"
        />
    </nav>
</template>
