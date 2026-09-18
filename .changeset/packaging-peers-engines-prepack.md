---
'@oriui/vue': patch
'@oriui/headless': patch
'@oriui/css': patch
---

Fix what the three manifests promise an installer:

- **`@oriui/vue` takes its siblings as peers, not exact `dependencies`.** The exact pin looked like it
  guaranteed a matching CSS/component pair and could not: `npm i @oriui/vue@alpha.17 @oriui/css@alpha.16`
  exited 0 with alpha.16 on top and an unreachable alpha.17 nested inside `@oriui/vue` — new components
  rendering against old CSS, plus a duplicated module graph around `@oriui/headless`'s process-wide
  singletons, with no warning anywhere. As `peerDependencies` (`+ devDependencies` for the repo build)
  npm hoists one copy or refuses with `ERESOLVE` naming the conflict. npm 7+ auto-installs peers, so
  `npm i @oriui/vue` still brings all three at the right versions — only the mismatch case changes, from
  silent to loud. The ranges stay pinned to the exact lockstep version until 1.0, since `^` cannot match
  a prerelease.
- **Node engine floors say what they mean.** `@oriui/vue` published `>=22.18.0`, copied from the tsdown
  build toolchain — a build requirement, not a runtime one. Both packages that ship executable JS now
  declare `">=22"`, the supported Node line; `@oriui/css` declares none, because a stylesheet has no
  runtime.
- **Every package rebuilds on `prepack`.** `dist` is gitignored and untracked, and nothing but the root
  `release` script put a build inside a publish — so the manual `npm publish` path documented in
  RELEASING.md could ship an empty package from a clean checkout. `prepack` runs for both `npm pack` and
  `npm publish`, which makes the build unskippable whichever command is typed.
