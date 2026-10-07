import { defineConfig } from 'tsdown'

export default defineConfig({
    // Two entries → dist/core/* (the framework-agnostic engine, the `.` export) and dist/vue/* (the Vue
    // adapter, `./vue`), which imports the engine by a relative path and so bundles it — fine, it is tiny
    // and stateless. src/svelte and src/react are not built: they are not part of 1.0.
    entry: ['src/core/index.ts', 'src/vue/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    // Emit .js/.d.ts (tsdown defaults to .mjs on the node platform) to match the exports map; the
    // `vue` peerDependency is auto-externalized.
    fixedExtension: false
})
