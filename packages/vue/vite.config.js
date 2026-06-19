import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import autoprefixer from 'autoprefixer';

export default defineConfig({
    plugins: [vue(), libInjectCss()],
    build: {
        sourcemap: true,
        copyPublicDir: false,
        cssCodeSplit: true,
        lib: {
            formats: ['es'],
            entry: 'src/index.ts'
        },
        rollupOptions: {
            // vue is a peer; the headless packages are runtime deps (OriDialog consumes the
            // useDialog() contract from @oriui/headless/vue) and must stay external, not bundled.
            external: ['vue', '@oriui/headless/vue', '@oriui/headless'],
            output: {
                preserveModules: true,
                globals: { vue: 'Vue' },
                exports: 'named',
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            }
        }
    },
    esbuild: { sourcemap: 'external' },
    css: {
        postcss: { plugins: [autoprefixer] },
        devSourcemap: true
    }
});
