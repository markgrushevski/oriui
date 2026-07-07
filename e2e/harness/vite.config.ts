import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Minimal Vite app that mounts the real @oriui/vue components for the Playwright interaction specs.
// The @oriui/* aliases mirror vitest.config.js exactly (source, not dist) so the harness exercises the
// same code the unit suite does — subpaths (`/vue`, `/svelte`) MUST precede the bare `@oriui/headless`
// so the more specific alias wins. `@oriui/css` points at the BUILT bundle (test:e2e rebuilds it first).
export default defineConfig({
    root: fileURLToPath(new URL('.', import.meta.url)),
    resolve: {
        alias: {
            '@oriui/headless/vue': fileURLToPath(new URL('../../packages/headless/src/vue/index.ts', import.meta.url)),
            '@oriui/headless/svelte': fileURLToPath(
                new URL('../../packages/headless/src/svelte/index.ts', import.meta.url)
            ),
            '@oriui/headless': fileURLToPath(new URL('../../packages/headless/src/core/index.ts', import.meta.url)),
            '@oriui/vue': fileURLToPath(new URL('../../packages/vue/src/index.ts', import.meta.url)),
            '@oriui/css': fileURLToPath(new URL('../../packages/css/dist/styles.css', import.meta.url))
        }
    },
    plugins: [vue()]
});
