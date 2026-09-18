---
'@oriui/vue': patch
---

Every collection-item type is now exported from the entry its component comes from, so a consumer can
annotate the array they are about to pass instead of inlining a shape that will drift from ours:
`AccordionItem`, `RadioOption`, `SelectOption` and `TabItem` were local interfaces inside their SFCs
and are now public, and `MenuItem` — which `menu.md` had been naming in the props table all along — is
re-exported from `@oriui/vue`, mirroring the `ComboboxItem` re-export the combobox barrel already had.
Type-only additions: no runtime, no output and no shape changes.

`TabItem` existed under one name in both packages with two different shapes — `@oriui/headless`'s
behaviour-only `{ value; disabled? }` and the styled component's `{ value; label; disabled? }`. They
describe the same thing (`<OriTabs>` hands its `tabs` array straight to `useTabs`), so the styled one
now **derives** from the headless one — `interface TabItem extends HeadlessTabItem { label: string }`
— rather than redeclaring it. The resolved shape is identical to before; what changes is that the two
names are no longer independent, so they cannot drift apart once 1.0 freezes them. Renaming either
side was the alternative and was rejected: `@oriui/headless` already publishes `TabItem` from its Vue,
Svelte and React entries, and renaming the styled one would break the `ComboboxItem` / `MenuItem` /
`ToastItem` naming symmetry consumers see on `@oriui/vue`.
