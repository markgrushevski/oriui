---
'@oriui/vue': patch
---

**Fix: `OriSlider`'s fill and readout follow the thumb again.** They were computed from `modelValue`,
which the browser's own thumb does not wait for — so whenever the prop did not come back, the three went
out of sync. Measured in the component: drag to 5 with `:model-value="75"` and no handler and the DOM
value is `5`, while `--ori-slider-pct` stays `75%` and `showValue` prints `75`. An unbound
`<OriSlider />` was worse: the thumb moved and the fill sat at `0%` forever.

Both are realistic. Every live example on the docs site passes a one-way `:model-value`, and a bare
`<input type="range">` works without any binding at all — which is the promise the rest of this component
keeps, since it is native-first by design.

The value now mirrors the element: an internal ref tracks what the input actually holds, an incoming
`modelValue` writes into it, and the fill, the readout and the emitted value all read the mirror. A
parent that updates late (a debounced handler) no longer fights the drag, and `v-model` is unchanged —
a parent update still wins, which is pinned by a test alongside the other two modes.
