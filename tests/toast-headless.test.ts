import { afterEach, describe, it, expect, vi } from 'vitest'
import { get } from 'svelte/store'
import { createToastQueue, type ToastItem } from '../packages/headless/src/core/toast'
import { useToast as useToastSvelte } from '@oriui/headless/svelte'
import { useToast as useToastHeadlessVue } from '@oriui/headless/vue'
import { useToast as useToastPkg } from '../packages/vue/src'
import type { ToastColor } from '@oriui/headless/vue'
import type { ThemeColor } from '../packages/vue/src/types'

// Drift guard: the core queue duplicates @oriui/vue's ThemeColor as ToastColor (it can't import up the
// dependency graph, vue → headless). Assert the two unions stay MUTUALLY assignable, so any divergence
// fails `npm run test:types` HERE — at the drift source — not silently at a downstream toast({ color }) call.
type Mutual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
const _toastColorMatchesThemeColor: Mutual<ToastColor, ThemeColor> = true
void _toastColorMatchesThemeColor

// The toast queue moved into @oriui/headless: a framework-agnostic engine (`createToastQueue`) projected
// into a Vue reactive array and a Svelte readable store. The Vue *behaviour* is covered by tests/toast.test.ts
// (which imports from @oriui/vue → the re-exported Vue adapter). This file covers the NEW surface: the core
// engine directly, the Svelte adapter, and that the @oriui/vue re-export shares one singleton with the
// @oriui/headless/vue path.

describe('createToastQueue (core engine)', () => {
    it('instances are independent — no shared singleton', () => {
        const a = createToastQueue()
        const b = createToastQueue()
        a.push('x')
        expect(a.getToasts()).toHaveLength(1)
        expect(b.getToasts()).toHaveLength(0)
    })

    it('push returns a distinct numeric id, sets defaults, and merges options', () => {
        const q = createToastQueue()
        const id = q.push('hello')
        expect(typeof id).toBe('number')
        // `closable` is deliberately NOT stamped: the queue must not out-vote OriToast's own default,
        // or a caller who says nothing gets a dismiss button they never asked for.
        expect(q.getToasts()[0]).toMatchObject({ id, text: 'hello', duration: 4000 })
        expect(q.getToasts()[0].closable).toBeUndefined()

        q.push({ text: 'c', closable: false, duration: 2000 })
        expect(q.getToasts()[1]).toMatchObject({ text: 'c', closable: false, duration: 2000 })
        expect(new Set(q.getToasts().map((t) => t.id)).size).toBe(2)
    })

    it('a toast that never auto-dismisses opts itself into a close button', () => {
        const q = createToastQueue()
        // duration 0 means no timer at all — without a dismiss affordance it could never be got rid of.
        q.push({ text: 'stuck', duration: 0 })
        expect(q.getToasts()[0].closable).toBe(true)

        // ...and an explicit choice still wins, even that one.
        q.push({ text: 'stuck but bare', duration: 0, closable: false })
        expect(q.getToasts()[1].closable).toBe(false)
    })

    it('fallbackColor supplies the default color; explicit color overrides it', () => {
        const q = createToastQueue()
        q.push('a', 'success')
        q.push({ text: 'b', color: 'info' }, 'success')
        expect(q.getToasts()[0].color).toBe('success')
        expect(q.getToasts()[1].color).toBe('info')
    })

    it('getToasts returns a fresh snapshot — mutating it does not touch the queue', () => {
        const q = createToastQueue()
        q.push('x')
        const snap = q.getToasts() as ToastItem[]
        snap.push({ id: 99 })
        expect(q.getToasts()).toHaveLength(1)
    })

    it('notifies subscribers on real changes and stops after unsubscribe', () => {
        const q = createToastQueue()
        const spy = vi.fn()
        const unsub = q.subscribe(spy)

        const id = q.push('a') // +1
        q.dismiss(id) // +1 (removed)
        q.dismiss(999) // unknown id → no notify
        q.push('b') // +1
        q.clear() // +1 (was non-empty)
        q.clear() // already empty → no notify
        expect(spy).toHaveBeenCalledTimes(4)

        unsub()
        q.push('c')
        expect(spy).toHaveBeenCalledTimes(4) // no longer notified
    })

    it('auto-dismisses after duration; duration 0 sticks; clear cancels timers', () => {
        vi.useFakeTimers()
        const q = createToastQueue()

        q.push({ text: 'brief', duration: 1000 })
        q.push({ text: 'sticky', duration: 0 })
        expect(q.getToasts()).toHaveLength(2)

        vi.advanceTimersByTime(1001)
        expect(q.getToasts().map((t) => t.text)).toEqual(['sticky']) // brief auto-dismissed, sticky stays

        q.push({ text: 'later', duration: 5000 })
        q.clear()
        expect(() => vi.advanceTimersByTime(10_000)).not.toThrow() // cleared timers don't fire
        expect(q.getToasts()).toHaveLength(0)
        vi.useRealTimers()
    })

    it('pause stops every countdown; resume restarts each with the time it had left', () => {
        vi.useFakeTimers()
        const q = createToastQueue()
        const texts = () => q.getToasts().map((t) => t.text)

        q.push({ text: 'a', duration: 1000 })
        vi.advanceTimersByTime(600)
        q.pause()
        q.push({ text: 'b', duration: 1000 }) // pushed while paused: waits as well
        vi.advanceTimersByTime(10_000)
        expect(texts()).toEqual(['a', 'b'])

        q.resume()
        vi.advanceTimersByTime(399)
        expect(texts()).toEqual(['a', 'b'])
        vi.advanceTimersByTime(1) // a had 400 ms left
        expect(texts()).toEqual(['b'])
        vi.advanceTimersByTime(600) // b had its full 1000 ms
        expect(texts()).toEqual([])
        vi.useRealTimers()
    })

    it('pause and resume are idempotent', () => {
        vi.useFakeTimers()
        const q = createToastQueue()
        q.push({ text: 'a', duration: 1000 })

        q.pause()
        q.pause()
        q.resume()
        q.resume()
        vi.advanceTimersByTime(1000)
        expect(q.getToasts()).toHaveLength(0)
        vi.useRealTimers()
    })

    it('keeps an action on the item', () => {
        const q = createToastQueue()
        const onClick = vi.fn()
        q.push({ text: 'Deleted', action: { label: 'Undo', onClick } })
        expect(q.getToasts()[0]?.action).toEqual({ label: 'Undo', onClick })
    })
})

