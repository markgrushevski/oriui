import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { OriCard } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

describe('OriCard', () => {
    it('renders default classes and title / subtitle / body text', () => {
        const wrapper = mount(OriCard, { props: { title: 'Hello', subtitle: 'World', text: 'Body' } })
        const c = wrapper.classes()

        expect(c).toContain('ori-card')
        expect(c).toContain('ori-variant_solid')
        expect(c).toContain('ori-color_surface')
        expect(c).toContain('ori-size-radius_lg')
        expect(wrapper.find('.ori-card__title').text()).toBe('Hello')
        expect(wrapper.find('.ori-card__subtitle').text()).toBe('World')
        expect(wrapper.find('.ori-card__body').text()).toBe('Body')
    })

    // State is an attribute, not a class — the css layer styles [aria-disabled] / [aria-busy].
    it('reflects disabled via aria-disabled', () => {
        const wrapper = mount(OriCard, { props: { title: 'x', disabled: true } })

        expect(wrapper.attributes('aria-disabled')).toBe('true')
    })

    // `aria-disabled` on a role-less <div> (role=generic) is announced to nobody and inherited by
    // nothing, and `pointer-events: none` stops only the mouse: the buttons and links inside a
    // disabled card stayed tab-focusable and Enter-activatable. `inert` is the platform primitive
    // that actually delivers what the docs claim — pointer AND keyboard AND the accessibility tree.
    it('disabled makes the whole subtree inert, not just pointer-blocked', () => {
        const wrapper = mount(OriCard, {
            props: { title: 'x', disabled: true },
            slots: { 'actions-append': '<button type="button">Act</button>' }
        })

        expect(wrapper.attributes('inert')).toBeDefined()
        expect(wrapper.find('button').exists()).toBe(true)
    })

    it('an enabled card is not inert', () => {
        const wrapper = mount(OriCard, { props: { title: 'x' } })

        expect(wrapper.attributes('inert')).toBeUndefined()
    })

    // Loading is a different state: the card is busy, not unusable, so it must NOT go inert.
    it('loading does not make the card inert', () => {
        const wrapper = mount(OriCard, { props: { title: 'x', loading: true } })

        expect(wrapper.attributes('inert')).toBeUndefined()
    })

    it('reflects loading via aria-busy', () => {
        const wrapper = mount(OriCard, { props: { title: 'x', loading: true } })

        expect(wrapper.attributes('aria-busy')).toBe('true')
    })

    it('maps variant / color / radius / fluid / row to classes', () => {
        const c = mount(OriCard, {
            props: { title: 'x', variant: 'outline', color: 'success', radius: 'xl', fluid: true, row: true }
        }).classes()

        expect(c).toContain('ori-variant_outline')
        expect(c).toContain('ori-color_success')
        expect(c).toContain('ori-size-radius_xl')
        expect(c).toContain('ori-card_fluid')
        expect(c).toContain('ori-card_row')
    })

    // Icon mode is EXPLICIT: it needs an icon prop (prepend/append) AND no text — never the mere
    // absence of `text`. A plain or text-only card must not silently switch layout.
    it('icon mode (prependIcon, no text) takes the icon modifier class', () => {
        const c = mount(OriCard, { props: { prependIcon: 'M0 0' } }).classes()

        expect(c).toContain('ori-card_icon')
    })

    it('a text-only card is NOT icon mode', () => {
        const c = mount(OriCard, { props: { text: 'Body' } }).classes()

        expect(c).not.toContain('ori-card_icon')
    })

    it('a bare card (no icon, no text) is NOT forced into icon mode', () => {
        const c = mount(OriCard, { props: { title: 'Hello' } }).classes()

        expect(c).not.toContain('ori-card_icon')
    })

    it('an icon + text card is NOT icon mode', () => {
        const c = mount(OriCard, { props: { prependIcon: 'M0 0', text: 'Body' } }).classes()

        expect(c).not.toContain('ori-card_icon')
    })

    // A declared prop nothing renders is a compatibility promise with no implementation behind it —
    // `image` was exactly that (typed, documented, read by neither the template nor card.css). Probe
    // every prop the component declares: setting it must change the rendered DOM. A future prop that
    // only bites in combination with something else belongs in the probe mount below (give it the
    // companion slot / prop), never in an exemption list.
    it('every declared prop is observable in the rendered output', () => {
        // The runtime prop options the SFC compiler emits from the type-only `defineProps`.
        const declared = (OriCard as unknown as { props: Record<string, { type?: unknown } | null> }).props
        const slots = { 'actions-prepend': '<i></i>', 'actions-append': '<i></i>' }
        const baseline = mount(OriCard, { slots }).html()

        expect(Object.keys(declared).length).toBeGreaterThan(0)

        for (const [name, definition] of Object.entries(declared)) {
            const value = definition?.type === Boolean ? true : '__ori_probe__'
            const html = mount(OriCard, { props: { [name]: value }, slots }).html()

            expect(html, `prop "${name}" changes nothing in the DOM`).not.toBe(baseline)
        }
    })

    it('has no axe violations', async () => {
        const wrapper = mount(OriCard, {
            props: { title: 'Hello', subtitle: 'World', text: 'Body' },
            attachTo: document.body
        })
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })
})
