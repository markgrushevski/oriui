import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

// Dedicated test config, intentionally separate from vite.config.js: the library build's
// lib/externals/preserveModules options must never leak into the test run. Here we only need
// the Vue SFC compiler + a DOM environment.
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            // Run tests against the headless packages' SOURCE (not built dist) so the suite is
            // self-sufficient — no `build:packages` prerequisite (matters for a clean CI run), and
            // it mirrors how the docs app aliases the workspace packages.
            '@oriui/vue': fileURLToPath(new URL('./packages/vue/src/index.ts', import.meta.url)),
            '@oriui/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url))
        }
    },
    test: {
        environment: 'happy-dom',
        globals: true,
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/components/**/*.vue'],
            reporter: ['text', 'html']
        }
    }
});
