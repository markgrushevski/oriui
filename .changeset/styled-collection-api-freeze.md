---
'@oriui/vue': patch
---

**The styled layer's public API, converged before the freeze.** Five shapes that a 1.0 would have
frozen as-is — a collection item that disagrees with its four siblings, a slot namespace that can
collide with itself, a prop bag that does not type-check where it is documented to be spread, and
thirteen exported types nothing consumes. Each is breaking to change after 1.0 and free to change now,
so they change now. Migration lines are inline below.

**`AccordionItem.title` is now `AccordionItem.label`.** Four of the five collection-item shapes spelled
the display string `label` (`TabItem`, `SelectOption`, `RadioOption`, `ComboboxItem`, and `MenuItem`'s
optional one); `AccordionItem` alone spelled it `title` for the identical concept. One shape across the
catalog means one source array can be mapped into whichever component renders it, instead of a rename
per component.

```diff
- const items = [{ value: 'shipping', title: 'Shipping' }]
+ const items = [{ value: 'shipping', label: 'Shipping' }]
```

TypeScript rejects the old key outright. For callers it cannot reach — plain JS, JSON from an API —
`<OriAccordion>` warns in DEV naming the offending items and the rename, because the symptom otherwise
is an empty `<summary>` with nothing to grep for. The warning is compiled out of production builds.
The `#title` slot keeps its name: it names a region of the markup (and the `.ori-accordion__title`
element), not the item field.

**`<OriTabs>` panel slots are now named `#panel-<value>`, not `#<value>`.** Panel slot names come from
caller data — a tab's `value` — while `tab` and `default` are the component's own reserved slots, and
Vue resolves both from one flat namespace. A tab whose value was literally `"tab"` therefore rendered
the consumer's `#tab` template (the label renderer) inside its panel, twice over, with the panel's real
content unreachable. Prefixing moves data-derived names into a namespace of their own, where no caller
value can collide with a reserved one.

```diff
- <template #account>…</template>
+ <template #panel-account>…</template>
```

The `#tab` and `#default` slots are unchanged. A stale `#<value>` slot is a silent miss — Vue never
warns about a slot nobody consumes — so OriTabs warns in DEV when it sees one, naming the new spelling.

**`<OriPopover>` splits the panel's `role` from the trigger's `aria-haspopup`.** They were one value:
`aria-haspopup` mirrored `role` unconditionally. But the two are not the same vocabulary —
`aria-haspopup` accepts exactly `dialog | menu | listbox | tree | grid`, while a popover panel is
legitimately a `group`, a `region` or a `tooltip`. So `<OriPopover role="group">` emitted
`aria-haspopup="group"`, which is not a valid token, and typed the whole `#trigger` bag as carrying
`'aria-haspopup': string` — which Vue's `ButtonHTMLAttributes` rejects, so `v-bind="props"` on a
`<button>`, the documented usage, did not type-check. The one real consumer worked around it with
`as Record<string, unknown>`, discarding type-checking on the entire bag.

`role` stays `string` (narrowing it would forbid the valid panel roles above). A new optional
`haspopup` prop carries the trigger's hint, typed as the ARIA popup union. It defaults to `role` when
`role` happens to be one of the five popup types — so `role="menu"` still needs no second prop — and to
`'dialog'` when it is not. Existing markup keeps its output except where the old output was invalid.

**Thirteen unused types are removed and the rest are flattened.** `export * from './types'` made every
name in `packages/vue/src/types.ts` public API. `Sizes`, `BlockSize`, `ScreenSize`, `ActionSpaceSize`,
`Size`, `CenterPosition`, `InlinePosition`, `BlockPosition`, `CustomPosition`, `Position`,
`AnchoredSide`, `SeverityColor` and `DeepPartial` were consumed by nothing — no component, no test, no
docs page — and are gone. The seven that survive (`ActionSize`, `GapSize`, `RadiusSize`,
`CenteredPosition`, `AnchoredPlacement`, `ThemeColor`, `Variant`) are unchanged in meaning, but are now
written as the string-literal unions they always were, instead of an `interface` whose keys were read
back out with `keyof` — a record whose values nothing ever used. `AnchoredSide` still exists as a
private building block of `AnchoredPlacement`; it is simply no longer exported on its own.

**`<OriMenu>`'s `#trigger` slot now exposes `open` alongside `props`**, matching `<OriDialog>`'s trigger
slot, so the two overlays read alike at the call site (`#trigger="{ props, open }"` to rotate a caret or
swap a label). Additive; the `props` bag already carried `aria-expanded` for assistive tech, and this
exists so a caller can render with the state instead of parsing an ARIA string out of the bag.

New tests pin all five: the reserved-slot collision (a tab valued `"tab"` and one valued `"default"`),
both DEV migration warnings and their false-positive guards, the `aria-haspopup` fallback across every
role in and out of the popup vocabulary, and — in `tests/types.test.ts` — the exported type surface
itself, including an assertion that the popover trigger bag is assignable to `ButtonHTMLAttributes`,
which fails against the previous version.
