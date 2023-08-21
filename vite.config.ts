import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
// @formatter:off
// prettier-ignore
export default defineConfig({
    plugins: [ vue() ],
    build: { 
        sourcemap: true,
        lib: { entry: resolve(__dirname, 'components/index.ts'), fileName: 'index', formats: ['es', 'cjs'] },
        rollupOptions: { external: ['vue'], output: { globals: { vue: 'Vue' } } }
    },
    esbuild: { sourcemap: 'external' },
    css: { postcss: { plugins: [ autoprefixer ] }, devSourcemap: true }
});
