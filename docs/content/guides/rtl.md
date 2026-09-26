---
title: Writing direction (RTL)
---

# Writing direction (RTL)

oriUI's style layer is written in **logical properties** — `margin-inline`, `border-block`,
`inset-inline-end`, `position-area` — so it follows the writing direction the platform gives it. You
turn RTL on the platform way, and the layer mirrors itself:

```html
<html dir="rtl">
    …
</html>
```

```html
<!-- or one region, inside an otherwise-LTR page -->
<section dir="rtl">…</section>
```

There is no `dir` prop to thread through the styled components. Arrow keys follow the direction too
(see [Keyboard and text](#keyboard-and-text)).

Everything on this page is **measured**, not intended. `e2e/rtl.spec.ts` renders the same markup under
`dir="ltr"` and `dir="rtl"` in real Chromium and asserts bounding boxes and computed values — never
class names, because a logical property only resolves against a real writing direction in a real
engine.

## What mirrors

| Component               | The measured contract                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vertical tabs           | The tab list leads on the inline-start side, its 1px rule faces the panel, and the selected-tab indicator lands on that **same** edge.                       |
| Vertical divider        | The rule is drawn strictly between its two siblings, whichever way round they run.                                                                           |
| Floating badge          | The badge centres on the anchor's inline-**end** top corner and overhangs outward — physically right in LTR, physically left in RTL. It never folds back in. |
| Anchored panels         | The whole `.ori-anchored_*` grid is logical. See [placement names](#placement-names-read-physical-behave-logical) below.                                     |
| Toolbar                 | Children run in the inline direction; the separator stays between them with a symmetric `margin-inline` gap.                                                 |
| Select / combobox field | The chevron and the padding reserved for it land on the same inline-end side, so the value text never runs under it.                                         |
| Switch                  | The thumb rests at the inline-start end when off and travels to the inline-end end when on, staying inside its track in both directions.                     |
| Toast accent stripe     | The 4px accent border sits on the leading edge — left in LTR, right in RTL.                                                                                  |

## What stays physical — on purpose

Not everything that _can_ mirror _should_. Three things are deliberately pinned to the screen, and the
same suite asserts they stay that way so a future "helpful" logical swap has to be a deliberate one.

- **The six toaster corners.** `ori-toaster_top-left` … `ori-toaster_bottom-right` name a **screen**
  corner, not an inline position, so a left-pinned toaster is on the left in both directions. The
  enter animation follows the corner it is pinned to, sliding in off that physical edge. A toaster
  with **no** corner modifier is the one case with no physical edge to follow — it enters from the
  inline-end side, so that one does read the direction.
- **The colour-picker value plane.** The saturation × brightness area is a value plane, not text: its
  gradient runs to the physical right, `useColorPicker` places the thumb with a physical `left`
  percentage, and the pointer handler measures `clientX - rect.left`. All three are physical and must
  stay consistent with one another, so full saturation is the physical right edge in both directions.
- **The safe-area utilities.** `.ori-safe-area`, `.ori-safe-area_inline` and friends pass
  `env(safe-area-inset-*)` through to physical padding. A notch and a home indicator are physical
  hardware; mirroring them would move the padding away from the cutout.

## Placement names read physical, behave logical

The placement modifiers on `.ori-anchored` — shared by Popover, Menu, Tooltip and Combobox — have
physical-sounding names and **logical** behaviour, because `position-area` is a logical property:

| Class                        | Resolves to                   | LTR                      | RTL                          |
| ---------------------------- | ----------------------------- | ------------------------ | ---------------------------- |
| `.ori-anchored_left`         | `position-area: inline-start` | left of the trigger      | **right** of the trigger     |
| `.ori-anchored_right`        | `position-area: inline-end`   | right of the trigger     | **left** of the trigger      |
| `.ori-anchored_bottom-start` | `block-end span-inline-end`   | aligns to the left edge  | aligns to the **right** edge |
| `.ori-anchored_bottom-end`   | `block-end span-inline-start` | aligns to the right edge | aligns to the **left** edge  |
| `.ori-anchored_bottom`       | `block-end`                   | centred on the trigger   | centred on the trigger       |

So `placement="left"` means **inline-start**, and reads as "before the trigger in reading order". The
bare sides stay centred on the trigger in both directions, and the gap is a `margin-inline-*`, so it
opens on the correct side too.

## The slider family follows the engine

A native `<input type="range">` reverses itself under `dir="rtl"` in Chromium: click a quarter of the
way in from the physical left and the control resolves a value **above** the midpoint, because the
engine now treats the right edge as the minimum. That is the platform's behaviour, not oriUI's — so
the paint oriUI draws over the control follows it rather than arguing with it. Measured from the real
pixels:

- the **fill** starts at the end the engine treats as the minimum, so fill and thumb always agree;
- the **hue** spectrum runs along the engine's own axis;
- the **alpha** ramp is opaque at the end the engine treats as the maximum.

The colour picker inherits all three through the hue and alpha sliders it composes — which is a
separate question from its value plane above, and resolved the other way.

## Keyboard and text

Arrow keys in a horizontal row follow the layout: in RTL the first item is on the right, so
`ArrowLeft` moves to the next one. Tabs, Toolbar and the color picker's presets read the direction
they are laid out in when a key is pressed, so an ancestor `dir="rtl"` is all they need.
`useTabs` and `useToolbar` also take a `dir` option (and `<OriToolbar>` a `dir` prop) that sets
the direction on the widget itself. `e2e/rtl-keyboard.spec.ts` checks this in Chromium. Vertical
navigation (`ArrowUp` / `ArrowDown`) and `Home` / `End` do not depend on direction.

Direction is not **text**: oriUI ships no translations and no message catalogue. Most built-in strings are
props with English defaults you override — `OriSpinner` / `OriProgress` take `label` (`'Loading'`),
`OriAlert` and `OriTag` take `closeLabel` (`'Dismiss'` / `'Remove'`). A few are hardcoded and cannot
be localised today: `<OriDialog>`'s close button (`aria-label="Close"`), `<OriToast>`'s dismiss
button, and the colour picker's channel labels.

## See also

- [Using the CSS layer](/guides/css) — the standalone classes these blocks come from.
- [Customization](/guides/customization) — scoping tokens to a subtree, the same way `dir` scopes.
- [Toast](/components/toast) · [Popover](/components/popover) · [Slider](/components/slider) ·
  [Color picker](/components/color-picker) — the components with a direction story of their own.
