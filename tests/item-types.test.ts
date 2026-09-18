import { describe, it, expect, expectTypeOf } from 'vitest'
import { mount } from '@vue/test-utils'
import {
    OriAccordion,
    OriCombobox,
    OriMenu,
    OriRadioGroup,
    OriSelect,
    OriTabs,
    type AccordionItem,
    type ComboboxItem,
    type MenuItem,
    type RadioOption,
    type SelectOption,
    type TabItem
} from '../packages/vue/src'
import type {
    ComboboxItem as HeadlessComboboxItem,
    MenuItem as HeadlessMenuItem,
    TabItem as HeadlessTabItem
} from '@oriui/headless/vue'

/**
 * Public-surface guard for the six collection-item types. Every component that takes an array of item
 * objects has to export the array's element type from the same entry the component comes from —
 * otherwise a consumer cannot annotate the array they are about to pass (`const tabs: ??? = [...]`) and
 * has to inline the shape, which then silently drifts from ours. These are type-level assertions, so
 * the real gate is `npm run test:types` (vue-tsc over `tests/`); the mounts below keep the prop types
 * honest at runtime too, so a renamed prop fails here as well.
 *
 * It also pins the `TabItem` resolution: the styled one is the headless one PLUS the display string,
 * not a second incompatible shape sharing a name. `<OriTabs>` hands its `tabs` array straight to
 * `useTabs`, so that assignability is load-bearing, and `extends` is what writes it down.
 */

const ACCORDION_ITEMS: AccordionItem[] = [
    { value: 'shipping', title: 'Shipping' },
    { value: 'returns', title: 'Returns', disabled: true }
]

const COMBOBOX_OPTIONS: ComboboxItem[] = [
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte', disabled: true }
]

const MENU_ITEMS: MenuItem[] = [{ value: 'copy', label: 'Copy' }, { value: 'paste' }]

const RADIO_OPTIONS: RadioOption[] = [
    { value: 'card', label: 'Card' },
    { value: 2, label: 'Invoice', disabled: true }
]

const SELECT_OPTIONS: SelectOption[] = [
    { value: 'eu', label: 'Europe' },
    { value: 1, label: 'Asia', disabled: true }
]

const TABS: TabItem[] = [
    { value: 'account', label: 'Account' },
    { value: 2, label: 'Billing', disabled: true }
]

describe('collection item types', () => {
    it('OriAccordion accepts an AccordionItem[] annotated from the public entry', () => {
        const wrapper = mount(OriAccordion, { props: { items: ACCORDION_ITEMS } })

        expect(wrapper.findAll('details')).toHaveLength(2)
    })

    it('OriCombobox accepts a ComboboxItem[] annotated from the public entry', () => {
        const wrapper = mount(OriCombobox, { props: { options: COMBOBOX_OPTIONS } })

        expect(wrapper.find('input[role="combobox"]').exists()).toBe(true)
    })

    it('OriMenu accepts a MenuItem[] annotated from the public entry', () => {
        const wrapper = mount(OriMenu, { props: { items: MENU_ITEMS } })

        expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2)
    })

    it('OriRadioGroup accepts a RadioOption[] annotated from the public entry', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: RADIO_OPTIONS } })

        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(2)
    })

    it('OriSelect accepts a SelectOption[] annotated from the public entry', () => {
        const wrapper = mount(OriSelect, { props: { options: SELECT_OPTIONS } })

        expect(wrapper.findAll('option')).toHaveLength(2)
    })

    it('OriTabs accepts a TabItem[] annotated from the public entry', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } })

        expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)
    })

    it('forwards the headless item types unchanged rather than redeclaring them', () => {
        expectTypeOf<ComboboxItem>().toEqualTypeOf<HeadlessComboboxItem>()
        expectTypeOf<MenuItem>().toEqualTypeOf<HeadlessMenuItem>()
    })

    it('resolves the TabItem name clash by derivation — the styled tab IS a headless tab', () => {
        // One direction only: a styled tab is a valid headless tab (what `useTabs` is handed) …
        expectTypeOf<TabItem>().toExtend<HeadlessTabItem>()
        expectTypeOf<TabItem>().toHaveProperty('label').toEqualTypeOf<string>()
        // … while the behaviour-only base has no label, so it is not a drop-in for the styled prop.
        expectTypeOf<HeadlessTabItem>().not.toExtend<TabItem>()

        const asHeadless: HeadlessTabItem[] = TABS
        expect(asHeadless).toBe(TABS)
    })
})
