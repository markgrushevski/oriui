---
'@oriui/css': patch
'@oriui/vue': patch
---

**Two `OriDialog` fixes: the page no longer scrolls under an open modal dialog, and a titleless dialog keeps
your `aria-labelledby`.**

- **Scroll lock.** `showModal()` makes the page inert but leaves it scrollable, so a wheel over the
  backdrop scrolled the page behind an `OriDialog`. `dialog.css` now sets `overflow: hidden` on the root
  while a `.ori-dialog` is open as a modal. On systems with classic scrollbars the dimmed page shifts by
  the scrollbar's width while the dialog is open.
- **Name.** Without a `title` or `#title`, the dialog still pointed `aria-labelledby` at a title that was
  not rendered, and that reference replaced an `aria-labelledby` you passed, leaving the dialog with no
  accessible name. It is now dropped when there is no title, so yours applies.
