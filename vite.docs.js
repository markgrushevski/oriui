import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// @formatter:off
// prettier-ignore
export default defineConfig({
    plugins: [vue()],
    build: { sourcemap: true, outDir: 'dist-docs' },
    esbuild: { sourcemap: 'external' },
    css: {
        postcss: { plugins: [autoprefixer] },
        devSourcemap: true
    },
    resolve: {
        alias: {
            '@docs': fileURLToPath(new URL('./docs', import.meta.url)),
            '@lib': fileURLToPath(new URL('./lib', import.meta.url))
        }
    }
});
