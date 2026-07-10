---
'@oriui/headless': minor
'@oriui/vue': minor
---

ColorPicker — an accessible, dependency-free color picker.

- **`@oriui/vue`**: `OriColorPicker` — an inline panel with a 2D saturation×brightness area, a hue slider (reusing OriSlider), a hex field (reusing OriInput), and optional preset swatches (a roving listbox). `v-model` is a lowercase color string; `format` selects `hex` / `rgb` / `hsl`; `update:modelValue` streams live and `change` commits once per interaction (one undo entry), like OriSlider. Slots: `#swatch`, `#preset`. Compose it into `OriPopover` for a swatch-triggered flow.
- **`@oriui/headless`**: `useColorPicker` (Vue) — the compositional behaviour over a new zero-dependency sRGB color engine (`hex↔rgb↔hsv↔hsl`, loose parse, WCAG-luminance ink) and 2D-area math, kept out of the core `.` budget (reachable only from `./vue`). The 2D area is two visually-hidden native `<input type="range">` (one per axis) — real `role="slider"`, focus, and value announcements, with the arrow keys routed in 2D.

v1 is hex6 (opaque); alpha (`#rrggbbaa`), an eyedropper, a format switcher, per-channel inputs, and a color wheel are deferred to v2 (the internal model already carries alpha, so those are additive).
