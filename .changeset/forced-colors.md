---
'@oriui/css': patch
---

Components stay usable in forced-colors mode (Windows contrast themes). The browser repaints backgrounds in
the page color there and drops shadows and gradients, which hid every state shown by fill alone. These now
use system colors:

- a pressed toggle button, the selected segment, the current list or table row and the highlighted menu item
  or combobox option take `Highlight` / `HighlightText`;
- the switch, the slider and the progress bar get an outline, with the fill or the "on" state in `Highlight`;
  the radio dot and the menu and toolbar separators are drawn in the text color;
- a dialog, a drawer, a tooltip bubble, an avatar and an `.ori-surface` without `bordered` keep an edge, and
  the spinner keeps its gap, so it visibly turns;
- the color picker's area, swatch, presets and hue and alpha tracks keep their colors.

Nothing changes outside forced colors. Nothing to migrate; a consumer rule that added a forced-colors border
to an unbordered surface can be removed.
