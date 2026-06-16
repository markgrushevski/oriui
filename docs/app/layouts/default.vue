<script setup lang="ts">
import { onMounted } from 'vue';

const { theme, init, toggleTheme } = useOriTheme();

const nav = [
    { label: 'Home', to: '/' },
    { label: 'Components', to: '/components/button' },
    { label: 'Get started', to: '/guide/get-started' }
];

const sidebar = [
    {
        title: 'Guide',
        links: [
            { label: 'Get started', to: '/guide/get-started' },
            { label: 'Using CSS', to: '/guide/css' }
        ]
    },
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
];

const { init: initFramework } = useOriFramework();

onMounted(() => {
    init();
    initFramework();
});
</script>

<template>
    <div class="docs">
        <header class="docs-nav">
            <NuxtLink to="/" class="docs-brand">oriUI</NuxtLink>

            <nav class="docs-nav__links">
                <NuxtLink v-for="item in nav" :key="item.to" :to="item.to">{{ item.label }}</NuxtLink>
            </nav>

            <span class="docs-nav__spacer" />

            <CommandPalette />

            <ClientOnly>
                <OriButton
                    size="sm"
                    variant="outline"
                    color="primary"
                    :text="theme === 'dark' ? '☾ Dark' : '☀ Light'"
                    @click="toggleTheme"
                />
                <SkinPicker />
            </ClientOnly>

            <a class="docs-nav__gh" href="https://github.com/markgrushevski/oriui" target="_blank" rel="noopener">
                GitHub
            </a>
        </header>

        <div class="docs-body">
            <aside class="docs-sidebar">
                <SidebarGroup v-for="group in sidebar" :key="group.title" :title="group.title">
                    <NuxtLink v-for="link in group.links" :key="link.to" :to="link.to" class="docs-sidebar__link">
                        {{ link.label }}
                    </NuxtLink>
                </SidebarGroup>
            </aside>

            <main class="docs-main">
                <slot />
            </main>
        </div>
    </div>
</template>
