import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { OriField, OriSegmentedControl } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

const OPTIONS = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto', disabled: true }
]

const NUMERIC = [
    { label: 'One', value: 1 },
    { label: 'Two', value: 2 }
]

const ICON_A = 'M0 0h24v24H0z'
const ICON_B = 'M12 2l10 20H2z'

function radios(root: Element): HTMLInputElement[] {
    return [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
}

describe('OriSegmentedControl', () => {
    // ----- structure + classes -----

    it('renders a radiogroup with one real radio inside one item label per option', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS, label: 'Theme' } })

        expect(wrapper.attributes('role')).toBe('radiogroup')
        expect(wrapper.classes()).toContain('ori-segmented-control')
        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3)

        const items = wrapper.findAll('.ori-segmented-control__track > label.ori-segmented-control__item')
        expect(items).toHaveLength(3)
        // The radio sits inside its own <label>, so clicking the text is the native association.
        items.forEach((item) =>
            expect(item.find('input.ori-segmented-control__input[type="radio"]').exists()).toBe(true)
        )
        expect(items.map((item) => item.find('.ori-segmented-control__text').text())).toEqual(['Light', 'Dark', 'Auto'])
    })

    it('renders an empty track when there are no options', () => {
        const wrapper = mount(OriSegmentedControl)

        expect(wrapper.find('.ori-segmented-control__track').exists()).toBe(true)
        expect(wrapper.findAll('input')).toHaveLength(0)
    })

    it('defaults to the primary color and the md size', () => {
        const classes = mount(OriSegmentedControl, { props: { options: OPTIONS } }).classes()

        expect(classes).toContain('ori-color_primary')
        expect(classes).toContain('ori-font-size_md')
        expect(classes).toContain('ori-segmented-control_md')
        expect(classes).not.toContain('ori-segmented-control_fluid')
    })

    it('maps size / color / fluid to classes', () => {
        const classes = mount(OriSegmentedControl, {
            props: { options: OPTIONS, size: 'lg', color: 'success', fluid: true }
        }).classes()

        expect(classes).toContain('ori-font-size_lg')
        expect(classes).toContain('ori-segmented-control_lg')
        expect(classes).toContain('ori-color_success')
        expect(classes).toContain('ori-segmented-control_fluid')
        expect(classes).not.toContain('ori-segmented-control_md')
    })

    // ----- group name -----

    it('names the group via aria-labelledby pointing at the visible label', () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS, label: 'Theme' },
            attachTo: document.body
        })
        const label = wrapper.find('.ori-segmented-control__label')
        const labelId = label.attributes('id')

        expect(label.text()).toBe('Theme')
        expect(labelId).toBeTruthy()
        expect(wrapper.attributes('aria-labelledby')).toBe(labelId)
        expect(document.getElementById(labelId as string)).toBe(label.element)
        wrapper.unmount()
    })

    it('without a label renders no label element and no aria-labelledby', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS } })

        expect(wrapper.find('.ori-segmented-control__label').exists()).toBe(false)
        expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
    })

    it('an unlabeled group takes its name from a caller aria-label', () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS },
            attrs: { 'aria-label': 'Theme' }
        })

        expect(wrapper.attributes('aria-label')).toBe('Theme')
        expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
    })

    it('passes class and other attributes through to the root, not the radios', () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS },
            attrs: { class: 'mine', 'data-test': 'seg', id: 'theme-seg' }
        })

        expect(wrapper.classes()).toContain('mine')
        expect(wrapper.classes()).toContain('ori-segmented-control')
        expect(wrapper.attributes('data-test')).toBe('seg')
        expect(wrapper.attributes('id')).toBe('theme-seg')
        expect(wrapper.findAll('input').every((i) => i.attributes('data-test') === undefined)).toBe(true)
    })

    it('has no aria-invalid and no aria-required by default', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS } })

        expect(wrapper.attributes('aria-invalid')).toBeUndefined()
        expect(wrapper.attributes('aria-required')).toBeUndefined()
        expect(wrapper.attributes('aria-describedby')).toBeUndefined()
    })

    // ----- shared radio name -----

    it('shares one auto-generated name across the radios', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS } })
        const names = radios(wrapper.element).map((r) => r.getAttribute('name'))

        expect(names[0]).toBeTruthy()
        expect(new Set(names).size).toBe(1)
    })

    it('uses an explicit name on every radio', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS, name: 'theme' } })

        expect(radios(wrapper.element).map((r) => r.getAttribute('name'))).toEqual(['theme', 'theme', 'theme'])
    })

    it('gives two groups on one page different auto names (they do not steal each other selection)', () => {
        const wrapper = mount({
            components: { OriSegmentedControl },
            setup: () => ({ options: OPTIONS }),
            template: `<div><OriSegmentedControl :options="options" /><OriSegmentedControl :options="options" /></div>`
        })
        const groups = wrapper.findAll('[role="radiogroup"]')
        const nameOf = (i: number) => radios(groups[i].element)[0].getAttribute('name')

        expect(groups).toHaveLength(2)
        expect(nameOf(0)).not.toBe(nameOf(1))
    })

    // ----- v-model -----

    it('reflects the v-model selection in the checked radio', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS, modelValue: 'dark' } })

        expect(radios(wrapper.element).map((r) => r.checked)).toEqual([false, true, false])
    })

    it('checks nothing when the model is undefined', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS } })

        expect(radios(wrapper.element).some((r) => r.checked)).toBe(false)
    })

    it('moves the checked radio when the model changes', async () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS, modelValue: 'light' } })

        await wrapper.setProps({ modelValue: 'dark' })
        expect(radios(wrapper.element).map((r) => r.checked)).toEqual([false, true, false])

        await wrapper.setProps({ modelValue: 'light' })
        expect(radios(wrapper.element).map((r) => r.checked)).toEqual([true, false, false])
    })

    it('emits update:modelValue with the option value when a radio is chosen', async () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS, modelValue: 'dark' } })

        await wrapper.findAll('input')[0].setValue()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['light'])
    })

    // happy-dom only fires the change event of a click on a radio that is in the document.
    it('emits when a radio is clicked', async () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS, modelValue: 'light' },
            attachTo: document.body
        })

        await wrapper.findAll('input')[1].trigger('click')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['dark'])
        wrapper.unmount()
    })

    it('emits when the segment text (the label) is clicked', async () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS, modelValue: 'light' },
            attachTo: document.body
        })

        await wrapper.findAll('.ori-segmented-control__text')[1].trigger('click')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['dark'])
        wrapper.unmount()
    })

    it('keeps number values as numbers, both ways', async () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: NUMERIC, modelValue: 2 } })

        expect(radios(wrapper.element).map((r) => r.checked)).toEqual([false, true])

        await wrapper.findAll('input')[0].setValue()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    })

    it('two-way binds through a parent v-model', async () => {
        const wrapper = mount({
            components: { OriSegmentedControl },
            data: () => ({ value: 'light', options: OPTIONS }),
            template: `<div><OriSegmentedControl v-model="value" :options="options" /><output>{{ value }}</output></div>`
        })

        expect(radios(wrapper.element).map((r) => r.checked)).toEqual([true, false, false])

        await wrapper.findAll('input')[1].setValue()
        expect(wrapper.find('output').text()).toBe('dark')
        expect(radios(wrapper.element).map((r) => r.checked)).toEqual([false, true, false])
    })

    // ----- disabled / required -----

    it('disables the whole group', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS, disabled: true } })

        expect(radios(wrapper.element).every((r) => r.disabled)).toBe(true)
    })

    it('disables only the option marked disabled', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS } })

        expect(radios(wrapper.element).map((r) => r.disabled)).toEqual([false, false, true])
    })

    it('required sets aria-required on the group and the native required attribute on every radio', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS, required: true } })

        expect(wrapper.attributes('aria-required')).toBe('true')
        expect(radios(wrapper.element).every((r) => r.required)).toBe(true)
    })

    it('is not required by default', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS } })

        expect(radios(wrapper.element).some((r) => r.required)).toBe(false)
    })

    // ----- icons -----

    it('draws an OriIcon before the label only for options that set icon', () => {
        const wrapper = mount(OriSegmentedControl, {
            props: {
                options: [
                    { label: 'Light', value: 'light', icon: ICON_A },
                    { label: 'Dark', value: 'dark' },
                    { label: 'Auto', value: 'auto', icon: ICON_B }
                ]
            }
        })
        const items = wrapper.findAll('.ori-segmented-control__item')
        const icons = wrapper.findAll('.ori-segmented-control__icon')

        expect(icons).toHaveLength(2)
        expect(items[0].find('.ori-segmented-control__icon').exists()).toBe(true)
        expect(items[1].find('.ori-segmented-control__icon').exists()).toBe(false)
        expect(items[2].find('.ori-segmented-control__icon').exists()).toBe(true)
        expect(icons[0].classes()).toContain('ori-icon')
        expect(icons[0].find('path').attributes('d')).toBe(ICON_A)
        expect(icons[1].find('path').attributes('d')).toBe(ICON_B)
        // Decorative: the label text names the segment.
        expect(icons[0].attributes('aria-hidden')).toBe('true')
        expect(items[0].find('.ori-segmented-control__text').text()).toBe('Light')
    })

    it('renders no icon when no option sets one', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS } })

        expect(wrapper.find('.ori-segmented-control__icon').exists()).toBe(false)
    })

    // ----- #option slot -----

    it('renders custom per-option content via the #option scoped slot, receiving the option', () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS },
            slots: { option: ({ option }) => `${option.label} (${option.value})` }
        })
        const texts = wrapper.findAll('.ori-segmented-control__text').map((t) => t.text())

        expect(texts).toEqual(['Light (light)', 'Dark (dark)', 'Auto (auto)'])
    })

    it('falls back to the option label when no #option slot is given', () => {
        const wrapper = mount(OriSegmentedControl, { props: { options: OPTIONS } })

        expect(wrapper.findAll('.ori-segmented-control__text').map((t) => t.text())).toEqual(['Light', 'Dark', 'Auto'])
    })

    it('keeps selection working with a custom #option slot', async () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS, modelValue: 'dark' },
            slots: { option: ({ option }) => option.label }
        })

        expect(radios(wrapper.element).map((r) => r.checked)).toEqual([false, true, false])

        await wrapper.findAll('input')[0].setValue()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['light'])
    })

    // ----- aria-describedby -----

    it('passes a caller aria-describedby through when standalone', () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS },
            attrs: { 'aria-describedby': 'mine' }
        })

        expect(wrapper.attributes('aria-describedby')).toBe('mine')
    })

    // ----- OriField integration -----

    it('inside an OriField the field names the group, with no duplicate group label', () => {
        const wrapper = mount(
            {
                components: { OriField, OriSegmentedControl },
                setup: () => ({ options: OPTIONS }),
                template: `<OriField label="Theme" hint="Pick one"><OriSegmentedControl :options="options" label="Ignored" /></OriField>`
            },
            { attachTo: document.body }
        )
        const group = wrapper.find('[role="radiogroup"]')
        const fieldLabel = wrapper.find('label.ori-field__label')

        expect(wrapper.find('.ori-segmented-control__label').exists()).toBe(false)
        expect(fieldLabel.attributes('id')).toBeTruthy()
        expect(group.attributes('aria-labelledby')).toBe(fieldLabel.attributes('id'))
        expect(group.attributes('aria-describedby')).toBe(wrapper.find('.ori-field__hint').attributes('id'))
        wrapper.unmount()
    })

    it('a label-less field leaves the group with no dangling aria-labelledby', () => {
        const wrapper = mount({
            components: { OriField, OriSegmentedControl },
            setup: () => ({ options: OPTIONS }),
            template: `<OriField hint="Pick one"><OriSegmentedControl :options="options" /></OriField>`
        })

        expect(wrapper.find('[role="radiogroup"]').attributes('aria-labelledby')).toBeUndefined()
    })

    it('field required / disabled / invalid drive the group and its radios', () => {
        const wrapper = mount({
            components: { OriField, OriSegmentedControl },
            setup: () => ({ options: [{ label: 'Light', value: 'light' }] }),
            template: `<OriField label="Theme" error="Required" required disabled><OriSegmentedControl :options="options" /></OriField>`
        })
        const group = wrapper.find('[role="radiogroup"]')
        const radio = wrapper.find('input[type="radio"]').element as HTMLInputElement

        expect(group.attributes('aria-required')).toBe('true')
        expect(group.attributes('aria-invalid')).toBe('true')
        expect(group.attributes('aria-describedby')).toBe(wrapper.find('.ori-field__error').attributes('id'))
        expect(radio.disabled).toBe(true)
        expect(radio.required).toBe(true)
    })

    it('field size drives the group size and the field makes it fluid', () => {
        const wrapper = mount({
            components: { OriField, OriSegmentedControl },
            setup: () => ({ options: OPTIONS }),
            template: `<OriField label="Theme" size="lg"><OriSegmentedControl :options="options" /></OriField>`
        })
        const classes = wrapper.find('[role="radiogroup"]').classes()

        expect(classes).toContain('ori-font-size_lg')
        expect(classes).toContain('ori-segmented-control_lg')
        expect(classes).toContain('ori-segmented-control_fluid')
    })

    it('a caller aria-describedby joins the field hint instead of replacing it', () => {
        const wrapper = mount({
            components: { OriField, OriSegmentedControl },
            setup: () => ({ options: OPTIONS }),
            template: `<OriField label="Theme" hint="A hint"><OriSegmentedControl aria-describedby="mine" :options="options" /></OriField>`
        })
        const hintId = wrapper.find('.ori-field__hint').attributes('id')

        expect(wrapper.find('[role="radiogroup"]').attributes('aria-describedby')).toBe(`${hintId} mine`)
    })

    it('inside a field a caller class and data attribute still reach the root', () => {
        const wrapper = mount({
            components: { OriField, OriSegmentedControl },
            setup: () => ({ options: OPTIONS }),
            template: `<OriField label="Theme"><OriSegmentedControl class="mine" data-test="seg" :options="options" /></OriField>`
        })
        const group = wrapper.find('[role="radiogroup"]')

        expect(group.classes()).toContain('mine')
        expect(group.classes()).toContain('ori-segmented-control')
        expect(group.attributes('data-test')).toBe('seg')
    })

    it('still emits update:modelValue inside a field', async () => {
        const wrapper = mount({
            components: { OriField, OriSegmentedControl },
            setup: () => ({ options: OPTIONS }),
            template: `<OriField label="Theme"><OriSegmentedControl model-value="dark" :options="options" /></OriField>`
        })
        const control = wrapper.findComponent(OriSegmentedControl)

        expect(radios(control.element).map((r) => r.checked)).toEqual([false, true, false])

        await control.findAll('input')[0].setValue()
        expect(control.emitted('update:modelValue')?.[0]).toEqual(['light'])
    })

    // ----- a11y -----

    it('has no axe violations (labeled group)', async () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS, label: 'Theme', modelValue: 'light' },
            attachTo: document.body
        })
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })

    it('has no axe violations (unlabeled group named by aria-label, with icons)', async () => {
        const wrapper = mount(OriSegmentedControl, {
            props: {
                options: [
                    { label: 'Light', value: 'light', icon: ICON_A },
                    { label: 'Dark', value: 'dark', icon: ICON_B }
                ]
            },
            attrs: { 'aria-label': 'Theme' },
            attachTo: document.body
        })
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })

    it('has no axe violations (disabled option, required)', async () => {
        const wrapper = mount(OriSegmentedControl, {
            props: { options: OPTIONS, label: 'Theme', required: true, modelValue: 'dark' },
            attachTo: document.body
        })
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })

    it('has no axe violations (wrapped in an OriField)', async () => {
        const wrapper = mount(
            {
                components: { OriField, OriSegmentedControl },
                setup: () => ({ options: OPTIONS }),
                template: `<OriField label="Theme" hint="Pick one" required><OriSegmentedControl :options="options" /></OriField>`
            },
            { attachTo: document.body }
        )
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })

    it('has no axe violations (field with an error)', async () => {
        const wrapper = mount(
            {
                components: { OriField, OriSegmentedControl },
                setup: () => ({ options: OPTIONS }),
                template: `<OriField label="Theme" error="Pick one"><OriSegmentedControl :options="options" /></OriField>`
            },
            { attachTo: document.body }
        )
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })
})
