<script setup lang="ts">
import { onMounted } from 'vue';

const { theme, skin, init, toggleTheme, toggleSkin } = useOriTheme();

const nav = [
    { label: 'Home', to: '/' },
    { label: 'Components', to: '/components/button' },
    { label: 'Get started', to: '/guide/get-started' }
];

const sidebar = [
    { title: 'Guide', links: [{ label: 'Get started', to: '/guide/get-started' }] },
    {
        title: 'Components',
        links: [
            { label: 'Avatar', to: '/components/avatar' },
            { label: 'Button', to: '/components/button' },
            { label: 'Card', to: '/components/card' },
            { label: 'Dialog', to: '/components/dialog' },
            { label: 'Icon', to: '/components/icon' },
            { label: 'Spinner', to: '/components/spinner' }
        ]
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

            <ClientOnly>
                <OriButton
                    size="sm"
                    variant="outline"
                    color="primary"
                    :text="theme === 'dark' ? '☾ Dark' : '☀ Light'"
                    @click="toggleTheme"
                />
                <OriButton size="sm" variant="outline" color="primary" :text="`skin: ${skin}`" @click="toggleSkin" />
            </ClientOnly>

            <a class="docs-nav__gh" href="https://github.com/markgrushevski/vueinjar" target="_blank" rel="noopener">
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
