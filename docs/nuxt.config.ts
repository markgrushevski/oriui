import { fileURLToPath, URL } from 'node:url';

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// oriUI is consumed exactly as `from 'oriui'`, aliased to the workspace source for live HMR
// (a real package dep arrives with the @oriui/* monorepo split). The whole docs shell uses
// --ori-color-* tokens, so the nav theme/skin toggles reskin the entire site.
export default defineNuxtConfig({
    modules: ['@nuxt/content'],
    devtools: { enabled: false },
    devServer: { port: 5173 },

    alias: {
        oriui: resolve('../src/index.ts')
    },

    css: [resolve('../src/styles/styles.css'), resolve('./app/assets/css/docs.css')],

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
                        "(function(){try{var d=document.documentElement;if(localStorage.getItem('ori-theme')==='dark')d.classList.add('dark');if(localStorage.getItem('ori-skin')==='ori')d.setAttribute('data-ori-skin','ori');}catch(e){}})();"
                }
            ]
        }
    }
});
