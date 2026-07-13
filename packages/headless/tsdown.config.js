import { defineConfig } from 'tsdown';

export default defineConfig({
    // Three entries → dist/core/* (the framework-agnostic engine, the `.` export), dist/vue/* (the Vue
    // adapter, the `./vue` export) and dist/svelte/* (the Svelte adapter, the `./svelte` export). Each
    // adapter imports the engine by a relative path, so the engine is bundled into it — fine, it is tiny
    // and stateless.
    entry: ['src/core/index.ts', 'src/vue/index.ts', 'src/svelte/index.ts', 'src/react/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    // Emit .js/.d.ts (tsdown defaults to .mjs on the node platform) to match the exports map; the
    // `vue` / `svelte` peerDependencies are auto-externalized.
    fixedExtension: false
});
