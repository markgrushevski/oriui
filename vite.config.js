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
            external: ['vue'],
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
