// Lockstep version bump for the @oriui/* packages.
//   Usage: node scripts/bump.mjs <new-version>     e.g. node scripts/bump.mjs 1.0.0-alpha.2
//
// Replaces the current version string everywhere it appears across the four package.json files —
// each package's own `version` AND the pinned internal `@oriui/*` deps — keeping the whole graph in
// lockstep (a `*` range can't match a prerelease, so internal deps are pinned exact). Then sync the
// lockfile and commit:
//   npm install --package-lock-only && git commit -am "chore(release): v<new-version>"
import { readFileSync, writeFileSync } from 'node:fs';

const next = process.argv[2];
if (!next) {
    console.error('Usage: node scripts/bump.mjs <new-version>');
    process.exit(1);
}

const files = [
    'package.json',
    'packages/css/package.json',
    'packages/core/package.json',
    'packages/vue/package.json'
];

const current = JSON.parse(readFileSync('package.json', 'utf8')).version;
if (current === next) {
    console.error(`Already at ${next} — nothing to do.`);
    process.exit(1);
}

for (const file of files) {
    writeFileSync(file, readFileSync(file, 'utf8').replaceAll(current, next));
}

console.log(`Bumped ${current} -> ${next} across ${files.length} package.json files.`);
console.log(`Next: npm install --package-lock-only && git commit -am "chore(release): v${next}"`);
