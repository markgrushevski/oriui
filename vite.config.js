import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

function getDirEntries(dirPath) {
    return readdirSync(dirPath)
        .map((path) => {
            if (path === 'styles') return;

            const isFile = path.includes('.');
            const subPath = dirPath.split('/')[1] ? dirPath.split('/')[1] + '/' : '';
            const fileEntryName = path.slice(0, path.indexOf('.'));
            const dirEntryName = `${path}/index`;

            const entryName = subPath + (isFile ? fileEntryName : dirEntryName);
            const entryValue = (isFile ? dirPath : `${dirPath}/${path}`) + '/index.ts';
            return [entryName, entryValue];
        })
        .filter((val) => !!val);
}

const baseEntries = getDirEntries('lib');
const componentsEntries = getDirEntries('lib/components');
const entries = new Map([...componentsEntries, ...baseEntries]);

const buildLibEntry = Object.fromEntries(entries);

export default defineConfig({
    plugins: [vue(), libInjectCss()],
    preview: {},
    build: {
        sourcemap: true,
        copyPublicDir: false,
        cssCodeSplit: true,
        lib: {
            formats: ['es'],
            entry: buildLibEntry
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                preserveModules: false,
                exports: 'named',
                entryFileNames: '[name].js',
                assetFileNames: 'assets/[name].[hash][extname]',
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
