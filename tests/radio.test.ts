import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { OriRadioGroup } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

/** The selector list of radio.css's "disabled look" rule — the one that sets `cursor: not-allowed`. */
function disabledSelectors(): string[] {
    const css = readFileSync(resolve(process.cwd(), 'packages/css/src/components/radio.css'), 'utf8')
    const rule = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].find((m) =>
        /cursor:\s*not-allowed/.test(m[2])
    )

    return (rule?.[1] ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
}

const OPTIONS = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Team', value: 'team', disabled: true }
]

describe('OriRadioGroup', () => {
    it('renders a radiogroup with one real radio per option', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, label: 'Plan' } })

        expect(wrapper.attributes('role')).toBe('radiogroup')
        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3)
        expect(wrapper.classes()).toContain('ori-radio-group')
        expect(wrapper.classes()).toContain('ori-color_primary')
    })

    it('names the group via aria-labelledby', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, label: 'Plan' } })
        const labelId = wrapper.find('.ori-radio-group__label').attributes('id')

        expect(labelId).toBeTruthy()
        expect(wrapper.attributes('aria-labelledby')).toBe(labelId)
        expect(wrapper.find('.ori-radio-group__label').text()).toBe('Plan')
    })

    it('shares a single name across the radios', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS } })
        const names = wrapper.findAll('input').map((i) => i.attributes('name'))

        expect(names[0]).toBeTruthy()
        expect(new Set(names).size).toBe(1)
    })

    it('reflects the v-model selection and emits the value on change', async () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, modelValue: 'pro' } })
        const radios = wrapper.findAll('input')

        expect((radios[1].element as HTMLInputElement).checked).toBe(true)

        await radios[0].setValue()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['free'])
    })

    it('disables the whole group, and individual options', () => {
        const all = mount(OriRadioGroup, { props: { options: OPTIONS, disabled: true } })
        expect(all.findAll('input').every((r) => (r.element as HTMLInputElement).disabled)).toBe(true)

        const partial = mount(OriRadioGroup, { props: { options: OPTIONS } })
        expect((partial.findAll('input')[2].element as HTMLInputElement).disabled).toBe(true)
        expect((partial.findAll('input')[0].element as HTMLInputElement).disabled).toBe(false)
    })

    // The modifier class is prop-driven, so it is absent exactly when the radio is disabled by
    // something the props know nothing about — a surrounding `<fieldset disabled>`, or a hand-written
    // `disabled` attribute in the CSS layer. Drop the class from a really-disabled radio: the
    // stylesheet must still dim it.
    it('the disabled look survives without the modifier class (fieldset / attribute disabled)', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, disabled: true } })
        const el = wrapper.findAll('.ori-radio')[0].element as HTMLElement

        el.classList.remove('ori-radio_disabled')

        const selectors = disabledSelectors()
        expect(selectors.length).toBeGreaterThan(0)
        expect(
            selectors.some((selector) => el.matches(selector)),
            `no disabled-look selector matches a class-less disabled radio: ${selectors.join(', ')}`
        ).toBe(true)
    })

    it('required sets aria-required + the native required attribute', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, required: true } })

        expect(wrapper.attributes('aria-required')).toBe('true')
        expect((wrapper.find('input').element as HTMLInputElement).required).toBe(true)
    })

    it('maps inline / size / color to classes', () => {
        const c = mount(OriRadioGroup, {
            props: { options: OPTIONS, inline: true, size: 'lg', color: 'success' }
        }).classes()

        expect(c).toContain('ori-radio-group_inline')
        expect(c).toContain('ori-font-size_lg')
        expect(c).toContain('ori-color_success')
    })

    it('renders custom per-option content via the #option scoped slot, receiving the option', () => {
        const wrapper = mount(OriRadioGroup, {
            props: { options: OPTIONS },
            slots: {
                option: ({ option }) => `${option.label} (${option.value})`
            }
        })
        const labels = wrapper.findAll('.ori-radio__label').map((l) => l.text())

        expect(labels).toEqual(['Free (free)', 'Pro (pro)', 'Team (team)'])
    })

    it('falls back to the option label when no #option slot is given', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS } })
        const labels = wrapper.findAll('.ori-radio__label').map((l) => l.text())

        expect(labels).toEqual(['Free', 'Pro', 'Team'])
    })

    it('keeps radio selection working with a custom #option slot', async () => {
        const wrapper = mount(OriRadioGroup, {
            props: { options: OPTIONS, modelValue: 'pro' },
            slots: { option: ({ option }) => option.label }
        })
        const radios = wrapper.findAll('input')

        expect((radios[1].element as HTMLInputElement).checked).toBe(true)

        await radios[0].setValue()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['free'])
    })

    it('has no axe violations (labeled group)', async () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, label: 'Plan' }, attachTo: document.body })
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })
})
