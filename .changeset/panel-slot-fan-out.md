---
'@oriui/vue': minor
---

**A shared panel template is no longer duplicated into every panel — and `OriAccordion` gained
per-section slots.** Two entries of the same defect, fixed in the shapes their components allow.

**`OriTabs`** — the scoped `#default="{ tab }"` fallback used to render into every panel, so a
template that ignored its scope was multiplied, `id` attributes included. With two tabs and a login
form in `#default` the form existed twice, and `document.getElementById('email')` — therefore
`<label for>` — resolved to the copy in the **hidden** panel whenever the active tab was not the
first one, pointing the visible form's labels at inputs nobody could reach.

The fallback now renders into the **active panel only**: one instance, always visible, and the
`{ tab }` it hands out is always the selected tab. One panel, one content is now the rule for every
slot in the component. What it costs: uncontrolled DOM state inside the shared template (an unsent
draft, a scroll position) does not survive a tab switch — use `#panel-<value>` for that, which
renders into its own panel whether or not that tab is selected.

**`OriAccordion`** — gained `#panel-<value>` slots, the same vocabulary and the same `panel-` prefix
rationale as `OriTabs`:

```vue
<OriAccordion :items="items">
    <template #panel-returns>
        <OriField label="Order number"><OriInput v-model="order" /></OriField>
    </template>
</OriAccordion>
```

Until now `#default` was the only panel mechanism, so distinct content per section meant branching on
`item.value` inside one shared template, and anything carrying an `id` was duplicated once per
section. Worse than in Tabs: `multiple` keeps two sections open at once, where `<label for>` focuses
the **visible** input of the wrong section. Tabs' remedy has no analogue — an accordion has no single
active item — so the answer is the escape hatch. The fallback still fills the sections that have no
named slot, and content is deliberately not gated on the open state: a closed `<details>` keeps its
content in the DOM, which is what makes find-in-page expand it.

**Both** now warn in DEV when a `#panel-<value>` slot matches no item — a typo, or an item that was
removed. Vue never warns about an unconsumed slot, so that section silently fell back or rendered
empty. The check is an exact match against the item values, so it cannot fire on correct code.
