---
title: useToken
---

# useToken

A reactive **token bridge** — it resolves an `--ori-*` design token to its computed value in JS, for
canvas / WebGL / chart painters (Konva, ECharts, …) that draw outside the CSS cascade yet must follow the
active skin. It reads through a hidden probe, because the obvious API is a trap: `getComputedStyle(el)`
`.getPropertyValue('--x')` hands back the unresolved `var()` chain (oriUI aliases chain), not a color —
substitution only happens at a real property's computed-value time.

This is the **Vue** binding; the framework-agnostic core (`resolveToken`, `observeTheme`) lives in
[`@oriui/headless`](/headless/core), and a Svelte store twin ships at `@oriui/headless/svelte`. Like
[`useTheme`](/headless/use-theme), this is DOM + state — a read-only reactive **value**, not a widget — so
there are no prop bags and no swappable adapter. It re-resolves on every skin / mode flip, and is a
**colors-only MVP**: the token must resolve to a `<color>`.

## Import

```ts
import { useToken, useThemeColor } from '@oriui/headless/vue';
```

## Arguments

`useToken` takes the custom-property name; `useThemeColor` is sugar that takes a color **role** and
expands it to `--ori-color-<role>`. Pass a getter / ref (Vue) or a store (Svelte) to re-resolve when the
argument changes — a plain string is a fixed snapshot.

| Argument (composable)     | Vue type                   | Svelte type             | Description                                                           |
| ------------------------- | -------------------------- | ----------------------- | --------------------------------------------------------------------- |
| `token` — `useToken`      | `MaybeRefOrGetter<string>` | `MaybeReactive<string>` | The `--ori-*` custom property to resolve, e.g. `--ori-color-primary`. |
| `color` — `useThemeColor` | `MaybeRefOrGetter<string>` | `MaybeReactive<string>` | A color role name; resolves `--ori-color-<color>` (e.g. `primary`).   |

## Returns

Both return a single **read-only reactive value** — the token's resolved computed color (e.g.
`'rgb(3, 105, 161)'`), or `''` until it resolves.

| Composable             | Vue                     | Svelte             | Value                                                         |
| ---------------------- | ----------------------- | ------------------ | ------------------------------------------------------------- |
| `useToken(token)`      | `Readonly<Ref<string>>` | `Readable<string>` | The resolved computed value of the `--ori-*` custom property. |
| `useThemeColor(color)` | `Readonly<Ref<string>>` | `Readable<string>` | Sugar: the resolved value of `--ori-color-<color>`.           |

The value is `''` during SSR and before mount (Vue) — server and first client render match — resolving
on mount; re-resolves when the token argument changes (only if you passed a getter / ref / store) and on
every theme change — skin class / style toggles **and** OS `prefers-color-scheme` flips — via the core
`observeTheme`. The observer is torn down on scope dispose (Vue component unmount). An unresolvable token
returns `''` too, and in dev builds warns once naming the token (so the SSR-`''` and failed-`''` cases are
distinguishable).

## Usage

