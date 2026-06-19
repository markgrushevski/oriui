import { fileURLToPath, URL } from 'node:url';

const resolve = (path) => fileURLToPath(new URL(path, import.meta.url));

// oriUI is consumed exactly as `from '@oriui/ui'`, aliased to the workspace source for live HMR
// (a real package dep arrives with the @oriui/* monorepo split). The whole docs shell uses
// --ori-color-* tokens, so the nav theme/skin toggles reskin the entire site.
export default defineNuxtConfig({
    modules: ['@nuxt/content', 'nuxt-llms'],
    devtools: { enabled: false },
    devServer: { port: 5173 },

    // On Vercel, Nitro auto-detects the env (VERCEL=1) and switches to the `vercel-static`
    // preset, emitting the Build Output API to `.vercel/output` instead of `.output/public`.
    // That mismatches vercel.json (`outputDirectory: docs/.output/public`), so deploys fail with
    // "No Output Directory named 'public' found". Pin the plain `static` preset so `nuxi generate`
    // always writes to docs/.output/public, where vercel.json serves it from.
    nitro: { preset: 'static' },

    // Machine-readable docs for AI consumers: /llms.txt (a curated index) and /llms-full.txt (every
    // page concatenated, populated by the server/plugins/llms-full hook). `domain` is used for the
    // absolute links in llms.txt — update it to the real deploy URL when the docs are hosted.
    llms: {
        domain: 'https://oriui.vercel.app',
        title: 'oriUI',
        description:
            'A layered Vue 3 UI library: styled components (@oriui/ui), headless composables (@oriui/vue), and a standalone, framework-free CSS layer (@oriui/css) woven around shared design tokens. Single-class token utilities, zero-runtime theming.',
        full: {
            title: 'oriUI — full documentation',
            description: 'Every oriUI documentation page concatenated, for single-fetch consumption.'
        },
        sections: [
            {
                title: 'Overview',
                description: 'What oriUI is, how to install it, get started, and the accessibility contract.',
                links: [
                    { title: 'Introduction', href: '/overview/introduction' },
                    { title: 'Installation', href: '/overview/installation' },
                    { title: 'Get started', href: '/overview/get-started' },
                    { title: 'Cheat sheet', href: '/overview/cheat-sheet' },
                    { title: 'Accessibility', href: '/overview/accessibility' }
                ]
            },
            {
                title: 'Guides',
                description: 'The standalone CSS layer, design tokens, theming, and customization.',
                links: [
                    { title: 'Using the CSS layer', href: '/guides/css' },
                    { title: 'Design tokens', href: '/guides/design-tokens' },
                    { title: 'Theming', href: '/guides/theming' },
                    { title: 'Customization', href: '/guides/customization' }
                ]
            },
            {
                title: 'Components',
                description: 'The 27 styled components — each page has the class table, props, slots, and a11y.',
                links: [
                    { title: 'Accordion', href: '/components/accordion' },
                    { title: 'Alert', href: '/components/alert' },
                    { title: 'Avatar', href: '/components/avatar' },
                    { title: 'Badge', href: '/components/badge' },
                    { title: 'Button', href: '/components/button' },
                    { title: 'Card', href: '/components/card' },
                    { title: 'Checkbox', href: '/components/checkbox' },
                    { title: 'Dialog', href: '/components/dialog' },
                    { title: 'Divider', href: '/components/divider' },
                    { title: 'Icon', href: '/components/icon' },
                    { title: 'Input', href: '/components/input' },
                    { title: 'Join', href: '/components/join' },
                    { title: 'Kbd', href: '/components/kbd' },
                    { title: 'Link', href: '/components/link' },
                    { title: 'Progress', href: '/components/progress' },
                    { title: 'Radio', href: '/components/radio' },
                    { title: 'Select', href: '/components/select' },
                    { title: 'Skeleton', href: '/components/skeleton' },
                    { title: 'Slider', href: '/components/slider' },
                    { title: 'Spinner', href: '/components/spinner' },
                    { title: 'Stack', href: '/components/stack' },
                    { title: 'Switch', href: '/components/switch' },
                    { title: 'Tabs', href: '/components/tabs' },
                    { title: 'Tag', href: '/components/tag' },
                    { title: 'Textarea', href: '/components/textarea' },
                    { title: 'Toast', href: '/components/toast' },
                    { title: 'Tooltip', href: '/components/tooltip' }
                ]
            },
            {
                title: 'Headless',
                description: 'The framework-agnostic behavior contract and the Vue composables.',
                links: [
                    { title: 'Core (@oriui/core)', href: '/headless/core' },
                    { title: 'useDisclosure', href: '/headless/use-disclosure' },
                    { title: 'useDialog', href: '/headless/use-dialog' }
                ]
            }
        ]
    },

    alias: {
        '@oriui/ui': resolve('../src/index.ts'),
        '@oriui/core': resolve('../packages/core/src/index.ts'),
        '@oriui/vue': resolve('../packages/vue/src/index.ts')
    },

    css: [resolve('../packages/css/src/styles.css'), resolve('./app/assets/css/docs.css')],

    vite: {
        resolve: {
            dedupe: ['vue']
        }
    },

    app: {
        head: {
            htmlAttrs: { lang: 'en' },
            title: 'oriUI',
            link: [{ rel: 'icon', href: '/favicon.ico' }],
            // Apply saved theme/skin before paint to avoid a flash.
            script: [
                {
                    tagPosition: 'head',
                    innerHTML:
                        "(function(){try{var d=document.documentElement;if(localStorage.getItem('ori-theme')==='dark')d.classList.add('dark');var s=localStorage.getItem('ori-skin');if(s&&s!=='ori')d.setAttribute('data-ori-skin',s);}catch(e){}})();"
                }
            ]
        }
    }
});
