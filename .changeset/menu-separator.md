---
'@oriui/vue': minor
'@oriui/css': minor
'@oriui/headless': minor
---

**`OriMenu` renders separators — the grouping rule the headless tier already exported.** The menu
machine has always declared `separator` in its anatomy, exported `separatorProps`
(`role="separator"`, `aria-orientation="horizontal"`) and documented it on the `useMenu` page, while
the styled `OriMenu` rendered it zero times and `menu.css` carried no separator class. The styled
tier was poorer than the tier it sits on.

Mark an entry in the `items` array:

```vue
<OriMenu
    :items="[
        { value: 'new', label: 'New file' },
        { value: 'sep-1', separator: true },
        { value: 'delete', label: 'Delete' }
    ]"
/>
```

The array is the model for this component, so a separator is an entry in it (PrimeVue's shape) rather
than a slotted child. `MenuItem` gains `separator?: boolean`; a separator is not navigable and not
selectable — the machine drops it from the roving set with the same predicate that drops a disabled
item, so `ArrowDown` steps over it and `End` lands on the last real item even when a separator is
last in the array. `label` on a separator is ignored; `value` is still the list key. New part class:
`.ori-menu__separator`.
