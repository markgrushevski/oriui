import { fileURLToPath, URL } from 'node:url';

const resolve = (path) => fileURLToPath(new URL(path, import.meta.url));

// oriUI is consumed exactly as `from '@oriui/ui'`, aliased to the workspace source for live HMR
// (a real package dep arrives with the @oriui/* monorepo split). The whole docs shell uses
// --ori-color-* tokens, so the nav theme/skin toggles reskin the entire site.
export default defineNuxtConfig({
    modules: ['@nuxt/content'],
    devtools: { enabled: false },
    devServer: { port: 5173 },

    // On Vercel, Nitro auto-detects the env (VERCEL=1) and switches to the `vercel-static`
    // preset, emitting the Build Output API to `.vercel/output` instead of `.output/public`.
    // That mismatches vercel.json (`outputDirectory: docs/.output/public`), so deploys fail with
    // "No Output Directory named 'public' found". Pin the plain `static` preset so `nuxi generate`
    // always writes to docs/.output/public, where vercel.json serves it from.
    nitro: { preset: 'static' },

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
