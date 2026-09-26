---
'@oriui/headless': minor
'@oriui/vue': minor
'@oriui/css': minor
---

**Toasts no longer disappear while someone is reading or using them, and a toast can carry an action.**

- **Pause.** `<OriToaster>` stops every countdown while the pointer or keyboard focus is on the toasts,
  or while the page is hidden, and then continues with the time that was left (WCAG 2.2.1). `useToast()`
  gains `pause()` and `resume()` for a renderer of your own.
- **Action.** `toast({ text, action: { label: 'Undo', onClick } })` renders an action button. Pressing it
  runs `onClick` and dismisses the toast. `OriToast` gains an `actionLabel` prop and an `action` event,
  and `@oriui/css` an `.ori-toast__action` part.
- **Reachable by keyboard.** The toaster is now a labelled region, "Notifications (F8)" by default, and
  `F8` moves focus to it. Both are props: `label` and `hotkey` (`''` turns the hotkey off).
- `@oriui/css`'s `toast.css` now imports `button.css`, so the entry stays self-contained.
