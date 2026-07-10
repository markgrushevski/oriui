---
'@oriui/vue': patch
---

`@oriui/vue`'s shipped type declarations now resolve under `moduleResolution: node16` / `nodenext`, not
just `bundler`. `vue-tsc` emits extensionless relative specifiers (`from './types'`, directory
`from './components'`, `.vue` re-exports) that strict node16/nodenext consumers reject (TS2834); a
post-build step (`scripts/fix-dts.mjs`) now rewrites them to explicit `.js` / `/index.js` paths. Verified
with a nodenext consumer typecheck and `@arethetypeswrong/cli` (node16-from-ESM is green). No runtime or
API change. (`@oriui/headless` was already node16-clean; `@oriui/css` ships no declarations.)
