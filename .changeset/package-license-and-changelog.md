---
'@oriui/vue': patch
'@oriui/headless': patch
'@oriui/css': patch
---

Fix what the published tarballs actually contain:

- **Ship the MIT license.** All three declared `"license": "MIT"` but no tarball carried the text — the
  LICENSE lived only at the repo root, which npm never reaches into. Each package now has its own copy
  (npm always includes a package-root `LICENSE`, so no `files` change was needed).
- **Ship the changelog.** `CHANGELOG.md` is not part of npm's always-included set, so the changelog
  changesets generates every release never left the repo. It is now listed in `files`.
- **`@oriui/css` ships `dist` only.** It was shipping 52 source files nothing could reach: unlike
  `@oriui/vue` / `@oriui/headless`, whose dist source maps resolve into `src`, the css package emits no
  maps and every export resolves inside `dist`. The tarball drops from 93 files / 63.4 kB to 43 / 33.2 kB.
