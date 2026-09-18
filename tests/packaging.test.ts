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
