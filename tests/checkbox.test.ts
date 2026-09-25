import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { OriCheckbox } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

/**
 * The selector list of a component stylesheet's "disabled look" rule — the one that sets
 * `cursor: not-allowed`. Source-level, like tokens.contrast.test.ts: no build required.
 */
function disabledSelectors(component: string): string[] {
    const css = readFileSync(resolve(process.cwd(), `packages/css/src/components/${component}.css`), 'utf8')
    const rule = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].find((m) =>
        /cursor:\s*not-allowed/.test(m[2])
    )

    return (rule?.[1] ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
}

describe('OriCheckbox', () => {
    it('renders a real <input type="checkbox"> with the default classes', () => {
        const wrapper = mount(OriCheckbox, { props: { label: 'Accept' } })
        const input = wrapper.find('input')

        expect(input.attributes('type')).toBe('checkbox')
        expect(wrapper.classes()).toContain('ori-checkbox')
        expect(wrapper.classes()).toContain('ori-color_primary')
        expect(wrapper.classes()).toContain('ori-font-size_md')
        expect(wrapper.find('.ori-checkbox__label').text()).toBe('Accept')
    })

    it('associates the label with the input via for/id', () => {
        const wrapper = mount(OriCheckbox, { props: { label: 'Accept' } })
        const fieldId = wrapper.find('input').attributes('id')

        expect(fieldId).toBeTruthy()
        expect(wrapper.find('label').attributes('for')).toBe(fieldId)
    })

    it('supports a boolean v-model', async () => {
        const wrapper = mount(OriCheckbox, { props: { modelValue: true } })
        const input = wrapper.find('input')

        expect((input.element as HTMLInputElement).checked).toBe(true)

        await input.setValue(false)
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('disabled sets the real disabled attribute + modifier class', () => {
        const wrapper = mount(OriCheckbox, { props: { disabled: true, label: 'x' } })

        expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
        expect(wrapper.classes()).toContain('ori-checkbox_disabled')
    })

    // The modifier class is prop-driven, so it is absent exactly when the control is disabled by
    // something the prop knows nothing about — a surrounding `<fieldset disabled>`, or a hand-written
    // `disabled` attribute in the CSS layer. That control was inert but rendered fully enabled.
    // Drop the class from a really-disabled checkbox: the stylesheet must still dim it.
    it('the disabled look survives without the modifier class (fieldset / attribute disabled)', () => {
        const wrapper = mount(OriCheckbox, { props: { disabled: true, label: 'x' } })
        const el = wrapper.element as HTMLElement

        el.classList.remove('ori-checkbox_disabled')

        const selectors = disabledSelectors('checkbox')
        expect(selectors.length).toBeGreaterThan(0)
        expect(
            selectors.some((selector) => el.matches(selector)),
            `no disabled-look selector matches a class-less disabled checkbox: ${selectors.join(', ')}`
        ).toBe(true)
    })

    it('invalid flips aria-invalid', () => {
        const wrapper = mount(OriCheckbox, { props: { invalid: true } })

        expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    })

    it('maps size / color to classes', () => {
        const c = mount(OriCheckbox, { props: { size: 'lg', color: 'success' } }).classes()

        expect(c).toContain('ori-font-size_lg')
        expect(c).toContain('ori-color_success')
    })

    it('renders rich default-slot content as the label', () => {
        const wrapper = mount(OriCheckbox, {
            slots: { default: '<a href="/terms">Terms</a>' }
        })
        const label = wrapper.find('.ori-checkbox__label')

        expect(label.exists()).toBe(true)
        expect(label.find('a').attributes('href')).toBe('/terms')
        expect(label.text()).toBe('Terms')
    })

    it('falls back to the label prop when no slot is given', () => {
        const wrapper = mount(OriCheckbox, { props: { label: 'Accept' } })

        expect(wrapper.find('.ori-checkbox__label').text()).toBe('Accept')
    })

    it('keeps the input associated with the label when using a slot', () => {
        const wrapper = mount(OriCheckbox, { slots: { default: 'Accept' } })
        const fieldId = wrapper.find('input').attributes('id')

        expect(fieldId).toBeTruthy()
        expect(wrapper.find('label').attributes('for')).toBe(fieldId)
    })

    it('has no axe violations (labeled)', async () => {
        const wrapper = mount(OriCheckbox, { props: { label: 'Accept terms' }, attachTo: document.body })
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })
})

describe('OriCheckbox — the mixed state', () => {
    it('passes `indeterminate` through to the real input, where AT reads it', async () => {
        const wrapper = mount(OriCheckbox, { props: { label: 'All' }, attrs: { indeterminate: true } })
        await nextTick()

        expect((wrapper.find('input').element as HTMLInputElement).indeterminate).toBe(true)
    })
})
