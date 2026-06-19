<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const { init } = useOriTheme();
const { init: initFramework } = useOriFramework();

// The home page is a landing: no sidebar, nav behind the burger, full-bleed hero.
const route = useRoute();
const isHome = computed(() => route.path === '/');

// Top-level header links → the three sections.
const nav = [
    { label: 'Overview', to: '/overview/introduction' },
    { label: 'Guides', to: '/guides/design-tokens' },
    { label: 'Components', to: '/components/button' },
    { label: 'Headless', to: '/headless/core' }
];

// The navigation tree (desktop sidebar + mobile drawer share it via <NavTree>).
const sections = [
    {
        title: 'Overview',
        links: [
            { label: 'Introduction', to: '/overview/introduction' },
            { label: 'Get started', to: '/overview/get-started' },
            { label: 'Installation', to: '/overview/installation' },
            { label: 'Accessibility', to: '/overview/accessibility' }
        ]
    },
    {
        title: 'Guides',
        links: [
            { label: 'Design tokens', to: '/guides/design-tokens' },
            { label: 'Theming', to: '/guides/theming' },
            { label: 'Customization', to: '/guides/customization' },
            { label: 'Using the CSS layer', to: '/guides/css' }
        ]
    },
    {
        title: 'Components',
        groups: [
            {
                title: 'Actions',
                links: [
                    { label: 'Button', to: '/components/button' },
                    { label: 'Dialog', to: '/components/dialog' }
                ]
            },
            {
                title: 'Data input',
                links: [
                    { label: 'Checkbox', to: '/components/checkbox' },
                    { label: 'Input', to: '/components/input' },
                    { label: 'Radio', to: '/components/radio' },
                    { label: 'Select', to: '/components/select' },
                    { label: 'Switch', to: '/components/switch' },
                    { label: 'Textarea', to: '/components/textarea' }
                ]
            },
            {
                title: 'Data display',
                links: [
                    { label: 'Accordion', to: '/components/accordion' },
                    { label: 'Avatar', to: '/components/avatar' },
                    { label: 'Badge', to: '/components/badge' },
                    { label: 'Card', to: '/components/card' },
                    { label: 'Icon', to: '/components/icon' },
                    { label: 'Tag', to: '/components/tag' }
                ]
            },
            {
                title: 'Feedback',
                links: [
                    { label: 'Alert', to: '/components/alert' },
                    { label: 'Progress', to: '/components/progress' },
                    { label: 'Spinner', to: '/components/spinner' },
                    { label: 'Tooltip', to: '/components/tooltip' }
                ]
            },
            {
                title: 'Navigation',
                links: [{ label: 'Tabs', to: '/components/tabs' }]
            }
        ]
    },
    {
        title: 'Headless',
        groups: [
            {
                title: 'Core',
                links: [{ label: 'Overview', to: '/headless/core' }]
            },
            {
                title: 'Vue',
                links: [
                    { label: 'useDisclosure', to: '/headless/use-disclosure' },
                    { label: 'useDialog', to: '/headless/use-dialog' }
                ]
            }
        ]
    }
];

const drawerOpen = ref(false);

onMounted(() => {
    init();
    initFramework();
});
</script>

<template>
    <div class="docs" :class="{ 'docs--home': isHome }">
        <header class="docs-nav">
            <button
                class="docs-nav__burger"
                aria-label="Open navigation"
                :aria-expanded="drawerOpen"
                @click="drawerOpen = true"
            >
                ☰
            </button>

            <NuxtLink to="/" class="docs-brand">oriUI</NuxtLink>

            <nav class="docs-nav__links docs-nav__desktop">
                <NuxtLink v-for="item in nav" :key="item.to" :to="item.to">{{ item.label }}</NuxtLink>
            </nav>

            <span class="docs-nav__spacer" />

            <span class="docs-nav__search docs-nav__desktop"><CommandPalette /></span>

            <ClientOnly>
                <span class="docs-nav__skin"><SkinPicker /></span>
            </ClientOnly>

            <button
                class="docs-nav__lang"
                type="button"
                aria-label="Change language"
                title="Language — coming soon"
                disabled
            >
                <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18" />
                    <path d="M12 3c2.6 2.9 2.6 15.1 0 18M12 3c-2.6 2.9-2.6 15.1 0 18" />
                </svg>
            </button>
        </header>

        <div class="docs-body">
            <aside class="docs-sidebar">
                <NavTree :sections="sections" />
                <NavSocial />
            </aside>

            <main class="docs-main">
                <slot />
            </main>
        </div>

        <Teleport to="body">
            <div v-if="drawerOpen" class="docs-drawer-overlay" @click="drawerOpen = false">
                <aside class="docs-drawer" @click.stop>
                    <div class="docs-drawer__head">
                        <NuxtLink to="/" class="docs-brand" @click="drawerOpen = false">oriUI</NuxtLink>
                        <button class="docs-drawer__close" aria-label="Close navigation" @click="drawerOpen = false">
                            ×
                        </button>
                    </div>

                    <NavTree :sections="sections" @navigate="drawerOpen = false" />
                    <NavSocial />
                </aside>
            </div>
        </Teleport>
    </div>
</template>
