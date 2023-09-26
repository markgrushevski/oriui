import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const dirEntries = readdirSync('./lib').map((path) => {
    return [path.includes('.') ? path.slice(0, path.indexOf('.')) : path, `lib/${path}`];
});

// @formatter:off
// prettier-ignore
export default defineConfig({
    plugins: [vue(), libInjectCss()],
    build: {
        sourcemap: true,
        copyPublicDir: false,
        cssCodeSplit:true,
        lib: {
            formats: ["es"],
            entry: Object.fromEntries(dirEntries)
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                preserveModules: false,
                exports: "named",
                entryFileNames: "[name].js",
                assetFileNames: "assets/[name].[hash][extname]",
                chunkFileNames: 'chunks/[name].[hash].js',
                globals: { vue: "Vue" }
            }
        }
    },
    esbuild: { sourcemap: "external" },
    css: { 
        postcss: { plugins: [autoprefixer] }, 
        devSourcemap: true 
    },
    resolve: {
        alias: {
            "@docs": fileURLToPath(new URL("./docs", import.meta.url)),
            "@lib": fileURLToPath(new URL("./lib", import.meta.url))
        }
    }
});
