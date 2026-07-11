---
'@oriui/vue': patch
---

**OriCombobox: keyboard users can now clear a selection.** The `clearable` clear button is a pointer
affordance (`tabindex="-1"`), leaving keyboard-only users with no way to remove a committed selection
(WCAG 2.1.1). Pressing **Escape** while the listbox is closed now clears the selection when `clearable`
is set; Escape while the listbox is open still just closes it.
