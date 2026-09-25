// Publish the artifact `npm run release` has just built, instead of letting all three packages rebuild
// themselves while they are packed.
//
// `changeset publish` packs every workspace in parallel, and each `prepack` rebuilds its package. Those
// builds race: `@oriui/headless` cleans its `dist`, which is where `@oriui/vue` resolves its types
// from, so vue-tsc fails and the fixed group half-publishes (that is what happened to 1.0.0-rc.18).
// `ignore-scripts` turns the rebuilds off: the `release` script has already built the graph in order,
// and the gate has measured that exact dist. `prepack` stays for RELEASING.md's manual fallback.
//
// Runs the CLI's bin.js under this node, not the `changeset.cmd` shim: Node won't spawn a `.cmd`
// without a shell.
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const cli = createRequire(import.meta.url).resolve('@changesets/cli/bin.js')

const result = spawnSync(process.execPath, [cli, 'publish', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, npm_config_ignore_scripts: 'true' }
})

if (result.error) throw result.error
process.exit(result.status ?? 1)
