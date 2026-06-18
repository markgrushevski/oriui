---
title: Customization
---

# Customization

Make it yours — without authoring a whole skin. Most products need one thing: _their_ brand color and
_their_ corner radius on top of accessible, ready-made components. oriUI lets you do that by repointing
a handful of design tokens — a few CSS custom properties in your own stylesheet, no rewrite, no fork.
This is the **prototype fast, scale without rewriting** payoff: the same `<OriButton>` you shipped on
day one becomes _on-brand_ by the time you ship to users, and nothing about the component changes.

This page is the tweaking guide — **override a token globally**, **style one instance**, **scope an
override to a subtree**, and a **5-minute brand walkthrough**. Authoring a complete named skin and
switching modes is [Theming](/guides/theming); the exhaustive token inventory is
[Design tokens](/guides/design-tokens); the standalone-class story is [Using the CSS layer](/guides/css).

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

> One sharp caveat about _where_ a token is declared. Layer precedence only breaks ties between
> declarations on the **same** element — it does **not** make an inherited `:root` value win over a value
> a class sets directly on an element. That is why a **global** override works from `:root` for **color**
> (the active alias `--ori-color-primary` is declared _and resolved_ at `:root`, so repointing its
> `*-light` / `*-dark` source there re-resolves it) but **not** for **radius and font-size** (their scales
> live on a utility base class, not at `:root`) — see
> [that section](#radius-and-font-size-not-globally-overridable). A **subtree** override is different
> again: there you repoint the **resolved alias** on the wrapper, not the source — see
> [Section 3](#3-scope-an-override-to-a-subtree).

> For a **global** brand color, override the `*-light` / `*-dark` **source** tokens (e.g.
> `--ori-color-primary-light`) in `:root` — not the resolved alias `--ori-color-primary`, which the mode
> selectors repoint per mode (overwrite it at `:root` and you flatten dark mode). For a **single element
> or a region**, it is the reverse — you target the resolved alias (Sections 2 and 3).

## 1 · Override a brand color globally

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
(≥ 4.5:1) yourself, the way the built-in skins do.

This works because the active alias `--ori-color-primary` is declared **and resolved at `:root`** — it
reads `var(--ori-color-primary-light)` there (see
[`_themes-color-tokens.css`](/guides/design-tokens#colour-three-tiers)). Override the source at `:root`
and the alias re-resolves, inheriting your value into every component. **Radius and font-size do not work
this way** — read the next section before you reach for the same pattern on those.

## Radius and font-size — _not_ globally overridable from `:root`

The size scales behave differently from color, and it matters. The raw radius and font-size steps
(`--ori-size-radius_*`, `--ori-font-size_*`) are **not** declared at `:root`. They are declared directly
on their utility base classes — `--ori-size-radius_md: 8px` lives on `.ori-size-radius`, and
`--ori-font-size_md: 16px` lives on `.ori-font-size`.

Every styled control carries that base class. So if you write a top-level `:root { --ori-size-radius_md:
4px }`, the element's **own** `.ori-size-radius` declaration (`8px`) shadows the value it would otherwise
inherit from `:root`. A value set directly on an element always beats an inherited value — and `@layer`
does not change that, because layer precedence only resolves ties between declarations on the _same_
element, not between an inherited value and a directly-set one. The `:root` override is silently ignored
on every component.

There are two correct ways to change radius or font-size:

**A · Repoint the step on the base class itself.** Redeclare the scale on `.ori-size-radius` /
`.ori-font-size`. Because your rule is unlayered, it wins over oriUI's class declaration, and now _that_
is the value every component reads:

```css
/* tighter corners everywhere a component resolves the md radius */
.ori-size-radius {
    --ori-size-radius_md: 4px;
}

/* a roomier default body size */
.ori-font-size {
    --ori-font-size_md: 18px;
}
```

**B · Set it per instance** via the utility class or the Vue prop (no override needed) — covered in
[Section 2](#2-style-one-instance).

> Radius caveat worth internalizing: repointing `_md` only moves components that resolve the **md** step.
> Several controls pin a different step on purpose — **buttons default to `rounded`** (the `9999px` pill),
> so an `_md` repoint does nothing to a default button. To bring a control onto your house radius, set its
> `radius` prop / `ori-size-radius_md` class to `md`, or repoint the step it actually uses.

## 2 · Style one instance

When you want to change _one_ component, not the whole library, reach for the utility classes (CSS) or the
matching props (Vue) — no token override needed. The Vue props map 1:1 to the class pairs.

| Axis    | Utility class pair                      | Vue prop  |
| ------- | --------------------------------------- | --------- |
| Color   | `ori-color` + `ori-color_*`             | `color`   |
| Size    | `ori-size-action` + `ori-size-action_*` | `size`    |
| Radius  | `ori-size-radius` + `ori-size-radius_*` | `radius`  |
| Variant | `ori-variant` + `ori-variant_*`         | `variant` |

This table is a quick orientation map; the full per-component class reference lives on each component page
— see [Button](/components/button) for the canonical list.

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
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_primary">Brand</button>
<button class="ori-button … ori-variant ori-variant_tonal ori-color ori-color_danger">Danger</button>
<button class="ori-button … ori-size-radius ori-size-radius_sm ori-variant_outline">Squared</button>
<button class="ori-button … ori-size-action ori-size-action_lg ori-variant_fill">Large</button>
```

::

For a truly one-off tweak, repoint the **resolved alias** on the element itself. `--ori-color` (with its
`--ori-color-on` partner) is what every variant actually reads, so it recolors just this button:

```html
<button class="ori-button ori-variant ori-variant_fill" style="--ori-color: #16a34a; --ori-color-on: #ffffff">
    One green button
</button>
```

Don't set `--ori-color-primary-light` on the element here — nothing on the element reads it. That source
token only re-resolves into the alias up at `:root` (Section 1); set directly on the button it is inert.

## 3 · Scope an override to a subtree

To restyle a _region_ — a marketing section, a settings panel, an embedded widget — set inherited tokens
(or a mode class) on a wrapper. Everything inside inherits; everything outside is untouched.

The catch is the same one from the radius section: a wrapper can only change tokens its descendants
**inherit and read directly**. Components read the **resolved alias** (`--ori-color`, bound from
`--ori-color-primary` by the color class), so repoint _that_ on the wrapper and every descendant picks it
up. Repointing a `*-light` / `*-dark` **source** token on the wrapper does nothing — the alias is resolved
up at `:root`, so the wrapper's source value is never read (the same shadowing that bites radius and
font-size).

Repoint the **resolved alias** on a wrapper — every descendant that resolves primary inherits it:

```html
<section class="promo" style="--ori-color-primary: #16a34a; --ori-color-on-primary: #ffffff">
    <!-- buttons / cards in here render with the green primary; the rest of the page does not -->
</section>
```

Setting the alias directly pins it for the region in **both** modes. To keep a region mode-aware, wrap it
in `.ori-theme_light` / `.ori-theme_dark` and repoint the `*-light` / `*-dark` source there — that
re-resolves the alias on the wrapper, per mode.

> You **cannot** scope radius or font-size by setting `--ori-size-radius_md` / `--ori-font-size_md` on a
> wrapper — the component's own `.ori-size-radius` / `.ori-font-size` class shadows the inherited value.
> To vary radius for a region, set the per-instance `radius` prop / `ori-size-radius_*` class on the
> components in it, or scope a `.ori-size-radius { … }` rule to that region's selector.

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

## 4 · Five-minute brand walkthrough

The entire job, start to finish: **set your primary (light + dark), and a radius if you want one.** Same
components, no rewrite.

Import oriUI once (the stylesheet, or the Vue package which includes it):

```ts
import '@oriui/ui/css'; // or: import '@oriui/ui' for the Vue components
```

Then add this to your stylesheet. The primary goes in a `:root` block (color is `:root`-declared, so it
inherits library-wide); the radius goes on the `.ori-size-radius` base class (its scale lives there, not
at `:root`):

```css
/* your brand primary, both modes, with legible on-colors */
:root {
    --ori-color-primary-light: #7c3aed;
    --ori-color-on-primary-light: #ffffff;
    --ori-color-primary-dark: #a78bfa;
    --ori-color-on-primary-dark: #1e1035;
}

/* your house radius — for every control that resolves the md step */
.ori-size-radius {
    --ori-size-radius_md: 6px;
}
```

That's it. Every primary button, focus ring, switch, and accent across the library is now your violet, in
light **and** dark — and it stays accessible, because state is real attributes and the `on-` pairing
carries the contrast. The radius change reaches every control that resolves the **md** step; controls
pinned to another step (buttons default to `rounded`) keep theirs until you set their `radius` prop /
`ori-size-radius_md` class to `md`. No component was edited, no class was added, nothing was forked. Start
with the defaults to prototype; drop in this block when you're ready to ship — that's _scale without
rewriting_.

## See also

- [Design tokens](/guides/design-tokens) — the full token catalog: the neutral ramp, every role, the
  size / radius / gap / font scales, and the canonical `@layer` order.
- [Theming](/guides/theming) — switching whole palettes (named skins) and modes at runtime, and authoring
  your own skin.
- [Using the CSS layer](/guides/css) — branding without Vue, in htmx, Astro, or plain HTML.
- [Get started](/overview/get-started) · [Button](/components/button) — the per-component class reference.
