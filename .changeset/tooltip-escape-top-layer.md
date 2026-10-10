---
'@oriui/vue': patch
---

**Escape closes the popover a tooltip's trigger opened, in one press.** Since rc.23 a tooltip consumes the
Escape that dismisses it, so a dialog or drawer around it stays open. But it also took Escape while a
popover its own trigger had opened was on top, and while its bubble was not visible at all, so that
popover needed a second Escape. A tooltip now takes the key only when its bubble is showing and no open
popover or modal dialog outside it sits above it.
