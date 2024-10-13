// import { globSync } from 'glob';
// import { relative, extname } from 'node:path';
// import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
// import { libInjectCss } from 'vite-plugin-lib-inject-css';
import autoprefixer from 'autoprefixer';

/* const entries = Object.fromEntries(
    globSync('lib/!**!/index.ts').map((file) => [
        relative('lib', file.slice(0, file.length - extname(file).length)),
        fileURLToPath(new URL(file, import.meta.url))
    ])
); */

export default defineConfig({
    plugins: [
        vue(),
        // libInjectCss(),
        dts({
            tsconfigPath: './tsconfig.json',
            staticImport: true
        })
    ],
    build: {
        sourcemap: true,
        copyPublicDir: false,
        cssCodeSplit: true,
        lib: {
            formats: ['es'],
            entry: 'lib/index.ts'
            // entry: entries
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                preserveModules: true,
                globals: { vue: 'Vue' },
                exports: 'named',
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
                banner: (chunk) => {
                    const name = chunk.fileName.split('/').at(-1);
                    if (name === 'index.js') return `import "./styles/styles.css"`;
                    else if (name.includes('.vue.js')) return `import "./${name.replace('.vue.js', '.css')}"`;
                    else return '';
                }
            }
            /* output: {
                preserveModules: false,
                globals: { vue: 'Vue' },
                exports: 'named',
                entryFileNames: '[name].js',
                assetFileNames: 'assets/[name].[ext]',
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
