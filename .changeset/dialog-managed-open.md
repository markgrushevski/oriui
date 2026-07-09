---
'@oriui/vue': minor
---

OriDialog: managed open state — add `v-model:open` (a controlled `open` prop + an `update:open` emit) and a `close` emit. The dialog now drives both uncontrolled (`defaultOpen` + the `#trigger` slot — unchanged) and host-controlled, so a parent can open/close it from its own ref and react to every close (Esc, backdrop, the × button, or its own state). Backward compatible — omitting `:open` keeps the previous behaviour.
