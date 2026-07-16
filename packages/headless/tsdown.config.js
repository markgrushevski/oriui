import { defineConfig } from 'tsdown';

export default defineConfig({
    // Four entries → dist/core/* (the framework-agnostic engine, the `.` export), dist/vue/* (the Vue
    // adapter, `./vue`), dist/svelte/* (the Svelte adapter, `./svelte`) and dist/react/* (the React adapter,
    // `./react`). Each adapter imports the engine by a relative path, so the engine is bundled into it —
    // fine, it is tiny and stateless.
    entry: ['src/core/index.ts', 'src/vue/index.ts', 'src/svelte/index.ts', 'src/react/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    // Emit .js/.d.ts (tsdown defaults to .mjs on the node platform) to match the exports map; the
    // `vue` / `svelte` / `react` peerDependencies are auto-externalized.
    fixedExtension: false
});
