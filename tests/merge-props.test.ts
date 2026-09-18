import { describe, it, expect, vi } from 'vitest'
import { mergeProps } from '@oriui/headless'

// `mergeProps` is the framework-free half of the prop-getter story: it lets a consumer layer their own
// handler / class / style on top of a bag a `connect()` produced without clobbering it. Vue ships its own
// (and Vue users should use that one — the names collide); this export serves the Svelte / React / plain-DOM
// paths, where nothing equivalent exists. These specs pin the four merge rules and the documented limit
// (`class` values must be strings) so the helper is a contract rather than an assumption.

describe('mergeProps', () => {
    it('chains `on*` handlers left-to-right and passes every argument through', () => {
        const order: string[] = []
        const first = vi.fn(() => order.push('first'))
        const second = vi.fn(() => order.push('second'))

        const merged = mergeProps({ onClick: first }, { onClick: second })
        ;(merged.onClick as (...args: unknown[]) => void)('a', 1)

        expect(order).toEqual(['first', 'second'])
        expect(first).toHaveBeenCalledWith('a', 1)
        expect(second).toHaveBeenCalledWith('a', 1)
    })

    it('chains only when BOTH values are functions — otherwise the later one wins', () => {
        const handler = vi.fn()
        expect(mergeProps({ onClick: undefined }, { onClick: handler }).onClick).toBe(handler)
        // A non-handler key is never chained, even when both sides are functions.
        const format = () => 'x'
        expect(mergeProps({ format: () => 'y' }, { format }).format).toBe(format)
    })

    it('concatenates `class` and `className` instead of replacing them', () => {
        expect(mergeProps({ class: 'ori-button' }, { class: 'mine' }).class).toBe('ori-button mine')
        expect(mergeProps({ className: 'ori-button' }, { className: 'mine' }).className).toBe('ori-button mine')
        // A blank / absent side contributes nothing — it must neither leave a stray space nor WIPE the
        // bag's own classes, which is what a consumer's `class: props.class ?? ''` would otherwise do.
        expect(mergeProps({ class: 'ori-button' }, { class: '' }).class).toBe('ori-button')
        expect(mergeProps({ class: 'ori-button' }, {}).class).toBe('ori-button')
        expect(mergeProps({ class: '' }, { class: 'mine' }).class).toBe('mine')
        expect(mergeProps({}, { class: 'mine' }).class).toBe('mine')
    })

    it('shallow-merges `style` objects, later keys winning', () => {
        const merged = mergeProps(
            { style: { color: 'red', margin: '0' } },
            { style: { color: 'blue', padding: '1px' } }
        )
        expect(merged.style).toEqual({ color: 'blue', margin: '0', padding: '1px' })
    })

    it('lets a later DEFINED value win, while `undefined` never clobbers an earlier one', () => {
        expect(mergeProps({ id: 'a' }, { id: 'b' }).id).toBe('b')
        expect(mergeProps({ id: 'a' }, { id: undefined }).id).toBe('a')
        expect(mergeProps({ hidden: true }, { hidden: false }).hidden).toBe(false)
    })

    it('merges more than two sources, left to right', () => {
        const merged = mergeProps({ class: 'a', id: '1' }, { class: 'b' }, { class: 'c', id: '2' })
        expect(merged).toMatchObject({ class: 'a b c', id: '2' })
    })
})