There is no styled component — the consumer is a JS painter. Create the engine in `onMounted` (this
composable's own `onMounted` ran first, so `brand.value` is already resolved), seed it with the resolved
value, then `watch` — theme flips re-push automatically:

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from 'vue';
import { useThemeColor } from '@oriui/headless/vue';

const canvasEl = useTemplateRef<HTMLCanvasElement>('canvas');
const brand = useThemeColor('primary'); // resolved --ori-color-primary; '' until mounted (SSR-safe)

let engine: Engine | undefined;
onMounted(() => {
    engine = createEngine(canvasEl.value);
    engine.setColor(brand.value || null); // seed the initial resolved color
});
watch(brand, (c) => engine?.setColor(c || null)); // '' (SSR/unresolved) -> engine default
</script>

<template>
    <canvas ref="canvas" />
</template>
```

The **Svelte** binding is the same — a lazy readable store (resolution and the theme observer start with
the first subscriber and tear down with the last). Create the engine in `onMount`, then `subscribe`: it
fires immediately with the current value (seeding the engine) and again on every theme flip. (In markup
you can auto-subscribe with `$brand` instead.)

```svelte
<script>
    import { onMount } from 'svelte';
    import { useThemeColor } from '@oriui/headless/svelte';

    let canvas;
    const brand = useThemeColor('primary');

    onMount(() => {
        const engine = createEngine(canvas);
        const stop = brand.subscribe((c) => engine.setColor(c || null)); // fires immediately, then on theme flips
        return () => stop();
    });
</script>

<canvas bind:this={canvas} />
```

The **React** binding is the same — the control is a plain value (no `.value` / `$`, re-rendering on theme
flips via a `useEffect` that resolves and observes; `''` until mounted, SSR-safe). Create the engine in one
effect, then seed + re-push from a second effect keyed on the resolved color — `''` (SSR/unresolved) maps to
the engine's own default. `@oriui/css` styles any surrounding markup with the same tokens in React / Next
today:

```tsx
import { useEffect, useRef } from 'react';
import { useThemeColor } from '@oriui/headless/react';

function BrandCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Engine>();
    const brand = useThemeColor('primary'); // resolved --ori-color-primary; '' until mounted (SSR-safe)

    useEffect(() => {
        engineRef.current = createEngine(canvasRef.current!);
    }, []); // create the engine once

    useEffect(() => {
        engineRef.current?.setColor(brand || null); // seed on mount, re-push on every theme flip
    }, [brand]);

    return <canvas ref={canvasRef} />;
}
```

## Lower-level

Both composables wrap two core exports you can call directly (no framework). `resolveToken(token, options?)`
is the one-shot probe — it appends a hidden element whose `color` is `var(<token>)`, reads
`getComputedStyle(probe).color`, and removes it, returning `''` when the token is unresolvable or
`document` is undefined (SSR). `observeTheme(callback, options?)` is the invalidation signal — a
`MutationObserver` on the target's `class` / `style` plus a `matchMedia('(prefers-color-scheme: dark)')`
change listener (so an `auto`-skin OS flip re-resolves without any attribute mutating); it returns an
unsubscribe.

```ts
import { resolveToken, observeTheme } from '@oriui/headless';

let color = resolveToken('--ori-color-primary'); // 'rgb(3, 105, 161)' | '' if unresolvable / SSR
const stop = observeTheme(() => {
    color = resolveToken('--ori-color-primary'); // re-resolve on skin/mode flip
});
// later: stop();
```

Each takes an optional `element` (`ResolveTokenOptions` / `ObserveThemeOptions`), defaulting to
`document.documentElement` — pass a wrapper to resolve within (or watch) a scoped subtree's cascade
context. `resolveToken` is synchronous and allocation-light but touches the DOM, so cache per frame if you
resolve many tokens in a render loop. See [`@oriui/headless`](/headless/core).

## Accessibility

There is no interactive surface here — the value the bridge hands a painter is where accessibility lives.

- It re-resolves on skin / style toggles **and** OS `prefers-color-scheme` flips (`observeTheme` listens
  to `matchMedia`), so a canvas / chart honours the user's live light / dark preference and explicit theme
  choice exactly like CSS-cascade content — no stale colors after a theme switch.
- Resolving the role tokens (`useThemeColor('primary')`, its `on-` partner) inherits oriUI's
  contrast-checked pairing rather than a hand-picked color; the WCAG-AA guarantee that the
  [contrast test](/guides/customization#_1-start-with-the-props-the-semantic-roles) asserts for the
  shipped roles carries through into your painter.
- SSR-safe by design: `''` until mounted means server and first client render agree (no hydration
  mismatch) — seed the engine's own default (`c || null`) until the real color resolves.

## See also

- [Customization → Reading tokens from JS](/guides/customization#reading-tokens-from-js) — the guide
  section this bridge backs, with the full canvas-painter pattern.
- [@oriui/headless](/headless/core) — the framework-agnostic `resolveToken` / `observeTheme` primitives.
- [useTheme](/headless/use-theme) — the light / dark controller whose flips these tokens re-resolve
  against.
