// Publish the artifact `npm run release` has just built, instead of letting all three packages rebuild
// themselves while they are packed.
//
// `changeset publish` packs every workspace in PARALLEL, and each one's `prepack` runs its own build
// (ORI-I-39). Those builds are not independent: `@oriui/headless` builds with tsdown's `clean: true`,
// so it empties `packages/headless/dist` — which is exactly where `@oriui/vue`'s `tsconfig.build.json`
// resolves `@oriui/headless` types from (`"paths": {}`, deliberately: declaration emit reads dist).
// When the two packs overlap, vue-tsc raises TS2307 on every headless import and exits 2, npm buries
// that output in its debug log and reports a bare `code 2`, and the fixed group half-publishes. That is
// what happened to 1.0.0-rc.18 — see ISSUES-INNER ORI-I-83.
//
// `ignore-scripts` turns those rebuilds off for the packs changesets performs. Nothing stale can slip
// through: the `release` script builds the graph in dependency order first, and the gate ahead of it
// built, weighed (size-limit), statically checked (publint/attw) and smoke-installed that same dist —
// so this publishes the exact artifact the gate measured, which is the trade the smoke leg already
// makes with ORI_SMOKE_IGNORE_SCRIPTS. `prepack` stays in place for RELEASING.md's manual fallback,
// where packages are packed one at a time and nothing races.
//
// Run the CLI's own bin.js under this node rather than the `changeset` / `changeset.cmd` shim: Node
// refuses to spawn a `.cmd` without `shell: true`, and a shell would need every path re-quoted — the
// same reasoning as scripts/smoke-pack.mjs.
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const cli = createRequire(import.meta.url).resolve('@changesets/cli/bin.js')

const result = spawnSync(process.execPath, [cli, 'publish', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, npm_config_ignore_scripts: 'true' }
})

if (result.error) throw result.error
process.exit(result.status ?? 1)
