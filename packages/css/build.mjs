import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

// Bundle the standalone CSS layer into one file: inline every @import (postcss-import),
// autoprefix against the repo's browserslist, then minify (cssnano) — this is a CDN-deliverable
// standalone file, so the compressed transfer size is what matters. Output mirrors what the Vite
// lib build used to emit for `@oriui/ui/dist/styles/styles.css`, now owned by this package.
const from = 'src/styles.css';
const to = 'dist/styles.css';

const css = readFileSync(from, 'utf8');
const result = await postcss([postcssImport(), autoprefixer(), cssnano({ preset: 'default' })]).process(css, {
    from,
    to
});

mkdirSync('dist', { recursive: true });
writeFileSync(to, result.css);
console.log(`@oriui/css -> ${to} (${(result.css.length / 1024).toFixed(1)} kB, minified)`);
