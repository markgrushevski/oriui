import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';

// Bundle the standalone CSS layer into one file: inline every @import (postcss-import),
// then autoprefix against the repo's browserslist. Output mirrors what the Vite lib build
// used to emit for `@oriui/ui/dist/styles/styles.css`, now owned by this package.
const from = 'src/styles.css';
const to = 'dist/styles.css';

const css = readFileSync(from, 'utf8');
const result = await postcss([postcssImport(), autoprefixer()]).process(css, { from, to });

mkdirSync('dist', { recursive: true });
writeFileSync(to, result.css);
console.log(`@oriui/css -> ${to} (${(result.css.length / 1024).toFixed(1)} kB)`);
