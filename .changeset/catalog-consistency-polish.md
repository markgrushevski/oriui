---
'@oriui/vue': patch
'@oriui/css': patch
---

Catalog consistency polish:

- **OriSlider** and **OriCombobox** gain a `#label` slot (the `label` prop is the fallback), matching
  OriField — so a standalone control can take a rich label (an icon + text) while keeping the label
  `for`/`id` and the combobox listbox `aria-labelledby` wiring intact.
- The combobox listbox and the toast card now read a baked `--ori-size-radius` alias (two-tier) rather
  than the raw scale token, so a consumer `.ori-size-radius_*` utility can retune their corners — matching
  menu / popover / card. Defaults are unchanged.
