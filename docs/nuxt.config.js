import { fileURLToPath, URL } from 'node:url'

const resolve = (path) => fileURLToPath(new URL(path, import.meta.url))

// oriUI is consumed as `from '@oriui/vue'` (components) and `@oriui/headless/vue` (composables),
// aliased to the workspace source for live HMR. The whole docs shell uses
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

    // Machine-readable docs for AI consumers: /llms.txt (the index) and /llms-full.txt (every page
    // concatenated, both emitted by @nuxt/content's llms plugin through nuxt-llms). `domain` is used
    // for the absolute links; the docs are hosted at this URL (Vercel deploy of `main`).
    llms: {
        domain: 'https://oriui.vercel.app',
        title: 'oriUI',
        description:
            'A layered Vue 3 UI library: styled components (@oriui/vue), a headless behavior layer (@oriui/headless, with @oriui/headless/vue bindings), and a standalone, framework-free CSS layer (@oriui/css) woven around shared design tokens. Single-class token utilities, zero-runtime theming.',
        full: {
            title: 'oriUI — full documentation',
            description: 'Every oriUI documentation page concatenated, for single-fetch consumption.'
        },
        // `/raw/**.md` is @nuxt/content's raw-markdown endpoint, layered on top of nuxt-llms. It ships
        // ON by default and rewrites every link below to `<domain>/raw/<page>.md`, so those URLs are a
        // public agent surface — stated here so the commitment is a line of project config instead of an
        // inherited node_modules default. `false` drops the endpoint AND the rewrite (links then point
        // at the HTML pages); `{ rewriteLLMSTxt: false }` keeps the endpoint but stops advertising it.
        contentRawMarkdown: { rewriteLLMSTxt: true, excludeCollections: [] },

        // Sections are QUERIES, not hand-written link lists. @nuxt/content appends an auto-generated
        // section whenever NO section declares a `contentCollection`, so a hand-authored list shipped
        // every page twice — once by hand without a description, once generated with one. Filtering the
        // `docs` collection by path keeps the four groups, drops the duplication, and removes the
        // 34-entry component list that was a registry to hand-maintain: a new page joins its section by
        // existing. Order inside a group is by path (alphabetical), not curated.
        sections: [
            {
                title: 'Overview',
                description: 'What oriUI is, how to install it, get started, and the accessibility contract.',
                contentCollection: 'docs',
                contentFilters: [{ field: 'path', operator: 'LIKE', value: '/overview/%' }]
            },
            {
                title: 'Guides',
                description: 'The standalone CSS layer, design tokens, theming, customization, and writing direction.',
                contentCollection: 'docs',
                contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/%' }]
            },
            {
                title: 'Components',
                description: 'The 34 styled components — each page has the class table, props, slots, and a11y.',
                contentCollection: 'docs',
                contentFilters: [{ field: 'path', operator: 'LIKE', value: '/components/%' }]
            },
            {
                title: 'Headless',
                description: 'The framework-agnostic behavior contract and its Vue / Svelte / React bindings.',
                contentCollection: 'docs',
                contentFilters: [{ field: 'path', operator: 'LIKE', value: '/headless/%' }]
            }
        ]
    },

    alias: {
        '@oriui/headless/vue': resolve('../packages/headless/src/vue/index.ts'),
        '@oriui/headless': resolve('../packages/headless/src/core/index.ts'),
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
})
