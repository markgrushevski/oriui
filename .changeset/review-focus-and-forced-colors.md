---
'@oriui/css': patch
---

Focus, forced colors and a consistent shape for overlays:

- **Focus rings stay visible on pale roles.** Focus rings, the tab indicator and the focused field edge are
  drawn in the role's text tone instead of its fill. A pale role's fill (`secondary`, `surface`) is under
  3:1 against the page. The slider thumb gets a solid ring instead of a 35% tint.
- **Forced colors.** The selected tab keeps its indicator in the system's selection color. A focus ring on
  the selected segment, a pressed button, the current list row or a color preset takes a system color.
- **`OriDialog` and `OriDrawer` share one shape:**
    - the `--ori-size-radius` token instead of a fixed 14px;
    - sizes in rem, so they scale with the user's font size;
    - the close button at the end, with a focus ring and a 1.5rem target;
    - a hairline ring that edges the panel on a dark page.
- **One disabled opacity per kind.** Actions and items use 0.45, field controls 0.55: `.ori-menu__item` was
  0.4, and the slider and color picker were 0.5.
- **Separators** in menus and toolbars use `--ori-color-outline`. The radio group's label is sized like
  every other field label.
