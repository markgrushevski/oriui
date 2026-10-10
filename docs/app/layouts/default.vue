<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const { init } = useOriTheme()
const { init: initFramework } = useOriFramework()

// The home page is a landing: no sidebar, nav behind the burger, full-bleed hero.
const route = useRoute()
const isHome = computed(() => route.path === '/')

// Top-level header links → the three sections.
const nav = [
    { label: 'Overview', to: '/overview/introduction' },
    { label: 'Guides', to: '/guides/design-tokens' },
    { label: 'Components', to: '/components/button' },
    { label: 'Headless', to: '/headless/core' }
]

// The navigation tree (desktop sidebar + mobile drawer share it via <NavTree>).
const sections = [
    {
        title: 'Overview',
        links: [
            { label: 'Introduction', to: '/overview/introduction' },
            { label: 'Applicability', to: '/overview/applicability' },
            { label: 'Comparisons', to: '/overview/comparisons' },
            { label: 'Get started', to: '/overview/get-started' },
            { label: 'Cheat sheet', to: '/overview/cheat-sheet' },
            { label: 'Installation', to: '/overview/installation' },
            { label: 'Accessibility', to: '/overview/accessibility' },
            { label: 'Showcase', to: '/overview/showcase' }
        ]
    },
    {
        title: 'Guides',
        links: [
            { label: 'Design tokens', to: '/guides/design-tokens' },
            { label: 'Theming', to: '/guides/theming' },
            { label: 'Skin gallery', to: '/guides/skins' },
            { label: 'Customization', to: '/guides/customization' },
            { label: 'Using the CSS layer', to: '/guides/css' },
            { label: 'Writing direction (RTL)', to: '/guides/rtl' }
        ]
    },
    {
        title: 'Components',
        groups: [
            {
                title: 'Actions',
                links: [
                    { label: 'Button', to: '/components/button' },
                    { label: 'Dialog', to: '/components/dialog' },
                    { label: 'Drawer', to: '/components/drawer' },
                    { label: 'Menu', to: '/components/menu' },
                    { label: 'Popover', to: '/components/popover' },
                    { label: 'Toolbar', to: '/components/toolbar' }
                ]
            },
            {
                title: 'Data input',
                links: [
                    { label: 'Checkbox', to: '/components/checkbox' },
                    { label: 'Color picker', to: '/components/color-picker' },
                    { label: 'Combobox', to: '/components/combobox' },
                    { label: 'Field', to: '/components/field' },
                    { label: 'Input', to: '/components/input' },
                    { label: 'Radio', to: '/components/radio' },
                    { label: 'Segmented control', to: '/components/segmented-control' },
                    { label: 'Select', to: '/components/select' },
                    { label: 'Slider', to: '/components/slider' },
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
                    { label: 'Kbd', to: '/components/kbd' },
                    { label: 'List', to: '/components/list' },
                    { label: 'Table', to: '/components/table' },
                    { label: 'Tag', to: '/components/tag' }
                ]
            },
            {
                title: 'Layout',
                links: [
                    { label: 'Divider', to: '/components/divider' },
                    { label: 'Join', to: '/components/join' },
                    { label: 'Stack', to: '/components/stack' },
                    { label: 'Surface', to: '/components/surface' }
                ]
            },
            {
                title: 'Feedback',
                links: [
                    { label: 'Alert', to: '/components/alert' },
                    { label: 'Progress', to: '/components/progress' },
                    { label: 'Skeleton', to: '/components/skeleton' },
                    { label: 'Spinner', to: '/components/spinner' },
                    { label: 'Toast', to: '/components/toast' },
                    { label: 'Tooltip', to: '/components/tooltip' }
                ]
            },
            {
                title: 'Navigation',
                links: [
                    { label: 'Link', to: '/components/link' },
                    { label: 'Tabs', to: '/components/tabs' }
                ]
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
                    { label: 'useDialog', to: '/headless/use-dialog' },
                    { label: 'useCombobox', to: '/headless/use-combobox' },
                    { label: 'useMenu', to: '/headless/use-menu' },
                    { label: 'useToolbar', to: '/headless/use-toolbar' },
                    { label: 'useTabs', to: '/headless/use-tabs' },
                    { label: 'useToast', to: '/headless/use-toast' },
                    { label: 'useDismissable', to: '/headless/use-dismissable' },
                    { label: 'useColorPicker', to: '/headless/use-color-picker' },
                    { label: 'useToken', to: '/headless/use-token' },
                    { label: 'useTheme', to: '/headless/use-theme' }
                ]
            }
        ]
    }
]

const drawerOpen = ref(false)

onMounted(() => {
    init()
    initFramework()
})
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

        <OriDrawer v-model:open="drawerOpen" side="start" class="docs-drawer">
            <template #title>
                <NuxtLink to="/" class="docs-brand" @click="drawerOpen = false">oriUI</NuxtLink>
            </template>
            <NavTree :sections="sections" @navigate="drawerOpen = false" />
            <NavSocial />
        </OriDrawer>

        <OriToaster />
    </div>
</template>
