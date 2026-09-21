---
'@oriui/vue': minor
'@oriui/css': minor
---

**`variant="plain"` is now `variant="quiet"`, and its fade is the one that measures AA.**

The name moved because `plain` means two different things in the libraries that ship it — "unstyled"
in Chakra v3, "tinted" in Element Plus — while Adobe Spectrum's `isQuiet` names exactly this
treatment: the quietest step, minimal chrome. `.ori-variant_plain` → `.ori-variant_quiet`.

The fade moved because 0.5 was a guess and it failed WCAG AA on an **enabled** control (ORI-I-91,
worst reading 2.33:1). The exemption the code leaned on covers INACTIVE controls; a `quiet` button is
clickable. The replacement was solved rather than picked: for every role × skin × theme, the minimum
alpha that keeps 4.5:1 was computed from the composite the browser actually performs
(`fg*a + bg*(1-a)` in sRGB). 0.5 left **95 of 96** readings below AA, 0.75 left 23, **0.81 is the
exact edge**, and **0.85** clears every reading with a worst of 4.95 — confirmed against the real
rasteriser in `e2e/text-contrast.spec.ts`, which now **asserts** the quiet probe instead of excluding
it as "intentionally muted".

What the variant is for is unchanged, and is what separates it from `text`: the `quiet` mapping
paints **no background of its own in any state**, where `text` paints a 10% role tint on hover and
active. (A pressed toggle still gets a background — that is a cross-variant STATE rule, not part of
the variant.) `quiet` restores
full opacity on hover / `:active` / `[data-active]` as before.
