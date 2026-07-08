---
title: Customization
---

# Customization

Make it yours — without authoring a whole skin. Most products need one thing: _their_ brand color and
_their_ corner radius on top of accessible, ready-made components. oriUI lets you do that by repointing
a handful of design tokens — a few CSS custom properties in your own stylesheet, no rewrite, no fork.
This is the **prototype fast, scale without rewriting** payoff: the same `<OriButton>` you shipped on
day one becomes _on-brand_ by the time you ship to users, and nothing about the component changes.

For **color** there are exactly three levels, ordered from safest to most manual: the **props**
(semantic roles with a contrast guarantee — the recommended default), a **global brand override**
(repoint the token sources once, the whole app follows), and **per-instance variables** (the escape
hatch for a one-off). Around them this page covers **styling one instance**, **scoping an override to
a subtree**, a **5-minute brand walkthrough**, and how customized color reaches **icons** and
**JS-painted canvases**. Authoring a complete named skin and switching modes is
[Theming](/guides/theming); the exhaustive token inventory is
[Design tokens](/guides/design-tokens); the standalone-class story is [Using the CSS layer](/guides/css).

## 1 · Start with the props — the semantic roles

Before overriding anything, say what you mean. The styled components take a `color` **role** —
`primary` · `secondary` · `surface` · `background` · `success` · `warn` · `danger` · `info` — and,
where a surface can be painted more than one way, a `variant` **mapping** that decides _how_ the role
is painted: `fill` (role as background, its `on-` color as text), `tonal` / `outline` / `text` /
`plain` (role as tint / border / text). Color is the _role_, variant is the _mapping_ — the
background-and-text pairing is never yours to hand-assemble.

::example
:ori-button{text="Save" color="primary" variant="fill"}
:ori-button{text="Delete" color="danger" variant="outline"}
:ori-button{text="Done" color="success" variant="tonal"}

#vue

```vue
<OriButton text="Save" color="primary" variant="fill" />
<OriButton text="Delete" color="danger" variant="outline" />
<OriButton text="Done" color="success" variant="tonal" />
```

#html

```html
<button class="ori-button ori-variant_fill ori-color_primary">Save</button>
<button class="ori-button ori-variant_outline ori-color_danger">Delete</button>
<button class="ori-button ori-variant_tonal ori-color_success">Done</button>
```

::

Why this is the recommended default: every role ships with a contrast-checked `on-` partner, and that
pairing is **asserted, not hoped for** — an automated guard (`tests/tokens.contrast.test.ts`) parses
the token CSS and fails the suite if any role / `on-role` pair drops below **WCAG AA (4.5:1)** for
body text, across light and dark and every preset skin. Stay on the props and accessible contrast is
a build-time guarantee, and your palette keeps following every skin and mode switch for free.

