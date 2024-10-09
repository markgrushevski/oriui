import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

function getDirEntries(dirPath) {
    /** @type {[string, string][]} */
    const entries = [];
    for (const path of readdirSync(dirPath)) {
        if (path === 'styles') continue;
        if (path === 'types.ts') continue;

        const isFile = path.includes('.');
        const subPath = dirPath.split('/')[1] ? dirPath.split('/')[1] + '/' : '';
        const fileEntryName = path.slice(0, path.indexOf('.'));
        const dirEntryName = `${path}/index`;

        /** @type {string} */
        const entryName = subPath + (isFile ? fileEntryName : dirEntryName);
        const entryValue = (isFile ? dirPath : `${dirPath}/${path}`) + '/index.ts';

        if (entryName === 'index' || entryName === 'components/index') continue;

        entries.push([entryName, entryValue]);
    }

    entries.unshift(['index', 'lib/index.ts'], ['components/index', 'lib/components/index.ts']);

    return entries;
}

const baseEntries = getDirEntries('lib');
const componentsEntries = getDirEntries('lib/components');
const entries = [...componentsEntries, ...baseEntries];
const entriesMap = new Map(entries);
const buildLibEntry = Object.fromEntries(entriesMap);
console.log(buildLibEntry);

export default defineConfig({
    plugins: [vue(), libInjectCss()],
    preview: {},
    build: {
        sourcemap: true,
        copyPublicDir: false,
        lib: {
            formats: ['es'],
            entry: buildLibEntry
            // entry: 'lib/index.ts'
        },
        rollupOptions: {
            external: ['vue'],
            /* output: {
                preserveModules: true,
                exports: 'named',
                entryFileNames: '[name].js',
                assetFileNames: '[name].[hash][extname]',
                globals: { vue: 'Vue' }
            } */
            output: {
                preserveModules: false,
                exports: 'named',
                entryFileNames: '[name].js',
                assetFileNames: 'assets/[name][extname]',
                chunkFileNames: 'chunks/[name].[hash].js',
                globals: { vue: 'Vue' }
            }
        }
    },
    esbuild: { sourcemap: 'external' },
    css: {
        postcss: { plugins: [autoprefixer] },
        devSourcemap: true
    },
    resolve: {
        alias: {
            '@lib': fileURLToPath(new URL('./lib', import.meta.url))
        }
    }
});
