import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * À-la-carte entry-point guard for @oriui/css. The package ships the CSS several ways: the full
 * bundle (`.` / `./styles.css`), the batteries-included foundation (`./base.css` = tokens + reset),
 * the reset-free foundation (`./tokens.css`), the reset alone (`./reset.css`), and per-component
 * files (`./components/*.css`). The scheme only works if (a) the exports map actually exposes the
 * subpaths, (b) the cascade-layer order is declared exactly once (layers.css) and reaches every
 * consumer FIRST — tokens.css imports it first, base.css imports tokens.css first, styles.css
 * imports base.css first — and (c) no component file is orphaned from the full bundle.
 * Source-level (like tokens.contrast.test.ts): no build required.
 */

const pkgDir = resolve(process.cwd(), 'packages/css');
const read = (rel: string) => readFileSync(resolve(pkgDir, rel), 'utf8');

// Ordered list of @import targets, comments stripped so a commented-out import doesn't count.
function imports(css: string): string[] {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    return [...noComments.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

describe('@oriui/css à-la-carte entry points', () => {
    it('package.json exports expose the foundation entries and the components/*.css pattern', () => {
        const { exports } = JSON.parse(read('package.json'));
        expect(exports['./base.css']).toBe('./dist/base.css');
        expect(exports['./tokens.css']).toBe('./dist/tokens.css');
        expect(exports['./reset.css']).toBe('./dist/reset.css');
        expect(exports['./components/*.css']).toBe('./dist/components/*.css');
    });

    it('styles.css (full bundle) imports base.css first, so the layer order still leads', () => {
        expect(imports(read('src/styles.css'))[0]).toBe('base.css');
    });

    it('base.css imports exactly tokens.css then reset.css', () => {
        expect(imports(read('src/base.css'))).toEqual(['tokens.css', 'reset.css']);
    });

    it('tokens.css imports layers.css first, and layers.css declares the five-layer order', () => {
        const LAYER_ORDER = '@layer ori.reset, ori.tokens, ori.base, ori.components, ori.utilities;';
        expect(imports(read('src/tokens.css'))[0]).toBe('layers.css');
        expect(read('src/layers.css')).toContain(LAYER_ORDER);
    });

    it('every src/components/*.css is imported by styles.css (no orphan component css)', () => {
        const files = readdirSync(resolve(pkgDir, 'src/components')).filter((f) => f.endsWith('.css'));
        const imported = imports(read('src/styles.css'));
        const orphans = files.filter((f) => !imported.includes(`components/${f}`));
        expect(orphans, `component css not imported by styles.css: ${orphans.join(', ')}`).toEqual([]);
    });

    // ------------------------------------------------------------------
    // Self-contained per-component entries — the dependency map is DERIVED from the vue sources at
    // test time, so it can never silently drift: the moment a component starts rendering a sibling
    // (or floating on `.ori-anchored`), this fails until its css entry inlines the dependency.
    // Without the inline, a consumer importing only button.css ships an unstyled spinner on `loading`.
    // ------------------------------------------------------------------

    it('per-component css inlines every block its vue component renders (self-contained entries)', () => {
        const vueComponents = resolve(process.cwd(), 'packages/vue/src/components');
        const names = readdirSync(vueComponents, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);

        const problems: string[] = [];
        for (const name of names) {
            const dir = resolve(vueComponents, name);
            const source = readdirSync(dir)
                .filter((f) => f.endsWith('.vue'))
                .map((f) => readFileSync(resolve(dir, f), 'utf8'))
                .join('\n');

            // Three dependency signals: (a) sibling component barrel imports (`from '../icon'` —
            // rendered child components; `../field/context` intentionally does NOT match: context
            // wiring renders nothing); (b) another component's `ori-*` block class emitted directly
            // as a string literal (the combobox reuses `.ori-input__field` without importing
            // OriInput); (c) the shared `.ori-anchored` placement primitive, which has no component
            // of its own so no name hints at it.
            const deps = new Set<string>();
            for (const m of source.matchAll(/from\s+'\.\.\/([a-z0-9-]+)';/g)) deps.add(m[1]);
            for (const m of source.matchAll(/['"`]ori-([a-z][a-z-]*)/g)) if (names.includes(m[1])) deps.add(m[1]);
            if (/['"`]ori-anchored/.test(source)) deps.add('anchored');
            deps.delete(name);

            const cssImports = imports(read(`src/components/${name}.css`)).map((p) =>
                p.replace(/^\.\//, '').replace(/\.css$/, '')
            );
            for (const dep of deps) {
                if (!cssImports.includes(dep)) {
                    problems.push(`${name}.css must @import './${dep}.css' — the ${name} component renders it`);
                }
            }
        }
        expect(problems, problems.join('\n')).toEqual([]);
    });

    it('component css @imports precede all other statements (CSS requires it; postcss-import skips late ones)', () => {
        const files = readdirSync(resolve(pkgDir, 'src/components')).filter((f) => f.endsWith('.css'));
        for (const file of files) {
            const noComments = read(`src/components/${file}`).replace(/\/\*[\s\S]*?\*\//g, '');
            const lastImport = noComments.lastIndexOf('@import');
            if (lastImport === -1) continue;
            const firstLayer = noComments.indexOf('@layer');
            expect(lastImport, `${file}: @import after the first @layer block`).toBeLessThan(firstLayer);
        }
    });
});
