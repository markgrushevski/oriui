// Post-process vue-tsc's emitted declarations so they resolve under `moduleResolution: node16`/
// `nodenext` (not just `bundler`). vue-tsc writes EXTENSIONLESS relative specifiers — `from './types'`,
// `from '../../types'`, directory re-exports (`from './components'`), and `.vue` re-exports
// (`from './ori-button.vue'`) — all of which node16/nodenext rejects (TS2307 / an attw
// InternalResolutionError). It needs an explicit path: a file → `<spec>.js`, a directory → its
// `<spec>/index.js`. (A `.d.ts` import written as `.js` is correct — TS maps the `.js` back to the
// sibling `.d.ts`.) We keep the per-file vue-tsc output and just rewrite the specifiers in place, rather
// than pulling in api-extractor/rollup-dts, which can't emit `.vue` SFC declarations (the reason the
// build uses vue-tsc in the first place — see CLAUDE.md).
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

function declarationFiles(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) out.push(...declarationFiles(p));
        // `.d.ts` only — `.d.ts.map` ends in `.map`, so it is excluded (its specifiers aren't resolved).
        else if (name.endsWith('.d.ts')) out.push(p);
    }
    return out;
}

// Rewrite ONE relative specifier to an explicit, node16-resolvable path. Bare/already-explicit
// specifiers pass through untouched; an unresolvable one is left as-is so it surfaces as a real
// tsc/attw error rather than being silently mangled.
function fixSpecifier(spec, fileDir) {
    if (!spec.startsWith('.')) return spec; // bare: 'vue', '@oriui/headless/vue' — resolved by their own package
    if (/\.(js|mjs|cjs|json)$/.test(spec)) return spec; // already has an explicit extension
    const abs = resolve(fileDir, spec);
    if (existsSync(`${abs}.d.ts`)) return `${spec}.js`; // sibling file (incl. `foo.vue` → `foo.vue.js`)
    if (existsSync(join(abs, 'index.d.ts'))) return `${spec}/index.js`; // directory → its barrel
    return spec;
}

// `from '<spec>'` (import/export ... from) and inline dynamic type imports `import('<spec>')`. The
// specifier group requires a leading dot, so bare imports (`from 'vue'`, `import('vue')`) never match.
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.[^'"]*)\2/g;

let rewritten = 0;
for (const file of declarationFiles(DIST)) {
    const dir = dirname(file);
    const before = readFileSync(file, 'utf8');
    const after = before.replace(SPECIFIER, (_m, kw, quote, spec) => `${kw}${quote}${fixSpecifier(spec, dir)}${quote}`);
    if (after !== before) {
        writeFileSync(file, after);
        rewritten++;
    }
}
console.log(`fix-dts: rewrote relative specifiers in ${rewritten} declaration file(s) for node16 resolution`);
