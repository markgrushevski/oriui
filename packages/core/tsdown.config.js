import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    // Emit .js/.d.ts (tsdown defaults to .mjs/.d.mts on the node platform) to match the
    // package.json exports (./dist/index.js, ./dist/index.d.ts).
    fixedExtension: false
});
