---
'@oriui/headless': minor
---

**New: a theme controller that fixes runtime light/dark switching.** `@oriui/headless` now ships `applyTheme`,
`createThemeController` (core), and `useTheme` (Vue + Svelte) for setting the active theme, with `auto` (live OS
scheme) and persistence built in.

They exist because toggling the `ori-theme_dark` class at runtime hits a Chromium style-invalidation bug: every
styled component bakes a resolved role alias into an element-scoped custom property and reads it through a `var()`
chain, and Chromium can fail to re-resolve that chain when the inherited token changes via an ancestor class
toggle — so components keep the PREVIOUS theme's colours (fill/tonal backgrounds and role text) until they
re-render. It is not fixable in CSS (`@property`, literal tones, and reflows were all ineffective). `applyTheme`
flips the `ori-theme_{light,dark}` class and force-restyles the subtree in the same task (a `display:none`
round-trip on `document.body`, exposed as `flushThemeInvalidation`), which reliably re-resolves the colours.

```ts
// Vue
const { resolvedTheme, cycleTheme } = useTheme({ storageKey: 'app-theme', default: 'auto' });

// or low-level, in your own store / vanilla:
import { applyTheme } from '@oriui/headless';
applyTheme(isDark ? 'dark' : 'light'); // instead of a bare classList.toggle
```

Consumers that switch themes at runtime should apply the theme through these (or add the flush wherever they flip
the class). No breaking changes — purely additive.