The honest trade-off: the props only speak **roles**. There is deliberately no `text-color` or
`bg-color` prop — when a component must be a color that isn't a role, that's the
[escape hatch](#_4-the-escape-hatch-per-instance-color-variables) below, and the _why_ lives there too.

## Why an override just works — the `@layer` cascade

oriUI ships every token and utility inside `@layer`, in a fixed order — the canonical list lives on
[Design tokens](/guides/design-tokens#the-cascade-layer-order). The rule that makes customization
painless: **unlayered styles always beat layered ones**, regardless of specificity. Your own
`:root { … }` — written in your app's stylesheet, outside any `@layer` — wins over oriUI's
`@layer ori.tokens` declaration of the same token. You never fight specificity, and you never reach for
`!important`.

```css
/* oriUI ships this (inside @layer ori.tokens) */
@layer ori.tokens {
    :root {
        --ori-color-primary-light: #0369a1; /* the default azure */
    }
}

/* You write this in your own stylesheet — UNLAYERED, so it wins */
:root {
    --ori-color-primary-light: #16a34a; /* your green */
}
```

Both are `:root` (specificity `0,1,0`) — a tie on specificity. The unlayered rule wins purely because it
sits outside the layers. Every button, switch, and focus ring that resolves `--ori-color-primary` now
reads your green. **That is the whole mechanism.** Override the source token, and the light/dark
machinery and the per-component aliases resolve on top of your value automatically.

> For a **global** brand color, override the `*-light` / `*-dark` **source** tokens (e.g.
> `--ori-color-primary-light`) in `:root` — not the resolved alias `--ori-color-primary`, which the mode
> selectors repoint per mode (overwrite it at `:root` and you flatten dark mode). For a **single element
> or a region**, it is the reverse — you target the resolved alias (sections 4 and 5).

## 2 · Rebrand globally — override the token sources

Drop a `:root` block anywhere in your app's CSS (after importing oriUI). A color role is two source
tokens per mode — the color and its contrast-checked `on-` text color. Set both light and dark so the
brand holds in either mode:

```css
:root {
    /* light mode */
    --ori-color-primary-light: #16a34a;
    --ori-color-on-primary-light: #ffffff;
    /* dark mode */
    --ori-color-primary-dark: #4ade80;
    --ori-color-on-primary-dark: #052e16;
}
```

The `on-` token is the label/icon color that sits _on_ the filled color — keep the pair at WCAG AA
(≥ 4.5:1) yourself, the way the built-in skins do. The contrast test guards the palette the library
_ships_; your own sources are your responsibility, and both modes need their own check because dark
inverts the pairing.

This works because the active alias `--ori-color-primary` is declared **and resolved at `:root`** — it
reads `var(--ori-color-primary-light)` there (see
[`_themes-color-tokens.css`](/guides/design-tokens#colour-three-tiers)). Override the source at `:root`
and the alias re-resolves, inheriting your value into every component. Overriding all four skinnable
roles (plus their `on-` pairs, per mode) is the same move at scale — at that point consider
[authoring a named skin](/guides/theming#authoring-a-custom-skin) instead.

### Text tone — override only to fine-tune

A role's hue above is engineered as a **fill background** — a component paints it as text (the
non-fill button variants, the selected tab, alert, tag) through a separate, dedicated token,
`--ori-color-<role>-text`, so that a light or saturated role never has to double as body text. It
already derives an AA-safe tone automatically — a **relative color** that keeps the role's hue and
chroma and clamps only its lightness, so the text reads as the same colour as the fill, just darker
(light theme) or lighter (dark theme):

```css
/* :root — the light default */
--ori-color-primary-text: oklch(from var(--ori-color-primary) min(l, 0.42) c h);

/* .ori-theme_dark / :root.dark — re-declared with the opposite clamp */
--ori-color-primary-text: oklch(from var(--ori-color-primary) max(l, 0.86) c h);
```

Because each theme declares its own clamp — light caps lightness at 0.42, dark floors it at 0.86 —
the tone tracks the **active theme** automatically. And because both formulas read
`var(--ori-color-primary)`, the tone also tracks any **skin**'s role override, or your own — rebrand
`primary` above, or [author a whole custom skin](/guides/theming#authoring-a-custom-skin), and its
non-fill text tone is AA-safe **for free**. Override the derived value only to fine-tune the exact
hue:

- **Global**, every mode and skin: `:root { --ori-color-warn-text: #b45309 }`. A flat override value
  is theme-agnostic — unlike oriUI's own formula above, it needs no light/dark split — so your
  unlayered `:root` rule beats both oriUI's light default and its dark re-declaration, and one
  declaration covers both modes. Nest it inside `.ori-theme_dark` / `:root.dark` too if you want a
  different dark-mode value.
- **Per skin**: `[data-ori-skin='brand'] { --ori-color-primary-text: … }` — the same selector shape as
  [authoring a skin](/guides/theming#authoring-a-custom-skin).
- **Per instance or subtree**: repoint the resolved alias, `--ori-color-text`, on a wrapper — the same
  escape hatch as `--ori-color` / `--ori-color-on` (section 4 below).

This replaces the old workaround of targeting a component's fill token directly (e.g.
`.ori-button { --ori-color: … }`) to patch up text contrast — that also repaints the `fill` variant's
background, since `--ori-color` feeds both. `--ori-color-text` is the sanctioned point: it only ever
feeds the non-fill / selected-text axis — and now the `outline` variant's border too, so the ring and
the label match. _(Full per-role token reference:
[Design tokens](/guides/design-tokens#text-the-on-surface-foreground).)_

### Radius and font-size — the same pattern

The size scales live at `:root` too (`--ori-size-radius_*`, `--ori-font-size_*`), so the same
unlayered block rebrands them. `--ori-size-radius_md` anchors the whole scale — `xs` / `sm` / `lg` /
`xl` are `calc()`-derived from it, so one override moves every derived step proportionally (`zero`
and the `9999px` `rounded` pill stay fixed). The font ladder pivots on `--ori-font-size_md` the same
way, in fixed ±`0.125rem` (2px at the browser default) steps:

```css
:root {
    --ori-size-radius_md: 4px; /* sm/lg/xl re-derive — cards (lg) tighten along */
    --ori-font-size_md: 15px; /* the control ladder shifts around the new md */
}
```

> A repoint only moves components that resolve a **derived** step. Several controls pin a fixed step
> on purpose — buttons, badges, tags, and avatars default to `rounded` (the `9999px` pill) — so an
> `_md` repoint doesn't square a default button. Bring such a control onto your house radius per
> instance: the `radius="md"` prop / `ori-size-radius_md` class.

## 3 · Style one instance

When you want to change _one_ component, not the whole library, reach for the utility classes (CSS) or
the matching props (Vue) — no token override needed. Every utility is **single-class**: one class
repoints one token, no paired base class.

| Axis    | Utility class                                 | Vue prop  |
| ------- | --------------------------------------------- | --------- |
| Color   | `ori-color_*`                                 | `color`   |
| Variant | `ori-variant_*`                               | `variant` |
| Size    | `ori-<name>_*` sugar (or `ori-size-action_*`) | `size`    |
| Radius  | `ori-size-radius_*`                           | `radius`  |

This table is a quick orientation map; the full per-component class reference lives on each component
page — see [Button](/components/button) for the canonical list.

::example
:ori-button{text="Brand" color="primary" variant="fill"}
:ori-button{text="Danger" color="danger" variant="tonal"}
:ori-button{text="Squared" radius="sm" variant="outline"}
:ori-button{text="Large" size="lg" variant="fill"}

#vue

```vue
<OriButton text="Brand" color="primary" variant="fill" />
<OriButton text="Danger" color="danger" variant="tonal" />
<OriButton text="Squared" radius="sm" variant="outline" />
<OriButton text="Large" size="lg" variant="fill" />
```

#html

```html
<button class="ori-button ori-variant_fill ori-color_primary">Brand</button>
<button class="ori-button ori-variant_tonal ori-color_danger">Danger</button>
<button class="ori-button ori-size-radius_sm ori-variant_outline">Squared</button>
<button class="ori-button ori-button_lg ori-variant_fill">Large</button>
```

::

## 4 · The escape hatch — per-instance color variables

When the color you need isn't one of the eight roles — a data-series swatch, a partner logo tint, one
marketing CTA — repoint the **resolved alias pair** on the element itself. `--ori-color` (the accent)
and `--ori-color-on` (its legible partner) are what every variant actually reads:

```vue
<OriButton text="One teal button" style="--ori-color: teal; --ori-color-on: white" />
```

```html
<button class="ori-button ori-variant_fill" style="--ori-color: teal; --ori-color-on: white">One teal button</button>
```

Because you repoint the alias the variants are built on, **all the machinery keeps working**:

- every variant maps your accent correctly — `fill` paints it as the background with `--ori-color-on`
  text; `tonal`'s tint derives from `--ori-color`; `outline`'s border reads `--ori-color-text`, the
  same tone as its label;
- hover and active states stay right, because they are `color-mix()` **derivations of the alias**
  (a filled button hovers to `color-mix(in srgb, var(--ori-color), white 15%)`) — there is no second
  "hover color" to supply;
- the focus ring (`outline: 2px solid var(--ori-color)`) follows;
- state styling is untouched — it keys off real attributes (`disabled`, `aria-busy`, `data-active`),
  never off the palette.

**On a non-fill variant** (`tonal` / `outline` / `text` / `plain`), the label reads a _third_ alias,
`--ori-color-text` — not `--ori-color` directly (see
[Text — the on-surface foreground](/guides/design-tokens#text-the-on-surface-foreground)). CSS custom
properties don't re-substitute on inheritance: setting only `--ori-color` here does **not** also
recompute `--ori-color-text` for you, because nothing on this element redeclares it. Set it alongside
the pair when you need a non-fill variant on a one-off color, mirroring the derived formula (the light
clamp shown here; nest a `max(l, 0.86)` version under `.ori-theme_dark` / `:root.dark` for a
dark-safe one-off too):

```vue
<OriButton
    text="One teal button"
    variant="tonal"
    style="--ori-color: teal; --ori-color-on: white; --ori-color-text: oklch(from teal min(l, 0.42) c h)"
/>
```

(The `.ori-color_*` utility classes handle this for you — they set all three aliases together, which
is why they're the recommended path over the escape hatch whenever the color _is_ one of the eight
roles.)

This channel is _why_ there are no `text-color` / `bg-color` props. A prop pair like that would bypass
the variant mapping and re-introduce the manual "pick a background AND a matching text" pairing the
roles abstract away — silently stepping around the AA-asserted pairing from level 1 — and it wouldn't
stop at two props (`border-color`, `hover-color`, …). The variable pair is strictly more powerful: one
declaration, every variant, every derived state
([the recorded decision](https://github.com/markgrushevski/oriui/blob/main/DECISIONS.md)).

The honest trade-off: **contrast responsibility shifts to you.** The contrast test asserts the shipped
role pairs, not your inline values — always set `--ori-color-on` together with `--ori-color`, and pick
a pair that clears 4.5:1 (`white` on `teal` above is ~4.8:1). One more sharp edge: don't set
`--ori-color-primary-light` on the element here — nothing on the element reads it. That source token
only re-resolves into the alias up at `:root` (section 2); set directly on the element it is inert.

## 5 · Scope an override to a subtree

To restyle a _region_ — a marketing section, a settings panel, an embedded widget — set inherited tokens
(or a mode class) on a wrapper. Everything inside inherits; everything outside is untouched. The rule
for _which_ token to set: a wrapper can only feed tokens its descendants **substitute locally**.

**Color:** components bind the pair per element (`.ori-color_primary` reads
`var(--ori-color-primary)` right on the component), so repoint the **resolved role alias** on the
wrapper and every descendant that resolves primary picks it up:

```html
<section
    class="promo"
    style="--ori-color-primary: #16a34a; --ori-color-on-primary: #ffffff; --ori-color-primary-text: oklch(from #16a34a min(l, 0.42) c h)"
>
    <!-- buttons / cards in here render with the green primary; the rest of the page does not -->
</section>
```

Repoint `--ori-color-<role>-text` alongside the pair, as above — CSS custom properties don't
re-substitute on inheritance, so a descendant's `.ori-color_primary` (which reads
`var(--ori-color-primary-text)` for its non-fill/selected text) keeps the **page's** primary text tone
unless the wrapper also overrides `-text` itself; the fill background/on-color, by contrast, follows
the wrapper fine because the descendant reads `--ori-color-primary` directly.

Repointing a `*-light` / `*-dark` **source** token on the wrapper does nothing — the alias was already
resolved up at `:root`, so the wrapper's source value is never read. Setting the alias directly pins it
for the region in **both** modes; to keep a region mode-aware, wrap it in `.ori-theme_light` /
`.ori-theme_dark` and repoint the `*-light` / `*-dark` source there — that re-resolves the alias on the
wrapper, per mode.

**Radius and font-size** scope the other way around: their alias is substituted **on each component**
from the raw step (a card reads `var(--ori-size-radius_lg)` on itself), so on a wrapper you repoint
the **raw step**, not the alias:

```html
<div style="--ori-size-radius_md: 4px; --ori-font-size_md: 15px">
    <!-- panels, menus, inputs in here tighten; buttons keep their pinned `rounded` step -->
</div>
```

Or scope **mode** to a subtree with `.ori-theme_light` / `.ori-theme_dark` — the same selectors the global
`html.dark` toggle uses, but on any element:

```html
<!-- a dark callout inside an otherwise-light page -->
<aside class="ori-theme_dark">
    <!-- surface, primary, shadows all resolve to their dark values here -->
</aside>
```

To switch the whole palette to a named skin (Sumi, Cyber, …), that's a page-level toggle and a Theming
concern — see [Theming](/guides/theming#scoping-a-skin-or-mode-to-a-subtree). (Skins are authored on
`:root[data-ori-skin='…']`, so `data-ori-skin` on a non-root wrapper matches nothing today; mode scoping
via `.ori-theme_*` works anywhere.)

## 6 · Five-minute brand walkthrough

The entire job, start to finish: **set your primary (light + dark), and a radius if you want one.** Same
components, no rewrite.

Import oriUI once (the stylesheet, or the Vue package which includes it):

```ts
import '@oriui/css'; // or: import '@oriui/vue' for the Vue components
```

Then add one `:root` block to your stylesheet:

```css
:root {
    /* your brand primary, both modes, with legible on-colors */
    --ori-color-primary-light: #7c3aed;
    --ori-color-on-primary-light: #ffffff;
    --ori-color-primary-dark: #a78bfa;
    --ori-color-on-primary-dark: #1e1035;

    /* your house radius — the derived scale (xs–xl) follows proportionally */
    --ori-size-radius_md: 6px;
}
```

That's it. Every primary button, focus ring, switch, and accent across the library is now your violet, in
light **and** dark — and it stays accessible, because state is real attributes and the `on-` pairing
carries the contrast. The radius change reaches every control on a **derived** step (cards, panels,
inputs); controls pinned to another step (buttons default to `rounded`) keep theirs until you set their
`radius` prop / `ori-size-radius_md` class to `md`. No component was edited, no class was added, nothing
was forked. Start with the defaults to prototype; drop in this block when you're ready to ship — that's
_scale without rewriting_.

## Icons follow the text color

There is no separate icon-color token — an icon **is text**, as far as color flows. `.ori-icon`
resolves its color from `currentcolor`, and everything inside it paints along
(`.ori-icon > * { fill: currentcolor }`), so whatever colors the text colors the icon: a role class, a
themed button, the escape-hatch pair above, or a plain CSS `color:` on any wrapper. Inside a filled
button the icon automatically renders in the `on-` color; a standalone icon takes the same `color`
prop / `ori-color_*` class as everything else:

```html
<span style="color: teal">
    <i class="ori-icon" aria-hidden="true"><svg viewBox="0 0 24 24">…</svg></i>
    teal text, teal icon — one declaration
</span>
```

## Reading tokens from JS

CSS variables stop at the canvas edge: Konva, ECharts, WebGL painters draw outside the CSS cascade, and
`getComputedStyle().getPropertyValue('--x')` only returns the _unresolved_ `var()` chain. The headless
package ships the bridge — `useToken` / `useThemeColor` from `@oriui/headless/vue` resolve a token to
its computed value and re-resolve on every skin / mode flip:

```ts
import { useThemeColor } from '@oriui/headless/vue';

const brand = useThemeColor('primary'); // resolved --ori-color-primary; '' until mounted (SSR-safe)
watch(brand, (c) => engine.setColor(c || fallback)); // skin/mode flips re-push automatically
```

Colors-only for now — the probe resolves through the `color` property, so the token must resolve to a
`<color>`. The full pattern (seeding a canvas engine on mount, the framework-agnostic `resolveToken` /
`observeTheme` primitives, the Svelte twin) is in the
[`@oriui/headless` README](https://github.com/markgrushevski/oriui/blob/main/packages/headless/README.md#reading-tokens-from-js).

## See also

- [Design tokens](/guides/design-tokens) — the full token catalog: the neutral ramp, every role, the
  size / radius / gap / font scales, and the canonical `@layer` order.
- [Theming](/guides/theming) — switching whole palettes (named skins) and modes at runtime, and authoring
  your own skin.
- [Using the CSS layer](/guides/css) — branding without Vue, in htmx, Astro, or plain HTML.
- [Get started](/overview/get-started) · [Button](/components/button) — the per-component class reference.
