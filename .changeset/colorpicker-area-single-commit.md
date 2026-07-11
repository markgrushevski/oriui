---
'@oriui/css': patch
---

**Fix: a pointer drag/click on the OriColorPicker saturation×brightness area now commits once.** The two
visually-hidden `<input type="range">` channels covered the area without `pointer-events: none`, so a
pointer press landed on the native range too — its `input` committed, and the area's own pointer-release
committed again, so a single click/drag recorded **two** undo entries instead of one (violating the
documented commit-on-release contract). The channels are now `pointer-events: none`: the area `<div>` is
the sole pointer surface (2D drag), the channels stay the keyboard / assistive-tech surface. Covered by a
new real-Chromium e2e (`e2e/colorpicker-pointer-drag.spec.ts`) that happy-dom couldn't exercise.