describe('useToast (Svelte adapter)', () => {
    afterEach(() => useToastSvelte().clear())

    it('projects the queue into a readable store — push / severity / dismiss / clear', () => {
        const { toasts, toast, success, dismiss, clear } = useToastSvelte()
        expect(get(toasts)).toHaveLength(0)

        const id = toast('hi')
        expect(get(toasts)).toHaveLength(1)
        expect(get(toasts)[0].text).toBe('hi')

        success('saved')
        expect(get(toasts).at(-1)?.color).toBe('success')

        dismiss(id)
        expect(get(toasts).map((t) => t.text)).toEqual(['saved'])

        clear()
        expect(get(toasts)).toHaveLength(0)
    })

    it('live subscription re-emits the latest queue on every change', () => {
        const { toasts, toast } = useToastSvelte()
        let latest = -1
        const unsub = toasts.subscribe((list) => (latest = list.length))
        expect(latest).toBe(0)
        toast('a')
        expect(latest).toBe(1)
        toast('b')
        expect(latest).toBe(2)
        unsub()
    })
})

describe('useToast (Vue re-export shares the singleton)', () => {
    afterEach(() => useToastHeadlessVue().clear())

    it('a push via @oriui/headless/vue shows in the @oriui/vue re-export (one queue)', () => {
        const headless = useToastHeadlessVue()
        const pkg = useToastPkg()
        headless.clear()

        headless.toast('shared')
        expect(pkg.toasts).toHaveLength(1)
        expect(pkg.toasts[0].text).toBe('shared')
    })
})
