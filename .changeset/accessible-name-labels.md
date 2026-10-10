---
'@oriui/vue': minor
'@oriui/headless': minor
---

**Every built-in accessible name can be translated.** The color picker and the combobox were the last
components with English names fixed in the code.

- `OriColorPicker` and `useColorPicker` take `labels`, the names of the parts: `area`, `saturation`,
  `brightness`, `hue`, `alpha`, `hex`, `presets` and `eyedropper`. Pass only the ones you translate; the
  rest keep their English defaults. `useColorPicker` also returns the resolved `labels`, so a picker you
  render yourself names its hue, alpha, hex and eyedropper parts from the same place.
- `OriCombobox` and `useCombobox` take `labels` for the trigger (`open`, `close`) and the clear button
  (`clear`). The core `combobox.connect` takes them as an optional fourth argument.
- New exported types: `ColorPickerLabels` and `ComboboxLabels`.
