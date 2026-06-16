import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitepress';

const base = '/';

export default defineConfig({
    base,
    vite: {
        resolve: {
            alias: {
                '@lib': fileURLToPath(new URL('../../src', import.meta.url))
            }
        }
    },
    title: 'oriUI',
    description: 'Layered Vue 3 UI library (織り)',
    head: [
        ['link', { rel: 'icon', href: `${base}favicon.ico` }],
        ['script', {}, 'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };'],
        ['script', { defer: '', src: '/_vercel/insights/script.js' }],
        ['script', {}, 'window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };'],
        ['script', { defer: '', src: '/_vercel/speed-insights/script.js' }]
    ],
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
            },
            { text: 'Playground', link: '/playground' }
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
                    { text: 'Icon', link: '/icon' },
                    { text: 'Spinner', link: '/spinner' }
                ]
            },
            {
                text: 'Showcase',
                items: [{ text: 'Playground', link: '/playground' }]
            }
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/markgrushevski/vueinjar' }]
    }
});
