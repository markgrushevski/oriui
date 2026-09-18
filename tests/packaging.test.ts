import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * Published-tarball guard for the three packages. npm builds a tarball from `files` PLUS a small
 * always-included set — `package.json`, `README*`, `LICENSE`/`LICENCE`, and the `main` entry.
 * `CHANGELOG.md` is NOT in that set. Two consequences this file pins down:
 *
 *  - a LICENSE has to physically sit in the package directory (no `files` entry needed, npm adds it)
 *    or the declared `"license": "MIT"` is a claim with no text behind it in the tarball;
 *  - `CHANGELOG.md` has to be listed in `files` or the changelog changesets generates never ships.
 *
 * It also pins the deliberate asymmetry in what each package ships as source: @oriui/vue and
 * @oriui/headless ship `src` because their dist `.js.map`/`.d.ts.map` point at `../src/…`
 * (go-to-definition, see .changeset/ship-sources.md); @oriui/css emits no maps and every export
 * resolves inside `dist`, so its `src` would be dead weight a consumer can't reach.
 *
 * Manifest-level, like css.entries.test.ts: no build and no network required.
 */

const root = process.cwd()
const PACKAGES = ['vue', 'headless', 'css']

const pkgPath = (dir: string, file: string) => resolve(root, 'packages', dir, file)
const manifest = (dir: string) => JSON.parse(readFileSync(pkgPath(dir, 'package.json'), 'utf8'))
const rootManifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const LOCKSTEP = manifest('vue').version

describe('published package manifests', () => {
    const rootLicense = readFileSync(resolve(root, 'LICENSE'), 'utf8')

    it.each(PACKAGES)('@oriui/%s ships the MIT license it declares', (dir) => {
        expect(manifest(dir).license).toBe('MIT')
        expect(existsSync(pkgPath(dir, 'LICENSE')), `packages/${dir}/LICENSE is missing`).toBe(true)
        expect(readFileSync(pkgPath(dir, 'LICENSE'), 'utf8'), `packages/${dir}/LICENSE drifted from the root one`).toBe(
            rootLicense
        )
    })

    it.each(PACKAGES)('@oriui/%s lists CHANGELOG.md in files (npm never adds it for you)', (dir) => {
        expect(existsSync(pkgPath(dir, 'CHANGELOG.md'))).toBe(true)
        expect(manifest(dir).files).toContain('CHANGELOG.md')
    })

    it.each(['vue', 'headless'])('@oriui/%s ships src — its dist source maps resolve into it', (dir) => {
        expect(manifest(dir).files).toContain('src')
    })

    it('@oriui/css ships dist only — nothing it publishes can reach src', () => {
        const { files, style, exports } = manifest('css')
        expect(files).not.toContain('src')

        // The narrowing is only safe while every consumable path stays inside dist.
        const targets = [style, ...Object.values(exports as Record<string, string>)].filter(
            (target) => target !== './package.json'
        )
        for (const target of targets) {
            expect(target.startsWith('./dist/'), `@oriui/css exports ${target}, which is outside dist`).toBe(true)
        }
    })
})

/**
 * `dist` is gitignored and untracked, so nothing in a fresh checkout puts a build inside a tarball
 * except the root `release` script. `prepack` runs for BOTH `npm pack` and `npm publish`, which makes
 * the build unskippable whichever command anyone types — including RELEASING.md's manual fallback,
 * which could otherwise publish an empty package (ORI-I-39).
 */
describe('every package rebuilds before it is packed', () => {
    it.each(PACKAGES)('@oriui/%s runs its build on prepack', (dir) => {
        expect(manifest(dir).scripts?.prepack).toBe('npm run build')
        expect(manifest(dir).scripts?.build, 'prepack points at a build script that does not exist').toBeTruthy()
    })
})

/**
 * The Node floor a package PUBLISHES is a claim about running its code. The root's floor is a claim
 * about building this repo (tsdown wants ^22.18) and has no business being copied into a tarball —
 * that is exactly what @oriui/vue did (ORI-I-34). The rule these tests pin: a package that ships
 * executable JS declares the supported Node line and nothing finer; @oriui/css ships stylesheets and
 * declares nothing, because there is no runtime to have a requirement.
 */
describe('published Node engine floors', () => {
    it.each(['vue', 'headless'])('@oriui/%s declares the supported Node line as a bare major', (dir) => {
        expect(manifest(dir).engines?.node).toBe('>=22')
    })

    it('@oriui/css declares no engines — it has no runtime', () => {
        expect(manifest('css').engines).toBeUndefined()
    })

    it('no published package copies the root build-toolchain floor', () => {
        expect(rootManifest.engines.node, 'the root still declares the build floor').toMatch(/^>=\d+\.\d+/)
        for (const dir of PACKAGES) {
            expect(manifest(dir).engines?.node, `@oriui/${dir} republishes the build floor`).not.toBe(
                rootManifest.engines.node
            )
        }
    })
})

