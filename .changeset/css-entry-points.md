---
'@oriui/css': minor
---

À-la-carte entry points: `@oriui/css/base.css` (the batteries-included foundation — cascade-layer
order + tokens + skins + utilities + the global reset), `@oriui/css/tokens.css` (the same foundation
without the reset, for apps that bring their own preflight), `@oriui/css/reset.css` (the global
reset alone), and `@oriui/css/components/<name>.css` (one file per component block) — so a consumer
can ship only the components they use. Import a foundation first, then components. The default `.`
export (the full `styles.css` bundle, now also addressable as `@oriui/css/styles.css`) is unchanged.
