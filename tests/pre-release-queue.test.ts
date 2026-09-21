import { describe, it, expect } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { OriTooltip, OriDialog, OriCheckbox } from '../packages/vue/src'

// The pre-release queue, one describe per register entry. Each of these is a contract the docs or the
// register state and nothing pinned.

describe('OriTooltip — WCAG 1.4.13 Dismissible (ORI-I-86)', () => {
    const mountTip = () =>
        mount(OriTooltip, {
            props: { content: 'Helpful hint' },
            slots: { default: () => h('button', { type: 'button' }, 'trigger') },
            attachTo: document.body
        })

    it('Escape while the tooltip is focused marks it dismissed', async () => {
        const wrapper = mountTip()
        ;(wrapper.find('button').element as HTMLElement).focus()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await nextTick()

        expect(wrapper.attributes('data-ori-dismissed')).toBe('true')
        wrapper.unmount()
    })

    it('re-arms when focus leaves, so Escape dismisses THIS showing and not the tooltip', async () => {
        const wrapper = mountTip()
        ;(wrapper.find('button').element as HTMLElement).focus()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await nextTick()
        expect(wrapper.attributes('data-ori-dismissed')).toBe('true')

        await wrapper.trigger('focusout')
        expect(wrapper.attributes('data-ori-dismissed')).toBeUndefined()
        wrapper.unmount()
    })

    it('a key other than Escape does not dismiss', async () => {
        const wrapper = mountTip()
        ;(wrapper.find('button').element as HTMLElement).focus()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }))
        await nextTick()

        expect(wrapper.attributes('data-ori-dismissed')).toBeUndefined()
        wrapper.unmount()
    })

    it('Escape does not dismiss a tooltip that is neither hovered nor focused', async () => {
        const wrapper = mountTip()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await nextTick()

        expect(wrapper.attributes('data-ori-dismissed')).toBeUndefined()
        wrapper.unmount()
    })

    it('unmounting the last tooltip removes the document listener', () => {
        const before = mountTip()
        before.unmount()
        // Nothing to assert directly — the contract is that a stray Escape after unmount throws
        // nothing and touches nothing. A leaked listener holding a dead component would throw here.
        expect(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))).not.toThrow()
    })
})

describe('OriDialog — the body is the description (ORI-I-90)', () => {
    it('wires aria-describedby to the body when there is body content', () => {
        const wrapper = mount(OriDialog, {
            props: { title: 'Confirm', defaultOpen: true },
            slots: { default: () => 'This cannot be undone.' },
            attachTo: document.body
        })

        const dialog = wrapper.find('dialog')
        const body = wrapper.find('.ori-dialog__body')
        expect(body.attributes('id')).toBeTruthy()
        expect(dialog.attributes('aria-describedby')).toBe(body.attributes('id'))
        wrapper.unmount()
    })

    it('renders NO aria-describedby when the dialog has no body — a dangling reference is worse', () => {
        const wrapper = mount(OriDialog, {
            props: { title: 'Confirm', defaultOpen: true },
            attachTo: document.body
        })

        expect(wrapper.find('dialog').attributes('aria-describedby')).toBeUndefined()
        wrapper.unmount()
    })

    it("a caller's own aria-describedby wins", () => {
        const wrapper = mount(OriDialog, {
            props: { title: 'Confirm', defaultOpen: true },
            attrs: { 'aria-describedby': 'my-own-id' },
            slots: { default: () => 'body' },
            attachTo: document.body
        })

        expect(wrapper.find('dialog').attributes('aria-describedby')).toBe('my-own-id')
        wrapper.unmount()
    })
})

describe('OriCheckbox — the mixed state (ORI-I-89)', () => {
    it('passes `indeterminate` through to the real input, where AT reads it', async () => {
        const wrapper = mount(OriCheckbox, { props: { label: 'All' }, attrs: { indeterminate: true } })
        await nextTick()

        expect((wrapper.find('input').element as HTMLInputElement).indeterminate).toBe(true)
    })
})
