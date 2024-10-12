import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import autoprefixer from 'autoprefixer';

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

export default defineConfig({
    plugins: [vue(), dts({ tsconfigPath: './tsconfig.json', staticImport: true }), libInjectCss()],
    preview: {},
    build: {
        sourcemap: false,
        copyPublicDir: false,
        lib: {
            formats: ['es'],
            //entry: buildLibEntry
            entry: 'lib/index.ts'
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: { vue: 'Vue' },
                preserveModules: true,
                exports: 'named',
                entryFileNames: '[name].js',
                assetFileNames: '[name].[hash][extname]'
            }
            /* output: {
                globals: { vue: 'Vue' },
                preserveModules: false,
                exports: 'named',
                entryFileNames: '[name].js',
                assetFileNames: 'assets/[name][extname]',
                chunkFileNames: 'chunks/[name].[hash].js'
            } */
        }
    },
    esbuild: { sourcemap: 'external' },
    css: {
        postcss: { plugins: [autoprefixer] },
        devSourcemap: true
    }
});
