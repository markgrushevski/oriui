import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitepress';

const base = process.env.NODE_ENV === 'production' ? '/' : '/docs/';

export default defineConfig({
    base,
    vite: {
        resolve: {
            alias: {
                '@lib': fileURLToPath(new URL('../../lib', import.meta.url))
            }
        }
    },
    title: 'VueInJar',
    description: 'Component & helpers library📚',
    head: [['link', { rel: 'icon', href: `${base}favicon.ico` }]],
    markdown: {
        theme: { dark: 'vesper', light: 'rose-pine-dawn' }
    },
    themeConfig: {
        logo: '/vueinjar.svg',
        nav: [
            { text: 'Home', link: '/' },
            {
                text: 'Guide',
                items: [{ text: 'Get started', link: '/guide/get-started' }]
            }
        ],
        sidebar: [
            {
                text: 'Guide',
                base: '/guide',
                items: [{ text: 'Get started', link: '/get-started' }]
            },
            {
                text: 'Components',
                base: '/components',
                items: [
                    { text: 'Avatar', link: '/avatar' },
                    { text: 'Button', link: '/button' },
                    { text: 'Card', link: '/card' },
                    { text: 'Icon', link: '/icon' }
                ]
            }
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/markgrushevski/vueinjar' }]
    }
});
