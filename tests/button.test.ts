import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { OriButton } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

describe('OriButton', () => {
    it('renders a real <button type="button"> with the default token classes', () => {
        const wrapper = mount(OriButton, { props: { label: 'Save' } })
        const el = wrapper.element as HTMLButtonElement

        expect(el.tagName).toBe('BUTTON')
        expect(el.getAttribute('type')).toBe('button')
        for (const cls of [
            'ori-button',
            'ori-button_md',
            'ori-size-radius_full',
            'ori-font-size_md',
            'ori-variant_solid',
            'ori-color_primary'
        ]) {
            expect(wrapper.classes()).toContain(cls)
        }
        expect(wrapper.find('.ori-button__text').text()).toBe('Save')
    })

    it('maps variant / size / color / radius props to classes', () => {
        const wrapper = mount(OriButton, {
            props: { label: 'x', variant: 'soft', size: 'lg', color: 'danger', radius: 'sm' }
        })
        const c = wrapper.classes()

        expect(c).toContain('ori-variant_soft')
        expect(c).toContain('ori-button_lg')
        expect(c).toContain('ori-font-size_lg')
        expect(c).toContain('ori-color_danger')
        expect(c).toContain('ori-size-radius_sm')
    })

    // The headline a11y fix of the rebrand: `disabled` is the real DOM attribute. The old
    // V-button only added a pointer-events:none class, leaving the control focusable.
    it('disabled sets the real disabled attribute + aria-disabled', () => {
        const el = mount(OriButton, { props: { label: 'x', disabled: true } }).element as HTMLButtonElement

        expect(el.disabled).toBe(true)
        expect(el.getAttribute('aria-disabled')).toBe('true')
    })

    it('loading gates the button, sets aria-busy, swaps icon -> spinner', () => {
        const wrapper = mount(OriButton, { props: { label: 'x', loading: true, icon: 'M0 0' } })
        const el = wrapper.element as HTMLButtonElement

        expect(el.disabled).toBe(true)
        expect(el.getAttribute('aria-busy')).toBe('true')
        expect(wrapper.find('.ori-spinner').exists()).toBe(true)
        expect(wrapper.find('.ori-icon').exists()).toBe(false)
    })

    it('active reflects as the data-active attribute', () => {
        const el = mount(OriButton, { props: { label: 'x', active: true } }).element

        expect(el.getAttribute('data-active')).toBe('')
    })

    // ------------------------------------------------------------------
    // Toggle contract: `pressed` is the STATE (aria-pressed, announced), `active` is the LOOK
    // (data-active, a forced :active). Before this, a standalone toggle had only the look — it
    // announced nothing and painted the same pixels as :hover.
    // ------------------------------------------------------------------

    it('pressed renders aria-pressed (true and false are both real toggle states)', () => {
        expect(mount(OriButton, { props: { label: 'x', pressed: true } }).attributes('aria-pressed')).toBe('true')
        expect(mount(OriButton, { props: { label: 'x', pressed: false } }).attributes('aria-pressed')).toBe('false')
    })

    // Only holds because the SFC defaults `pressed = undefined`, opting out of Vue's absent-Boolean
    // coercion — without it every plain action button would announce itself as an unpressed toggle.
    it('omitting pressed renders no aria-pressed at all (plain action button)', () => {
        expect(mount(OriButton, { props: { label: 'x' } }).attributes('aria-pressed')).toBeUndefined()
    })

    it('active is a look, not a state: it never implies aria-pressed', () => {
        const el = mount(OriButton, { props: { label: 'x', active: true } }).element

        expect(el.getAttribute('data-active')).toBe('')
        expect(el.hasAttribute('aria-pressed')).toBe(false)
    })

    // OriToolbarButton / OriToolbarToggleItem pass aria-pressed as a fall-through ATTRIBUTE (the
    // toggle item gets it straight from the headless prop bag). The new `:aria-pressed="pressed"`
    // binding must not overwrite that with `undefined` — the exact failure mode ORI-I-13 recorded.
    it('a caller-supplied aria-pressed attribute survives the pressed binding', () => {
        const wrapper = mount(OriButton, { props: { label: 'x' }, attrs: { 'aria-pressed': 'true' } })

        expect(wrapper.attributes('aria-pressed')).toBe('true')
    })

    // ------------------------------------------------------------------
    // `loading` on a non-button `as`: no real `disabled` attribute exists to stop activation, and
    // CSS pointer-events:none never stops the keyboard (Enter on a focused <a> navigates).
    // ------------------------------------------------------------------

    it('loading on as="a" marks the link aria-disabled and blocks activation', async () => {
        const onClick = vi.fn()
        const wrapper = mount(OriButton, {
            props: { label: 'x', as: 'a', loading: true },
            attrs: { href: '/somewhere', onClick }
        })
        const el = wrapper.element as HTMLAnchorElement

        expect(el.tagName).toBe('A')
        expect(el.getAttribute('aria-disabled')).toBe('true')
        expect(el.getAttribute('aria-busy')).toBe('true')
        // Still focusable — a loading control keeps its place in the tab order and simply refuses.
        expect(el.getAttribute('tabindex')).toBeNull()

        const event = new MouseEvent('click', { bubbles: true, cancelable: true })
        el.dispatchEvent(event)

        expect(onClick).not.toHaveBeenCalled()
        expect(event.defaultPrevented).toBe(true)
    })

    it('disabled on as="a" blocks activation too', () => {
        const onClick = vi.fn()
        const el = mount(OriButton, {
            props: { label: 'x', as: 'a', disabled: true },
            attrs: { href: '/somewhere', onClick }
        }).element

        const event = new MouseEvent('click', { bubbles: true, cancelable: true })
        el.dispatchEvent(event)

        expect(onClick).not.toHaveBeenCalled()
        expect(event.defaultPrevented).toBe(true)
    })

    // The guard is scoped to non-button tags: a real <button> is stopped by the `disabled` attribute at
    // the source, and an enabled button must keep firing its caller's handler. The scoping is not just
    // tidiness — a capture listener bound unconditionally on the root swallows the caller's fall-through
    // `onClick` on a real button, which is exactly what this test caught.
    it('an enabled button still activates normally', async () => {
        const onClick = vi.fn()
        const el = mount(OriButton, { props: { label: 'x' }, attrs: { onClick } }).find('button').element

        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('loading on a real button keeps the disabled attribute and adds no aria-disabled', () => {
        const el = mount(OriButton, { props: { label: 'x', loading: true } }).element as HTMLButtonElement

        expect(el.disabled).toBe(true)
        expect(el.getAttribute('aria-disabled')).toBeNull()
    })

    it('as="a" drops the button-only attrs and guards focus when disabled', () => {
        const el = mount(OriButton, { props: { label: 'x', as: 'a', disabled: true } }).element

        expect(el.tagName).toBe('A')
        expect(el.getAttribute('type')).toBeNull()
        expect(el.hasAttribute('disabled')).toBe(false)
        expect(el.getAttribute('aria-disabled')).toBe('true')
        expect(el.getAttribute('tabindex')).toBe('-1')
    })

    // Icon mode is EXPLICIT: it needs the `icon` prop AND no text — never the mere absence of `text`.
    it('icon-only (icon prop, no text) takes the icon modifier class', () => {
        const wrapper = mount(OriButton, { props: { icon: 'M0 0' }, attrs: { 'aria-label': 'Menu' } })

        expect(wrapper.classes()).toContain('ori-button_icon')
    })

    it('a text button (no icon) is NOT icon mode', () => {
        const wrapper = mount(OriButton, { props: { label: 'Save' } })

        expect(wrapper.classes()).not.toContain('ori-button_icon')
    })

    it('a slot-only button (no icon, no text) is NOT forced into an icon square', () => {
        const wrapper = mount(OriButton, { slots: { default: 'Save' } })

        expect(wrapper.classes()).not.toContain('ori-button_icon')
    })

    it('an icon + text button is a labelled button, NOT an icon square', () => {
        const wrapper = mount(OriButton, { props: { icon: 'M0 0', label: 'Save' } })

        expect(wrapper.classes()).not.toContain('ori-button_icon')
    })

    it('has no axe violations when labeled', async () => {
        const wrapper = mount(OriButton, { props: { label: 'Save' }, attachTo: document.body })
        await expectNoA11yViolations(wrapper.element)
        wrapper.unmount()
    })
})

/**
 * Source-level guard for the pressed LOOK (same shape as tokens.contrast.test.ts / css.entries.test.ts:
 * it reads the shipped CSS, no build required). Two regressions are being held off at once, and they
 * pull in opposite directions:
 *
 *  1. The look must not be gated behind a `.ori-toolbar` ancestor again — that is what left every
 *     toggle button outside a toolbar with no pressed affordance (ORI-I-10 / ORI-I-41).
 *  2. The obvious "just ungate it" edit — one flat `.ori-button[aria-pressed='true'] {
 *     background-color: <neutral> }` — silently strips the role colour off every fill / tonal toggle
 *     (ORI-I-61). A literal background beats `.ori-button`'s own `background-color:
 *     var(--ori-variant-bg-color)` on specificity, so the pressed tint may only be applied to the
 *     variants whose background is `transparent`.
 */
describe('the pressed look in @oriui/css', () => {
    const componentsDir = resolve(process.cwd(), 'packages/css/src/components')
    const strip = (file: string) => readFileSync(resolve(componentsDir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

    // Every rule block whose selector list mentions [aria-pressed='true']. `[^{}]*` cannot cross a
    // brace, so the selector capture stops at the enclosing @layer / @media opening brace.
    const pressedRules = (css: string) =>
        [...css.matchAll(/([^{}]*\[aria-pressed='true'\][^{}]*)\{([^{}]*)\}/g)].map((m) => ({
            selectors: m[1]
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            declarations: m[2]
        }))

    const TRANSPARENT_VARIANTS = ['.ori-variant_text', '.ori-variant_plain', '.ori-variant_outline']

    it('button.css styles the pressed state on the button itself — no ancestor gate', () => {
        const rules = pressedRules(strip('button.css'))

        expect(rules.length).toBeGreaterThan(0)
        for (const rule of rules) {
            for (const selector of rule.selectors) {
                expect(selector, `pressed rule re-gated behind an ancestor: ${selector}`).not.toContain('.ori-toolbar')
                expect(selector).toContain('.ori-button')
            }
        }
    })

    it('the universal pressed affordance is an inset ring, which no variant can erase', () => {
        const ring = pressedRules(strip('button.css')).find(
            (rule) =>
                rule.selectors.length === 1 &&
                rule.selectors[0] === ".ori-button[aria-pressed='true']" &&
                /box-shadow:\s*inset/.test(rule.declarations)
        )

        expect(ring, 'no unconditional inset box-shadow for [aria-pressed="true"]').toBeDefined()
        // A ring is the only pressed declaration a solid / soft button gets, so it must never be a
        // background: `background-color` in the unconditional rule IS the ORI-I-61 regression.
        expect(ring?.declarations).not.toMatch(/background-color/)
    })

    it('the pressed tint reaches only the variants whose background is transparent', () => {
        for (const rule of pressedRules(strip('button.css'))) {
            if (!/background-color/.test(rule.declarations)) continue

            for (const selector of rule.selectors) {
                expect(
                    TRANSPARENT_VARIANTS.some((variant) => selector.includes(variant)),
                    `pressed background on a selector that can match fill / tonal: ${selector}`
                ).toBe(true)
            }
        }
    })

    it('toolbar.css no longer owns a pressed rule of its own', () => {
        expect(strip('toolbar.css')).not.toContain('aria-pressed')
    })
})
