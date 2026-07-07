---
'@oriui/vue': patch
'@oriui/headless': patch
'@oriui/css': patch
---

Ship `src` alongside `dist` so the published declaration maps (`.d.ts.map`) and JS sourcemaps
(`.js.map`) resolve to real files. Before this, `files` shipped only `dist`, so every map pointed at a
`../src/…` source that wasn't in the package — go-to-definition (and JS debugging) dead-ended, and some
editors (notably WebStorm) degraded a component's model while chasing the missing source. Now
go-to-definition on an `Ori*` component or a headless composable lands on the real, commented source.
The `exports` map still routes all imports to `dist`; the extra `src` files are inert.
