---
'@oriui/headless': minor
'@oriui/vue': patch
---

**Toast behaviour moved into `@oriui/headless` (Vue + Svelte).** `useToast` — the imperative toast queue —
now ships from `@oriui/headless/vue` and, new, `@oriui/headless/svelte`, backed by a framework-agnostic core
queue engine (`createToastQueue`; kept out of the core barrel so it never weighs on the 1 kB core budget,
and projected into a Vue reactive array / a Svelte readable store). **Non-breaking:** the `@oriui/vue` path is
unchanged — `import { useToast } from '@oriui/vue'` still works and shares the one queue (it re-exports the
Vue adapter). The change is that the behaviour is now a shared headless composable with Svelte parity,
closing the last styled component whose composable lived in the styled package. Adds a `useToast` docs page.
