<script setup lang="ts">
import { onMounted, ref } from 'vue';

const { theme, init, toggleTheme } = useOriTheme();
const { init: initFramework } = useOriFramework();

// Top-level header links → the three sections.
const nav = [
    { label: 'Guide', to: '/guide/get-started' },
    { label: 'Components', to: '/components/button' },
    { label: 'Composables', to: '/composables/use-dialog' }
];

// The navigation tree (desktop sidebar + mobile drawer share it via <NavTree>).
const sections = [
    {
        title: 'Guide',
        links: [
            { label: 'Get started', to: '/guide/get-started' },
            { label: 'Using CSS', to: '/guide/css' }
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
                    { label: 'Switch', to: '/components/switch' }
                ]
            },
            {
                title: 'Data display',
                links: [
                    { label: 'Avatar', to: '/components/avatar' },
                    { label: 'Card', to: '/components/card' },
                    { label: 'Icon', to: '/components/icon' }
                ]
            },
            {
                title: 'Feedback',
                links: [{ label: 'Spinner', to: '/components/spinner' }]
            }
        ]
    },
    {
        title: 'Composables',
        links: [
            { label: 'useDisclosure', to: '/composables/use-disclosure' },
            { label: 'useDialog', to: '/composables/use-dialog' }
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
    <div class="docs">
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
                <OriButton
                    size="sm"
                    variant="outline"
                    color="primary"
                    :text="theme === 'dark' ? '☾ Dark' : '☀ Light'"
                    @click="toggleTheme"
                />
                <span class="docs-nav__skin docs-nav__desktop"><SkinPicker /></span>
            </ClientOnly>

            <a
                class="docs-nav__gh docs-nav__desktop"
                href="https://github.com/markgrushevski/oriui"
                target="_blank"
                rel="noopener"
            >
                GitHub
            </a>
        </header>

        <div class="docs-body">
            <aside class="docs-sidebar">
                <NavTree :sections="sections" />
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

                    <div class="docs-drawer__foot">
                        <ClientOnly><SkinPicker /></ClientOnly>
                        <a href="https://github.com/markgrushevski/oriui" target="_blank" rel="noopener">GitHub</a>
                    </div>
                </aside>
            </div>
        </Teleport>
    </div>
</template>
