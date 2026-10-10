import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { OriJoin } from '../packages/vue/src/components/join'
import { expectNoA11yViolations } from './helpers/axe'

describe('OriJoin', () => {
    it('renders a <div> root with ori-join class and role="group" by default', () => {
        const wrapper = mount(OriJoin)

        expect(wrapper.element.tagName.toLowerCase()).toBe('div')
        expect(wrapper.classes()).toContain('ori-join')
        expect(wrapper.attributes('role')).toBe('group')
    })

    it('does not add ori-join_vertical by default', () => {
        const wrapper = mount(OriJoin)

        expect(wrapper.classes()).not.toContain('ori-join_vertical')
    })

    it('adds the ori-join_vertical modifier for orientation="vertical"', () => {
        const wrapper = mount(OriJoin, { props: { orientation: 'vertical' } })

        expect(wrapper.classes()).toContain('ori-join')
        expect(wrapper.classes()).toContain('ori-join_vertical')
    })

    it('renders default slot children', () => {
        const wrapper = mount(OriJoin, {
            slots: {
                default: '<button>A</button><button>B</button>'
            }
        })

        const buttons = wrapper.findAll('button')
        expect(buttons).toHaveLength(2)
        expect(buttons[0].text()).toBe('A')
        expect(buttons[1].text()).toBe('B')
    })

    it('renders a <span> root when as="span" while keeping role="group" and ori-join', () => {
        const wrapper = mount(OriJoin, { props: { as: 'span' } })

        expect(wrapper.element.tagName.toLowerCase()).toBe('span')
        expect(wrapper.classes()).toContain('ori-join')
        expect(wrapper.attributes('role')).toBe('group')
    })

    it('renders a <nav> root when as="nav"', () => {
        const wrapper = mount(OriJoin, { props: { as: 'nav' } })

        expect(wrapper.element.tagName.toLowerCase()).toBe('nav')
        expect(wrapper.classes()).toContain('ori-join')
    })

    it('orientation + as polymorphism combined', () => {
        const wrapper = mount(OriJoin, { props: { as: 'span', orientation: 'vertical' } })

        expect(wrapper.element.tagName.toLowerCase()).toBe('span')
        expect(wrapper.classes()).toContain('ori-join')
        expect(wrapper.classes()).toContain('ori-join_vertical')
        expect(wrapper.attributes('role')).toBe('group')
    })

    it('has no axe violations when given an aria-label and meaningful children', async () => {
        const wrapper = mount(OriJoin, {
            attrs: { 'aria-label': 'Text formatting' },
            slots: {
                default: '<button>Bold</button><button>Italic</button>'
            },
            attachTo: document.body
        })
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })
})
