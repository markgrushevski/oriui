---
title: useTheme
---

# useTheme

A headless **light / dark theme controller** — it owns the mode setting, resolves `auto` against the OS
scheme live, persists the choice, and applies it to the DOM. It applies through `applyTheme`, which sets
the `ori-theme_{light,dark}` class (removing the opposite — exactly one is on at a time) **and** works
around a bug in current Chromium where a runtime theme toggle otherwise leaves styled components
painting the previous theme's colours until they re-render.

This is the **Vue** binding; the framework-agnostic core (`createThemeController`, `applyTheme`) lives
in [`@oriui/headless`](/headless/core), and a Svelte store twin ships at `@oriui/headless/svelte`.
Theming is DOM + state, so — unlike [`useDisclosure`](/headless/use-disclosure) /
[`useDialog`](/headless/use-dialog) — there is no swappable adapter.

For the conceptual guide — skins, subtree scoping, and the flash-free initial theme — see
[Theming](/guides/theming).

## Import

```ts
import { useTheme } from '@oriui/headless/vue';
```

## Options

All optional; forwarded to `createThemeController`.

| Option        | Type                          | Default           | Description                                                                           |
| ------------- | ----------------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| `default`     | `'auto' \| 'light' \| 'dark'` | `'auto'`          | Setting when nothing is persisted. `auto` follows `prefers-color-scheme` live.        |
| `storageKey`  | `string \| null`              | `'ori-theme'`     | `localStorage` key the setting reads from / writes to. `null` disables persistence.   |
| `root`        | `HTMLElement`                 | `documentElement` | Element the `ori-theme_*` class is set on (defaults to `<html>`).                     |
| `flushTarget` | `HTMLElement \| null`         | `document.body`   | Subtree force-restyled to defeat the invalidation bug above. `null` skips the flush.  |
| `classPrefix` | `string`                      | `'ori-theme_'`    | The applied class is `${classPrefix}${mode}` — override to theme with your own class. |

## Returns

Reactive state plus imperative setters.

| Property            | Type                                             | Description                                                      |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `theme`             | `Ref<'auto' \| 'light' \| 'dark'>`               | The current SETTING (reactive).                                  |
| `resolvedTheme`     | `Ref<'light' \| 'dark'>`                         | The theme actually on the DOM; tracks the OS scheme when `auto`. |
| `setTheme(setting)` | `(setting: 'auto' \| 'light' \| 'dark') => void` | Set the setting (`auto` re-follows the OS), apply, and persist.  |
| `toggleTheme()`     | `() => void`                                     | Flip the resolved theme light ⇄ dark (pins an explicit setting). |
| `cycleTheme()`      | `() => void`                                     | Cycle `auto → light → dark → auto`.                              |

## Usage

```vue
<script setup lang="ts">
import { useTheme } from '@oriui/headless/vue';

// setTheme(mode) and toggleTheme() are also returned — see Returns.
const { theme, resolvedTheme, cycleTheme } = useTheme({
    storageKey: 'ori-theme',
    default: 'auto'
});
</script>

<template>
    <button @click="cycleTheme">Theme: {{ theme }} ({{ resolvedTheme }})</button>
</template>
```

The controller applies the persisted / default theme in `setup`, **before mount** — so there's no flash
between mount and the applied theme — and tears its OS-scheme listener down on scope dispose. (A
client-only SPA can still flash on the very first paint before JS runs; the pre-paint script below
closes that gap.)

The **Svelte** twin is the same controller as a readable store (auto-subscribe with `$`) plus the
setters:

```svelte
<script>
    import { useTheme } from '@oriui/headless/svelte';

    const theme = useTheme({ storageKey: 'ori-theme', default: 'auto' });
</script>

<button on:click={theme.cycleTheme}> Theme: {$theme.theme} ({$theme.resolvedTheme}) </button>
```

## Lower-level

`useTheme` wraps two exports you can use directly. If you already own the mode state — your own store,
or plain JS — call **`applyTheme`** exactly where you'd toggle the class; it carries the fix:

```ts
import { applyTheme } from '@oriui/headless';

// sets ori-theme_{dark,light} on <html> AND re-resolves the components
applyTheme(isDark ? 'dark' : 'light');
```

`createThemeController(options)` is the vanilla engine behind `useTheme` (same options →
`{ get, resolved, set, toggle, cycle, subscribe, destroy }`), and `flushThemeInvalidation(el)` is the
bare workaround — call it after any runtime change of an inherited colour token you apply yourself (e.g.
switching `data-ori-skin`). See [`@oriui/headless`](/headless/core).

## SSR & the initial theme

`useTheme` is inert on the server (no `document`) and applies on the client in `setup`. To avoid a flash
of the wrong theme on the very first paint (SSR/Nuxt, or a persisted SPA), set the `ori-theme_*` class
in a tiny inline `<head>` script before any stylesheet paints:

```html
<script>
    // runs before first paint. useTheme persists the SETTING, which may be 'auto' — RESOLVE it,
    // don't just test for the 'dark' string (matches default: 'auto').
    var s = localStorage.getItem('ori-theme'); // 'auto' | 'light' | 'dark' | null
    var dark = s === 'dark' || ((!s || s === 'auto') && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.add(dark ? 'ori-theme_dark' : 'ori-theme_light');
</script>
```

Applying the theme before render never needs the invalidation flush; only runtime switches do.

## Accessibility

- `default: 'auto'` respects the user's `prefers-color-scheme` and follows OS changes live — the
  accessible default; `setTheme` / `toggleTheme` let a user override it explicitly, and the choice
  persists.
- `color-scheme` (native controls, scrollbars, UA defaults) and WCAG-AA contrast in both modes are
  guaranteed by oriUI's theme selectors and the token contract — see the [Theming guide](/guides/theming).

## See also

- [Theming](/guides/theming) — the full mode + skin guide: skins, subtree scoping, the flash-free
  initial theme, and authoring a custom skin.
- [@oriui/headless](/headless/core) — the framework-agnostic contract and the native engine.
- [useDisclosure](/headless/use-disclosure) · [useDialog](/headless/use-dialog) — the other headless
  primitives.
