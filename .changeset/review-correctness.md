---
'@oriui/vue': patch
'@oriui/headless': patch
---

Correctness and accessibility fixes:

- **Development warnings reach your app.** Our library build compiled every development warning out of
  `@oriui/vue`: a missing accessible name, a `#panel-<value>` slot that matches no tab or item. They now
  depend on `process.env.NODE_ENV`, which your bundler sets, so they show in development and are dropped
  from your production build. The two warnings that only named pre-1.0 renames (a bare `#<value>` tab slot,
  an accordion item passing `title`) are gone.
- **Escape closes one layer at a time.** Pressing Escape on a tooltip inside a dialog or drawer dismisses the
  tooltip and leaves the dialog or drawer open. A non-modal `OriDrawer` also stays open when Escape closes a
  popover inside it.
- **Toolbar items named by their tooltip** when the slot holds an icon font: text inside `aria-hidden`
  (`<span aria-hidden="true">format_bold</span>`) is not a visible name.
- **`OriTable`** that scrolls without a caption names its scroll region after the table's `aria-label` or
  `aria-labelledby`. If the table has no name, the box is still a tab stop but no longer an unnamed region.
- **A disabled `OriListItem` link** keeps the link role, so it is announced as an unavailable link.
- **`OriField` around a radio group, segmented control or color picker** renders no label `for` in
  server-rendered HTML. It used to point at an element that does not exist.
- **`OriDrawer`** is no longer described by its whole body: a screen reader announces the title on open
  instead of reading out every filter. Pass `aria-describedby` to describe it. Its first focus skips
  disabled and hidden controls.
