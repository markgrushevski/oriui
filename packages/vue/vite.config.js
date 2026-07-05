import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// No CSS flows through this build: SFCs are script+template only, all component styles
// ship from @oriui/css (see CLAUDE.md) — so no css/postcss options and no lib-inject-css.
export default defineConfig({
    plugins: [vue()],
    build: {
        sourcemap: true,
        copyPublicDir: false,
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
    esbuild: { sourcemap: 'external' }
});
