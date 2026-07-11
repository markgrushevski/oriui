---
'@oriui/vue': patch
---

Packaging hygiene for `@oriui/vue`:

- `sideEffects` is now `false` (was `["**/*.css"]`, which matched nothing — the package ships no CSS, it
  comes from `@oriui/css`), giving bundlers a clean tree-shaking signal so importing one component pulls
  no others.
- The `vue` peer range is raised to `^3.5` to match the actual API floor (the SFCs use reactive props
  destructure) and `@oriui/headless`'s peer, so a Vue 3.4 consumer gets a correct peer warning instead of
  an unsupported runtime.
