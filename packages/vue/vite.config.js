import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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
            // vue and the headless packages are all peers now (a duplicated @oriui/headless would break
            // the provide/inject singletons). They must stay external either way — OriDialog consumes the
            // useDialog() contract from @oriui/headless/vue at runtime, it just must not bundle a copy.
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
})