/**
 * What @oriui/vue declares about its two siblings, and why the two relationships land on the same
 * mechanism for different reasons (ORI-I-33 / ORI-I-42):
 *
 *  - `@oriui/headless` IS imported at runtime and holds process-wide singletons (module-scope
 *    `Symbol()` injection keys, the toolbar/toast registries). A second copy is not wasteful, it is
 *    BROKEN — the injection silently misses.
 *  - `@oriui/css` is never imported by any file in @oriui/vue; the app imports the stylesheet itself.
 *    An exact `dependencies` entry therefore cannot enforce the version match it appears to promise.
 *
 * As `dependencies`, a mismatch nests a second copy and npm says nothing (measured against the
 * published alpha.17: `npm i @oriui/vue@alpha.17 @oriui/css@alpha.16` exits 0 with alpha.16 on top and
 * alpha.17 nested). As peers, npm hoists one copy or refuses with ERESOLVE naming the conflict, and
 * npm 7+ still auto-installs them so a bare `npm i @oriui/vue` is unchanged.
 *
 * The exact pin stays while the line is a prerelease — a `^1.0.0` range cannot match `1.0.0-alpha.N`.
 * At the 1.0 cutover both ranges become `^1.0.0` (RELEASING.md step 6 carries the procedure and the
 * changesets flag it needs).
 */
describe('internal dependency graph', () => {
    const vue = manifest('vue')

    it('the three packages share one lockstep version', () => {
        for (const dir of PACKAGES) expect(manifest(dir).version).toBe(LOCKSTEP)
    })

    it('@oriui/vue declares no runtime dependencies at all', () => {
        expect(vue.dependencies).toBeUndefined()
    })

    it.each(['@oriui/css', '@oriui/headless'])(
        '@oriui/vue takes %s as a peer, pinned to the lockstep version',
        (name) => {
            expect(vue.peerDependencies?.[name], `${name} is not a peer of @oriui/vue`).toBe(LOCKSTEP)
        }
    )

    it.each(['@oriui/css', '@oriui/headless'])(
        '@oriui/vue also dev-depends on %s so the repo build links it',
        (name) => {
            expect(vue.devDependencies?.[name]).toBe(LOCKSTEP)
        }
    )

    it('neither sibling depends back on @oriui/vue — the graph stays a DAG', () => {
        for (const dir of ['headless', 'css']) {
            const pkg = manifest(dir)
            const every = { ...pkg.dependencies, ...pkg.peerDependencies, ...pkg.devDependencies }
            expect(Object.keys(every)).not.toContain('@oriui/vue')
        }
    })
})

/**
 * The release gate used to be a hand-copied subset of CI's under a comment that claimed parity, and it
 * had already drifted by four checks (ORI-I-31). The gate is now ONE root script that release.yml
 * invokes, and this test is what keeps it honest: every npm script reachable from ci.yml must be
 * reachable from release.yml, directly or through a script it calls.
 *
 * Limit worth knowing: it only sees checks spelled `npm run <name>`. A step in ci.yml that shells out
 * directly is invisible here — which is the other reason the gate belongs in package.json.
 */
describe('the release gate cannot drift below CI', () => {
    // Comment lines are dropped: a step is what the workflow RUNS, and the prose around it is free to
    // name the thing it stopped doing.
    const workflow = (name: string) =>
        readFileSync(resolve(root, '.github/workflows', name), 'utf8')
            .split('\n')
            .filter((line) => !/^\s*#/.test(line))
            .join('\n')
    const scripts: Record<string, string> = rootManifest.scripts
    const invoked = (text: string) => [...text.matchAll(/npm run ([\w:]+)/g)].map((m) => m[1])

    // Follow `npm run x` through the script bodies, so `gate` stands in for everything it calls.
    const expand = (names: string[]) => {
        const reached = new Set<string>()
        const queue = [...names]
        while (queue.length) {
            const name = queue.pop() as string
            if (reached.has(name)) continue
            reached.add(name)
            if (scripts[name]) queue.push(...invoked(scripts[name]))
        }
        return reached
    }

    // CI measures coverage; the release gate runs the same suite without the instrumentation.
    const EQUIVALENT: Record<string, string> = { 'test:cov': 'test' }

    it('release.yml runs the shared gate script', () => {
        expect(invoked(workflow('release.yml'))).toContain('gate')
        expect(scripts.gate, 'the gate script itself is gone').toBeTruthy()
    })

    it('every check CI runs is also reachable from release.yml', () => {
        const fromRelease = expand(invoked(workflow('release.yml')))
        const missing = [...expand(invoked(workflow('ci.yml')))].filter(
            (name) => !fromRelease.has(name) && !fromRelease.has(EQUIVALENT[name])
        )
        expect(missing, `ci.yml runs checks the publish does not gate on: ${missing.join(', ')}`).toEqual([])
    })

    it('neither workflow fetches a tool tree at run time', () => {
        // `npx -y <pkg>@<version>` resolves and executes code that npm ci never saw, and release.yml
        // does it inside the OIDC-privileged job. publint + attw are root devDependencies now.
        for (const name of ['ci.yml', 'release.yml']) {
            expect(workflow(name), `${name} still uses npx -y`).not.toMatch(/npx\s+-y/)
        }
        for (const tool of ['publint', '@arethetypeswrong/cli']) {
            expect(rootManifest.devDependencies[tool], `${tool} is not a pinned devDependency`).toMatch(
                /^\d+\.\d+\.\d+$/
            )
        }
    })
})
