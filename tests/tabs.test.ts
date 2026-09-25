import { describe, it, expect, vi } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { OriTabs } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

const TABS = [
    { value: 'account', label: 'Account' },
    { value: 'billing', label: 'Billing' },
    { value: 'security', label: 'Security' }
]

const TABS_WITH_DISABLED = [
    { value: 'account', label: 'Account' },
    { value: 'billing', label: 'Billing', disabled: true },
    { value: 'security', label: 'Security' }
]

describe('OriTabs', () => {
    it('renders the root block and tablist with default classes', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } })

        expect(wrapper.classes()).toContain('ori-tabs')
        expect(wrapper.classes()).toContain('ori-color_primary')
        expect(wrapper.classes()).not.toContain('ori-tabs_vertical')

        const list = wrapper.find('.ori-tabs__list')
        expect(list.exists()).toBe(true)
        expect(list.attributes('role')).toBe('tablist')
    })

    it('renders one button[role=tab] per tab entry', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } })
        const tabs = wrapper.findAll('.ori-tabs__tab')

        expect(tabs).toHaveLength(3)
        tabs.forEach((tab) => {
            expect(tab.element.tagName).toBe('BUTTON')
            expect(tab.attributes('role')).toBe('tab')
        })
    })

    it('renders one role=tabpanel per tab entry', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } })
        const panels = wrapper.findAll('.ori-tabs__panel')

        expect(panels).toHaveLength(3)
        panels.forEach((panel) => {
            expect(panel.attributes('role')).toBe('tabpanel')
            expect(panel.attributes('tabindex')).toBe('0')
        })
    })

    it('auto-defaults modelValue to the first non-disabled tab and emits update:modelValue', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } })
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['account'])
    })

    it('reflects v-model — selected tab has aria-selected=true, others false', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'billing' } })
        await wrapper.vm.$nextTick()

        const tabButtons = wrapper.findAll('.ori-tabs__tab')
        expect(tabButtons[0].attributes('aria-selected')).toBe('false')
        expect(tabButtons[1].attributes('aria-selected')).toBe('true')
        expect(tabButtons[2].attributes('aria-selected')).toBe('false')
    })

    it('roving tabindex: selected tab is 0, others are -1', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'security' } })
        await wrapper.vm.$nextTick()

        const tabButtons = wrapper.findAll('.ori-tabs__tab')
        expect(tabButtons[0].attributes('tabindex')).toBe('-1')
        expect(tabButtons[1].attributes('tabindex')).toBe('-1')
        expect(tabButtons[2].attributes('tabindex')).toBe('0')
    })

    it('clicking a tab emits update:modelValue with that tab value', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[1].trigger('click')

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['billing'])
    })

    it('tab id ties to panel aria-labelledby', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } })
        const tabButtons = wrapper.findAll('.ori-tabs__tab')
        const panels = wrapper.findAll('.ori-tabs__panel')

        tabButtons.forEach((tab, i) => {
            const tabId = tab.attributes('id')
            expect(tabId).toBeTruthy()
            expect(panels[i].attributes('aria-labelledby')).toBe(tabId)
        })
    })

    it('tab aria-controls ties to panel id', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } })
        const tabButtons = wrapper.findAll('.ori-tabs__tab')
        const panels = wrapper.findAll('.ori-tabs__panel')

        tabButtons.forEach((tab, i) => {
            const panelId = panels[i].attributes('id')
            expect(panelId).toBeTruthy()
            expect(tab.attributes('aria-controls')).toBe(panelId)
        })
    })

    it('disabled tab has real disabled attribute and is not selectable via click', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS_WITH_DISABLED, modelValue: 'account' } })
        await wrapper.vm.$nextTick()

        const disabledTab = wrapper.findAll('.ori-tabs__tab')[1]
        expect((disabledTab.element as HTMLButtonElement).disabled).toBe(true)

        await disabledTab.trigger('click')

        const emitted = wrapper.emitted('update:modelValue')
        // Only the initial auto-default emit should exist; billing click must not emit
        const emittedValues = (emitted ?? []).map((e) => e[0])
        expect(emittedValues).not.toContain('billing')
    })

    it('auto-default skips disabled tabs — picks first enabled tab', async () => {
        const tabs = [
            { value: 'first', label: 'First', disabled: true },
            { value: 'second', label: 'Second' }
        ]
        const wrapper = mount(OriTabs, { props: { tabs } })
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['second'])
    })

    it('self-heals: if modelValue points at a disabled tab it emits the first enabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS_WITH_DISABLED, modelValue: 'billing' } })
        await wrapper.vm.$nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        const emittedValues = (emitted ?? []).map((e) => e[0])
        // Should have emitted a correction to the first enabled tab
        expect(emittedValues).toContain('account')
    })

    it('self-heals at runtime: v-model set to a disabled tab is corrected back to the resolved tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS_WITH_DISABLED, modelValue: 'account' } })
        await wrapper.vm.$nextTick() // 'account' is valid → no correction yet

        await wrapper.setProps({ modelValue: 'billing' }) // billing is disabled
        await wrapper.vm.$nextTick()

        // The bound value resolves to the SAME displayed tab ('account'), yet the model must still be healed
        // back so the parent's v-model is never left pointing at a disabled tab (regression guard: the heal
        // must trigger on the bound-value change, not only when the resolved selection changes).
        const emitted = wrapper.emitted('update:modelValue') ?? []
        expect(emitted.at(-1)?.[0]).toBe('account')
    })

    it('names the tablist via the label prop (aria-label)', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, label: 'Settings sections' } })
        expect(wrapper.find('.ori-tabs__list').attributes('aria-label')).toBe('Settings sections')
    })

    it('horizontal orientation sets aria-orientation=horizontal on tablist (default)', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } })
        const list = wrapper.find('.ori-tabs__list')

        expect(list.attributes('aria-orientation')).toBe('horizontal')
        expect(wrapper.classes()).not.toContain('ori-tabs_vertical')
    })

    it('vertical orientation sets aria-orientation=vertical on tablist and adds modifier class', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, orientation: 'vertical' } })
        const list = wrapper.find('.ori-tabs__list')

        expect(list.attributes('aria-orientation')).toBe('vertical')
        expect(wrapper.classes()).toContain('ori-tabs_vertical')
    })

    it('maps color prop to ori-color_<color> class', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, color: 'success' } })

        expect(wrapper.classes()).toContain('ori-color_success')
        expect(wrapper.classes()).not.toContain('ori-color_primary')
    })

    it('ArrowRight on horizontal tablist moves selection to the next non-disabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'ArrowRight' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['billing'])
    })

    it('ArrowLeft on horizontal tablist moves selection to the previous non-disabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'billing' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[1].trigger('keydown', { key: 'ArrowLeft' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['account'])
    })

    it('ArrowRight wraps from last tab to first', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'security' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[2].trigger('keydown', { key: 'ArrowRight' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['account'])
    })

    it('ArrowLeft wraps from first tab to last', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'ArrowLeft' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['security'])
    })

    it('ArrowRight skips disabled tabs during keyboard navigation', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS_WITH_DISABLED, modelValue: 'account' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'ArrowRight' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        // billing is disabled, should jump to security
        expect(lastValue).toEqual(['security'])
    })

    it('ArrowDown on vertical tablist moves selection forward', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, orientation: 'vertical', modelValue: 'account' }
        })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'ArrowDown' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['billing'])
    })

    it('ArrowUp on vertical tablist moves selection backward', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, orientation: 'vertical', modelValue: 'billing' }
        })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[1].trigger('keydown', { key: 'ArrowUp' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['account'])
    })

    it('Home key jumps to the first non-disabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'security' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[2].trigger('keydown', { key: 'Home' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['account'])
    })

    it('End key jumps to the last non-disabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'End' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['security'])
    })

    it('Home skips disabled tabs at the front', async () => {
        const tabs = [
            { value: 'first', label: 'First', disabled: true },
            { value: 'second', label: 'Second' },
            { value: 'third', label: 'Third' }
        ]
        const wrapper = mount(OriTabs, { props: { tabs, modelValue: 'third' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[2].trigger('keydown', { key: 'Home' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['second'])
    })

    it('End skips disabled tabs at the back', async () => {
        const tabs = [
            { value: 'first', label: 'First' },
            { value: 'second', label: 'Second' },
            { value: 'third', label: 'Third', disabled: true }
        ]
        const wrapper = mount(OriTabs, { props: { tabs, modelValue: 'first' } })
        await wrapper.vm.$nextTick()

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'End' })

        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual(['second'])
    })

    it('renders named slot content for the matching tab value', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            slots: {
                'panel-account': '<p class="account-panel">Account panel</p>',
                'panel-billing': '<p class="billing-panel">Billing panel</p>'
            }
        })
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.account-panel').exists()).toBe(true)
        expect(wrapper.find('.account-panel').text()).toBe('Account panel')
    })

    // ----- the reserved-slot collision (per-value panel slots are namespaced) -----
    //
    // Panel slot names come from caller DATA (a tab's `value`), and Vue's named slots are ONE flat
    // namespace. Unprefixed, a tab valued "tab" resolved its panel to this component's own reserved
    // `#tab` slot — the label renderer — so that template rendered twice (once per trigger, once in the
    // panel) and the panel's real content became unreachable. The `panel-` prefix gives data-derived
    // names their own namespace. These tests fail against the unprefixed version.

    it('a tab valued "tab" does not resolve its panel to the reserved #tab label slot', async () => {
        const tabs = [
            { value: 'tab', label: 'Tab' },
            { value: 'other', label: 'Other' }
        ]
        const wrapper = mount(OriTabs, {
            props: { tabs, modelValue: 'tab' },
            slots: {
                tab: ({ tab }) => h('span', { class: 'label-slot' }, `★ ${tab.label}`),
                'panel-tab': '<p class="tab-panel">Real panel content</p>'
            }
        })
        await wrapper.vm.$nextTick()

        // The label slot renders exactly once per TRIGGER and nowhere else.
        expect(wrapper.findAll('.ori-tabs__tab .label-slot')).toHaveLength(2)
        expect(wrapper.findAll('.ori-tabs__panel .label-slot')).toHaveLength(0)

        // …and the panel renders its own content, which the collision used to make unreachable.
        const panel = wrapper.findAll('.ori-tabs__panel')[0]!
        expect(panel.find('.tab-panel').exists()).toBe(true)
        expect(panel.text()).toBe('Real panel content')
    })

    it('a tab valued "default" does not swallow the fallback #default slot into its own panel', async () => {
        const tabs = [
            { value: 'default', label: 'Default' },
            { value: 'other', label: 'Other' }
        ]
        const wrapper = mount(OriTabs, {
            props: { tabs, modelValue: 'default' },
            slots: {
                default: '<span class="fallback">shared fallback</span>',
                'panel-default': '<span class="own-panel">its own panel</span>'
            }
        })
        await wrapper.vm.$nextTick()

        // The "default"-valued tab gets its named panel, not the shared fallback.
        const panels = wrapper.findAll('.ori-tabs__panel')
        expect(panels[0]!.find('.own-panel').exists()).toBe(true)
        expect(panels[0]!.find('.fallback').exists()).toBe(false)
        // The other tab falls back to #default — but only once it is the ACTIVE one.
        expect(panels[1]!.find('.fallback').exists()).toBe(false)

        await wrapper.setProps({ modelValue: 'other' })
        expect(wrapper.findAll('.ori-tabs__panel')[1]!.find('.fallback').exists()).toBe(true)
    })

    it('warns in DEV when a caller passes the old un-prefixed #<value> panel slot', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            slots: { account: '<p>Account panel</p>' }
        })

        expect(warn).toHaveBeenCalledTimes(1)
        const message = warn.mock.calls[0]![0] as string
        expect(message).toContain('[OriTabs]')
        expect(message).toContain('#account')
        expect(message).toContain('#panel-account')

        warn.mockRestore()
    })

    it('does not mistake the reserved #tab slot for a stale panel slot on a tab valued "tab"', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        mount(OriTabs, {
            props: { tabs: [{ value: 'tab', label: 'Tab' }], modelValue: 'tab' },
            slots: { tab: ({ tab }) => h('span', {}, tab.label) }
        })

        expect(warn).not.toHaveBeenCalled()

        warn.mockRestore()
    })

    it('renders default scoped slot as fallback when no named slot matches', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            slots: {
                default: '<span class="fallback">fallback content</span>'
            }
        })
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.fallback').exists()).toBe(true)
    })

    it('renders custom trigger content via the #tab scoped slot and receives the tab object', () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            slots: {
                tab: ({ tab }) => h('span', { class: 'custom-tab', 'data-value': String(tab.value) }, `★ ${tab.label}`)
            }
        })

        const tabButtons = wrapper.findAll('.ori-tabs__tab')
        // The scoped slot replaces the default label rendering for every trigger...
        expect(tabButtons[0].find('.custom-tab').exists()).toBe(true)
        expect(tabButtons[0].text()).toBe('★ Account')
        expect(tabButtons[1].text()).toBe('★ Billing')
        // ...and the slot receives the corresponding tab object.
        expect(tabButtons[0].find('.custom-tab').attributes('data-value')).toBe('account')
        expect(tabButtons[2].find('.custom-tab').attributes('data-value')).toBe('security')
    })

    it('falls back to the tab label when no #tab slot is provided', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } })

        const tabButtons = wrapper.findAll('.ori-tabs__tab')
        expect(tabButtons[0].text()).toBe('Account')
        expect(tabButtons[1].text()).toBe('Billing')
        expect(tabButtons[2].text()).toBe('Security')
    })

    it('only the active panel is shown — inactive panels carry the hidden attribute', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'billing' } })
        await wrapper.vm.$nextTick()

        const panels = wrapper.findAll('.ori-tabs__panel')
        // panel[1] (billing) is shown; the rest are hidden via the `hidden` attribute (APG-correct,
        // robust against display overrides — not just CSS display:none).
        expect(panels[0].attributes('hidden')).toBeDefined()
        expect(panels[1].attributes('hidden')).toBeUndefined()
        expect(panels[2].attributes('hidden')).toBeDefined()
    })

    it('roving focus: ArrowRight moves DOM focus to the newly-selected tab', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            attachTo: document.body
        })
        await wrapper.vm.$nextTick()

        const tabButtons = wrapper.findAll('.ori-tabs__tab')
        ;(tabButtons[0].element as HTMLButtonElement).focus()
        await tabButtons[0].trigger('keydown', { key: 'ArrowRight' })

        // automatic activation moves focus along with selection
        expect(document.activeElement).toBe(tabButtons[1].element)
        wrapper.unmount()
    })

    it('numeric tab values work: aria-selected, panel visibility, and emit', async () => {
        const numericTabs = [
            { value: 1, label: 'One' },
            { value: 2, label: 'Two' },
            { value: 3, label: 'Three' }
        ]
        const wrapper = mount(OriTabs, { props: { tabs: numericTabs, modelValue: 1 } })
        await wrapper.vm.$nextTick()

        const tabButtons = wrapper.findAll('.ori-tabs__tab')
        expect(tabButtons[0].attributes('aria-selected')).toBe('true')
        expect(tabButtons[1].attributes('aria-selected')).toBe('false')

        await tabButtons[1].trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        const lastValue = emitted?.[emitted.length - 1]
        expect(lastValue).toEqual([2])
    })

    // -------------------------------------------------------------------------
    // The #default fallback renders into the ACTIVE panel only
    // -------------------------------------------------------------------------

    // It used to render into every panel, so a shared template that ignored its scope was multiplied:
    // a login form in `#default` produced ids `email,password,email,password`, and
    // `getElementById` — therefore `<label for>` — resolving to the copy inside the HIDDEN panel
    // whenever the active tab was not the first one.

    it('a shared #default template renders ONCE, so its ids stay unique', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'billing' },
            slots: { default: '<input id="email" />' }
        })
        await wrapper.vm.$nextTick()

        expect(wrapper.findAll('#email')).toHaveLength(1)
        expect(wrapper.findAll('.ori-tabs__panel')[1]!.find('#email').exists()).toBe(true)
    })

    it('the single copy lives in the VISIBLE panel, not a hidden one', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'security' },
            slots: { default: '<input id="email" />' },
            attachTo: document.body
        })
        await wrapper.vm.$nextTick()

        const owner = document.getElementById('email')!.closest('.ori-tabs__panel') as HTMLElement
        expect(owner.hasAttribute('hidden')).toBe(false)
        expect(owner.getAttribute('id')).toBe(wrapper.findAll('.ori-tabs__panel')[2]!.attributes('id'))
        wrapper.unmount()
    })

    it('the fallback follows the selection: one copy, always in the active panel', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            slots: { default: '<span class="shared">shared</span>' }
        })
        await wrapper.vm.$nextTick()
        expect(wrapper.findAll('.ori-tabs__panel')[0]!.find('.shared').exists()).toBe(true)

        await wrapper.setProps({ modelValue: 'security' })
        const panels = wrapper.findAll('.ori-tabs__panel')
        expect(panels[0]!.find('.shared').exists()).toBe(false)
        expect(panels[2]!.find('.shared').exists()).toBe(true)
        expect(wrapper.findAll('.shared')).toHaveLength(1)
    })

    it('the scope the fallback receives is the ACTIVE tab, never a hidden one', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'billing' },
            slots: { default: '<template #default="{ tab }"><span class="scope">{{ tab.value }}</span></template>' }
        })
        await wrapper.vm.$nextTick()

        expect(wrapper.findAll('.scope')).toHaveLength(1)
        expect(wrapper.find('.scope').text()).toBe('billing')
    })

    it('a per-value #panel-<value> slot is unaffected — it still renders into its own panel', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            slots: { 'panel-security': '<span class="own">security only</span>' }
        })
        await wrapper.vm.$nextTick()

        // Rendered even though its tab is not selected: a named panel slot belongs to one panel, always.
        expect(wrapper.findAll('.ori-tabs__panel')[2]!.find('.own').exists()).toBe(true)
    })

    it('warns in DEV when a #panel-<value> slot matches no tab', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(OriTabs, { props: { tabs: TABS }, slots: { 'panel-acount': '<span>typo</span>' } })

        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn.mock.calls[0]![0]).toContain('#panel-acount')
        warn.mockRestore()
    })

    it('does not warn while the collection is still empty — an async list is correct code', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(OriTabs, { props: { tabs: [] }, slots: { 'panel-account': '<span>ok</span>' } })

        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('does not warn when every panel slot matches a tab', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(OriTabs, { props: { tabs: TABS }, slots: { 'panel-account': '<span>ok</span>' } })

        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('has no axe violations (horizontal, 3 tabs, one selected)', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            attachTo: document.body
        })
        await wrapper.vm.$nextTick()
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })

    it('has no axe violations (vertical orientation)', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'billing', orientation: 'vertical' },
            attachTo: document.body
        })
        await wrapper.vm.$nextTick()
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })
})
