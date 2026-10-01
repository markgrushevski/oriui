---
'@oriui/vue': minor
'@oriui/css': minor
---

**New: `OriDrawer`, a panel docked to an edge of the viewport.**

`<OriDrawer v-model:open="open" side="end" title="Filters">` opens a native `<dialog>` docked to `side`:
`start`, `end` (the default), `top` or `bottom`. `start` and `end` are logical and swap sides in RTL.

- **Modal by default:** a backdrop, a focus trap, an inert page, Escape and a press on the backdrop close
  it, and focus returns to the trigger. `:modal="false"` leaves the page live: the drawer still opens in
  the top layer, and Escape or a press outside closes it.
- **Sizes:** a side drawer is 20rem wide, and on a phone leaves a 3rem strip of the page in view; a top
  or bottom drawer takes its content height up to 85% of the screen, at most 40rem wide. Set
  `--ori-drawer-size` on the element to change either.
- **Slots:** `#trigger="{ props, open }"` (the props toggle the drawer), the body, `#title` and `#footer`.
- `@oriui/css` adds `drawer.css`: `.ori-drawer`, `.ori-drawer_<side>` and the `__content`, `__header`,
  `__title`, `__close`, `__body` and `__footer` parts. It slides in from its edge and stays still under
  `prefers-reduced-motion: reduce`.
