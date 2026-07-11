---
'@oriui/vue': patch
---

**Fix: a disabled OriColorPicker now also disables its hex field.** The hex `OriInput` bound only the
local `disabled` prop, not the composed `isDisabled` (local **or** field-disabled) the sliders,
eyedropper, and hidden input already use — so inside a disabled `OriField` (or any field-driven disable)
the hex text field stayed enabled and a keyboard user could type a color, blur, and mutate the picker
while it was meant to be disabled. It now binds `isDisabled`, matching the other controls.
