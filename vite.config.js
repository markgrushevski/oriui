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
const libEntries = Object.fromEntries(entriesMap);

export default defineConfig({
    plugins: [
        vue(),
        dts({
            tsconfigPath: './tsconfig.json',
            staticImport: true
        })
        /* libInjectCss() */
    ],
    build: {
        sourcemap: true,
        copyPublicDir: false,
        cssCodeSplit: true,
        lib: {
            formats: ['es'],
            // entry: libEntries
            entry: 'lib/index.ts'
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: { vue: 'Vue' },
                preserveModules: true,
                exports: 'named',
                entryFileNames: '[name].js',
                assetFileNames: '[name][extname]',
                banner: (chunk) => {
                    const name = chunk.fileName.split('/').at(-1);
                    if (name === 'index.js') return `import "./styles/styles.css"`;
                    else if (name.includes('.vue.js')) return `import "./${name.replace('.vue.js', '.css')}"`;
                    else return '';
                }
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
