import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

// Emit the standalone CSS layer: inline every @import (postcss-import), autoprefix against the
// repo's browserslist, then minify (cssnano) — these are CDN-deliverable standalone files, so the
// compressed transfer size is what matters. All outputs go through the same pipeline:
//   dist/styles.css            — the full bundle (tokens + reset + every component + utilities)
//   dist/base.css              — the à-la-carte foundation (tokens.css + reset.css)
//   dist/tokens.css            — the reset-free foundation (layer order + tokens + utilities)
//   dist/reset.css             — the global reset alone (to pair with tokens.css)
//   dist/components/<name>.css — one file per component block, to pair with base/tokens.css
const pipeline = postcss([postcssImport(), autoprefixer(), cssnano({ preset: 'default' })]);

async function emit(from, to) {
    const css = readFileSync(from, 'utf8');
    const result = await pipeline.process(css, { from, to });
    writeFileSync(to, result.css);
    console.log(`@oriui/css -> ${to} (${(result.css.length / 1024).toFixed(1)} kB, minified)`);
}

mkdirSync('dist/components', { recursive: true });

await emit('src/styles.css', 'dist/styles.css');
await emit('src/base.css', 'dist/base.css');
await emit('src/tokens.css', 'dist/tokens.css');
await emit('src/reset.css', 'dist/reset.css');
for (const file of readdirSync('src/components').filter((f) => f.endsWith('.css'))) {
    await emit(join('src/components', file), join('dist/components', basename(file)));
}
