import { readFileSync, readdirSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * Utility-layer class-model guard for @oriui/css.
 *
 * oriUI's token utilities are SINGLE-class: a block class plus one value class
 * (`.ori-button.ori-variant_soft`), never the older paired `base + modifier` pair. A leftover base
 * rule is NOT a harmless no-op here, because `ori.utilities` is declared last and therefore outranks
 * the per-axis defaults a block bakes into `ori.components`. `.ori-variant` used to set
 * `--ori-variant-bg-color: transparent`, so merely adding it stripped the block's fill: real Chromium
 * rendered `.ori-button.ori-variant` transparent with a `currentColor` label, silently bypassing the
 * AA-checked `--ori-color-on` pairing that tokens.contrast.test.ts guarantees.
 *
 * Source-level (like css.entries.test.ts / tokens.contrast.test.ts): src is what gets bundled into
 * dist, so a rule absent here cannot reach the shipped CSS. No build required.
 */

const root = process.cwd()
const srcDir = resolve(root, 'packages/css/src')

// Every .css under packages/css/src, recursively — a base rule must not reappear in ANY partial.
function cssFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = resolve(dir, entry.name)
        if (entry.isDirectory()) return cssFiles(full)
        return entry.name.endsWith('.css') ? [full] : []
    })
}

// Comments discuss `.ori-variant` in prose; strip them so only real selectors count.
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

// Matches a BARE axis class only. The negative lookahead keeps the value utilities
// (`.ori-variant_soft`, `.ori-color_danger`), the block classes (`.ori-color-picker`) and the custom
// properties (`--ori-variant-bg-color`) out.
const BARE_AXIS_BASE = /\.ori-(?:variant|color)(?![\w-])/

describe('@oriui/css utility class model', () => {
    it('ships no bare paired-base class for the token axes (single-class utilities only)', () => {
        const offenders = cssFiles(srcDir)
            .filter((file) => BARE_AXIS_BASE.test(stripComments(readFileSync(file, 'utf8'))))
            .map((file) => relative(root, file))

        expect(
            offenders,
            `legacy paired-base rule found in: ${offenders.join(', ')} — the axes are single-class ` +
                `(.ori-variant_soft), and a base in ori.utilities overrides the block's baked fill`
        ).toEqual([])
    })

    it('still ships every single-class variant utility the component blocks read', () => {
        const css = stripComments(readFileSync(resolve(srcDir, 'themes/_themes-variant.css'), 'utf8'))
        for (const variant of ['solid', 'soft', 'outline', 'text', 'quiet']) {
            expect(css, `.ori-variant_${variant} is missing`).toContain(`.ori-variant_${variant} {`)
        }
    })
})
