---
'@oriui/vue': patch
'@oriui/css': patch
'@oriui/headless': patch
---

**Toast: an alignment axis, and the queue stops overriding the component's own `closable` default.**

`OriToaster` and `OriToast` gain `align` (`'start'` — today's look — or `'center'`). Centred alignment
centres the body on the **card**: the dismiss button leaves the flex flow and the card reserves equal inline
room on both sides. Done naively, `text-align: center` centres the text on the space the button leaves
behind, which lands visibly off-centre — that asymmetry is the reported defect, and `e2e/toast-align.spec.ts`
measures the rendered centres in real Chromium, in both writing directions, with a counter-example test that
fails if the compensation is ever removed. A leading icon deliberately stays in flow.

`closable` is no longer stamped onto every queued toast. `OriToast` declares `closable = false`, but the
queue forced `true` onto everything it enqueued, so the component default was unreachable and a caller who
said nothing got a dismiss button anyway. The queue now leaves the option alone — with one exception it is
worth keeping: a toast with `duration: 0` never auto-dismisses, so it opts itself in rather than becoming
impossible to remove.

Migration: if you relied on every `useToast()` toast having a close button, pass `closable: true` (or set it
once at your call sites). The behaviour change is visible, not silent.
