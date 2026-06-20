import { defineConfig } from 'tsdown';

export default defineConfig({
    // Two entries → dist/core/* (the framework-agnostic engine, the `.` export) and dist/vue/* (the
    // Vue adapter, the `./vue` export). The adapter imports the engine by a relative path, so the
    // engine is bundled into the adapter — fine, it is tiny and stateless.
    entry: ['src/core/index.ts', 'src/vue/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    // Emit .js/.d.ts (tsdown defaults to .mjs on the node platform) to match the exports map; the
    // `vue` peerDependency is auto-externalized.
    fixedExtension: false
});
