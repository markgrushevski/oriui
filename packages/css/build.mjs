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

// Every dist file opens with a one-line `/*!` banner so the usage rule survives minification —
// prepended AFTER cssnano runs, so no minifier setting can ever strip it. Component files state
// the base-or-tokens-first rule; foundation entries name what they carry.
const COMPONENT_BANNER = '/*! @oriui/css — requires @oriui/css/base.css or tokens.css imported first */';
const FOUNDATION_BANNERS = {
    'src/styles.css':
        '/*! @oriui/css styles.css — the full bundle: layer order + reset + tokens + utilities + every component */',
    'src/base.css': '/*! @oriui/css base.css — layer order + reset + tokens + utilities */',
    'src/tokens.css':
        '/*! @oriui/css tokens.css — layer order + tokens + utilities (reset-free; pair with reset.css or your own preflight) */',
    'src/reset.css': '/*! @oriui/css reset.css — the global reset alone (pair with tokens.css) */'
};

async function emit(from, to, banner) {
    const css = readFileSync(from, 'utf8');
    const result = await pipeline.process(css, { from, to });
    const out = `${banner}\n${result.css}`;
    writeFileSync(to, out);
    console.log(`@oriui/css -> ${to} (${(out.length / 1024).toFixed(1)} kB, minified)`);
}

mkdirSync('dist/components', { recursive: true });

for (const [from, banner] of Object.entries(FOUNDATION_BANNERS)) {
    await emit(from, join('dist', basename(from)), banner);
}
for (const file of readdirSync('src/components').filter((f) => f.endsWith('.css'))) {
    await emit(join('src/components', file), join('dist/components', basename(file)), COMPONENT_BANNER);
}
