---
'@oriui/vue': patch
'@oriui/headless': patch
'@oriui/css': patch
---

OriColorPicker polish + SSR-safety:

- The preset listbox seeds its roving Tab stop onto the **selected** swatch (APG) and follows external
  colour changes, instead of always starting at index 0.
- The hue slider caps at **359** so dragging to the end no longer wraps the thumb back to 0; the hue and
  alpha sliders announce a self-describing `aria-valuetext` (`225°` / `50%`).
- An invalid hex entry surfaces an **accessible error** (`role="alert"` + `aria-describedby`), not just a
  silent `aria-invalid` flip.
- The eyedropper trigger is **SSR-safe** — feature-detected after mount, so it no longer causes a
  hydration mismatch — and is sized to match the 2rem preview swatch.
- The alpha **checkerboard is theme-aware** (a mid-neutral in dark mode rather than a glaring light grid),
  the area / hue / alpha focus rings use a neutral high-contrast double ring, and the preset chips get
  more gap so the selected ring clears its neighbour.
- Panel corners now read component-local radius aliases; dropped the inert `label` option from
  `useColorPicker`.
