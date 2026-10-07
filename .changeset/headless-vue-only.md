---
'@oriui/headless': major
---

The Svelte and React adapters are no longer published. `@oriui/headless` now exports the framework-free core
(`@oriui/headless`) and the Vue adapter (`@oriui/headless/vue`): the `@oriui/headless/svelte` and
`@oriui/headless/react` subpaths are gone, and `svelte` and `react` are no longer peer dependencies.

Both adapters were in development and are not part of 1.0. An app that imports one can stay on
`@oriui/headless@1.0.0-rc.22`. The `@oriui/css` classes and tokens work in Svelte and React as before.
