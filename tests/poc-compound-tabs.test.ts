/* TEMPORARY (poc/compound-tabs) — does the prototype actually work? A comparison against a prototype
 * that only half-renders is not a comparison. Mirrors the shipped tabs suite's core assertions. */
import { describe, it, expect } from 'vitest'
import { h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { OriTabsC, OriTabList, OriTab, OriTabPanel } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

const TABS = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three', disabled: true },
    { value: 'four', label: 'Four' }
]

function mountCompound(props: Record<string, unknown> = {}) {
    return mount(OriTabsC, {
        props: { label: 'Sections', ...props },
        slots: {
            default: () => [
                h(OriTabList, null, () =>
                    TABS.map((t) => h(OriTab, { value: t.value, disabled: t.disabled }, () => t.label))
                ),
                ...TABS.map((t) => h(OriTabPanel, { value: t.value }, () => `panel ${t.value}`))
            ]
        },
        attachTo: document.body
    })
}

describe('compound Tabs prototype', () => {
    it('renders the full anatomy and selects the first enabled tab with no v-model', () => {
        const wrapper = mountCompound()
        const tabs = wrapper.findAll('[role="tab"]')

        expect(tabs).toHaveLength(4)
        expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(4)
        expect(tabs[0]!.attributes('aria-selected')).toBe('true')
        expect(tabs[0]!.attributes('tabindex')).toBe('0')
        expect(tabs[1]!.attributes('tabindex')).toBe('-1')
        expect(wrapper.find('[role="tablist"]').attributes('aria-label')).toBe('Sections')
        wrapper.unmount()
    })

    it('a tab controls the panel of the same value (ids wired both ways)', () => {
        const wrapper = mountCompound()
        const tab = wrapper.findAll('[role="tab"]')[1]!
        const panel = wrapper.findAll('[role="tabpanel"]')[1]!

        expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))
        expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))
        expect(tab.attributes('id')).toContain('-tab-two')
        wrapper.unmount()
    })

    it('click selects and swaps the visible panel', async () => {
        const wrapper = mountCompound()
        await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
        await nextTick()

        const panels = wrapper.findAll('[role="tabpanel"]')
        expect(panels[0]!.attributes('hidden')).toBeDefined()
        expect(panels[1]!.attributes('hidden')).toBeUndefined()
        wrapper.unmount()
    })

    it('ArrowRight moves focus AND selects (automatic activation), skipping the disabled tab', async () => {
        const wrapper = mountCompound()
        const tabs = wrapper.findAll('[role="tab"]')
        ;(tabs[1]!.element as HTMLElement).focus()

        await tabs[1]!.trigger('keydown', { key: 'ArrowRight' })
        await nextTick()

        // three is disabled → four
        expect(wrapper.findAll('[role="tab"]')[3]!.attributes('aria-selected')).toBe('true')
        expect(document.activeElement).toBe(wrapper.findAll('[role="tab"]')[3]!.element)
        wrapper.unmount()
    })

    it('a v-model drives and receives the selection', async () => {
        const model = ref<string | number>('two')
        const wrapper = mount(OriTabsC, {
            props: {
                label: 'Sections',
                modelValue: model.value,
                'onUpdate:modelValue': (v: string | number) => (model.value = v)
            },
            slots: {
                default: () => [
                    h(OriTabList, null, () =>
                        TABS.map((t) => h(OriTab, { value: t.value, disabled: t.disabled }, () => t.label))
                    ),
                    ...TABS.map((t) => h(OriTabPanel, { value: t.value }, () => `panel ${t.value}`))
                ]
            },
            attachTo: document.body
        })

        expect(wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected')).toBe('true')
        await wrapper.findAll('[role="tab"]')[3]!.trigger('click')
        expect(model.value).toBe('four')
        wrapper.unmount()
    })

    it('THE REGRESSION: a v-model pointing at a disabled tab is NOT healed', () => {
        const wrapper = mountCompound({ modelValue: 'three' })
        const tabs = wrapper.findAll('[role="tab"]')

        expect(tabs[2]!.attributes('disabled')).toBeDefined()
        expect(tabs[2]!.attributes('aria-selected')).toBe('true') // the array API heals to tab 0
        wrapper.unmount()
    })

    it('THE REGRESSION: a v-model pointing at a missing tab leaves NOTHING selected', () => {
        const wrapper = mountCompound({ modelValue: 'ghost' })

        expect(wrapper.findAll('[role="tab"][aria-selected="true"]')).toHaveLength(0)
        expect(wrapper.findAll('[role="tabpanel"]:not([hidden])')).toHaveLength(0)
        wrapper.unmount()
    })

    it('has no axe violations', async () => {
        const wrapper = mountCompound()
        await expectNoA11yViolations(wrapper.element as HTMLElement)
        wrapper.unmount()
    })
})
