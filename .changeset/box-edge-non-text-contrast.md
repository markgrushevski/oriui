---
'@oriui/css': minor
---

**The unchecked checkbox and radio edge is heavier, because the old one failed WCAG 1.4.11.** The box
boundary was `color-mix(in srgb, currentcolor 40%, transparent)` — measured, that fell below the 3:1
non-text minimum in **16 of 32** readings across the eight skins and both themes, worst **2.24** on
sumi light. A control's visual boundary is exactly what 1.4.11 binds, and an unchecked box is nothing
but its boundary.

It is now 60%, chosen from a sweep rather than picked: 50% still failed 2 of 32, 55% cleared
everything at 3.19 — too close to the bar for a colour derived from the ambient ink, which a custom
skin can move — and 60% clears at **3.69**. The edge stays out of the shared outline tokens on
purpose; those are tuned lighter, and this is the heaviest structural weight in the library.

New guard: `e2e/non-text-contrast.spec.ts`, a separate spec from the 4.5:1 text probe because it is a
different criterion, a different bar and a different set of elements. It measures every unchecked
boundary in all sixteen skin × theme combinations and prints the offending readings when it fails.
