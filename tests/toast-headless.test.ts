import { afterEach, describe, it, expect, vi } from 'vitest';
import { get } from 'svelte/store';
import { createToastQueue, type ToastItem } from '../packages/headless/src/core/toast';
import { useToast as useToastSvelte } from '@oriui/headless/svelte';
import { useToast as useToastHeadlessVue } from '@oriui/headless/vue';
import { useToast as useToastPkg } from '../packages/vue/src';

// The toast queue moved into @oriui/headless: a framework-agnostic engine (`createToastQueue`) projected
// into a Vue reactive array and a Svelte readable store. The Vue *behaviour* is covered by tests/toast.test.ts
// (which imports from @oriui/vue → the re-exported Vue adapter). This file covers the NEW surface: the core
// engine directly, the Svelte adapter, and that the @oriui/vue re-export shares one singleton with the
// @oriui/headless/vue path.

describe('createToastQueue (core engine)', () => {
    it('instances are independent — no shared singleton', () => {
        const a = createToastQueue();
        const b = createToastQueue();
        a.push('x');
        expect(a.getToasts()).toHaveLength(1);
        expect(b.getToasts()).toHaveLength(0);
    });

    it('push returns a distinct numeric id, sets defaults, and merges options', () => {
        const q = createToastQueue();
        const id = q.push('hello');
        expect(typeof id).toBe('number');
        expect(q.getToasts()[0]).toMatchObject({ id, text: 'hello', duration: 4000, closable: true });

        q.push({ text: 'c', closable: false, duration: 2000 });
        expect(q.getToasts()[1]).toMatchObject({ text: 'c', closable: false, duration: 2000 });
        expect(new Set(q.getToasts().map((t) => t.id)).size).toBe(2);
    });

    it('fallbackColor supplies the default color; explicit color overrides it', () => {
        const q = createToastQueue();
        q.push('a', 'success');
        q.push({ text: 'b', color: 'info' }, 'success');
        expect(q.getToasts()[0].color).toBe('success');
        expect(q.getToasts()[1].color).toBe('info');
    });

    it('getToasts returns a fresh snapshot — mutating it does not touch the queue', () => {
        const q = createToastQueue();
        q.push('x');
        const snap = q.getToasts() as ToastItem[];
        snap.push({ id: 99 });
        expect(q.getToasts()).toHaveLength(1);
    });

    it('notifies subscribers on real changes and stops after unsubscribe', () => {
        const q = createToastQueue();
        const spy = vi.fn();
        const unsub = q.subscribe(spy);

        const id = q.push('a'); // +1
        q.dismiss(id); // +1 (removed)
        q.dismiss(999); // unknown id → no notify
        q.push('b'); // +1
        q.clear(); // +1 (was non-empty)
        q.clear(); // already empty → no notify
        expect(spy).toHaveBeenCalledTimes(4);

        unsub();
        q.push('c');
        expect(spy).toHaveBeenCalledTimes(4); // no longer notified
    });

    it('auto-dismisses after duration; duration 0 sticks; clear cancels timers', () => {
        vi.useFakeTimers();
        const q = createToastQueue();

        q.push({ text: 'brief', duration: 1000 });
        q.push({ text: 'sticky', duration: 0 });
        expect(q.getToasts()).toHaveLength(2);

        vi.advanceTimersByTime(1001);
        expect(q.getToasts().map((t) => t.text)).toEqual(['sticky']); // brief auto-dismissed, sticky stays

        q.push({ text: 'later', duration: 5000 });
        q.clear();
        expect(() => vi.advanceTimersByTime(10_000)).not.toThrow(); // cleared timers don't fire
        expect(q.getToasts()).toHaveLength(0);
        vi.useRealTimers();
    });
});

describe('useToast (Svelte adapter)', () => {
    afterEach(() => useToastSvelte().clear());

    it('projects the queue into a readable store — push / severity / dismiss / clear', () => {
        const { toasts, toast, success, dismiss, clear } = useToastSvelte();
        expect(get(toasts)).toHaveLength(0);

        const id = toast('hi');
        expect(get(toasts)).toHaveLength(1);
        expect(get(toasts)[0].text).toBe('hi');

        success('saved');
        expect(get(toasts).at(-1)?.color).toBe('success');

        dismiss(id);
        expect(get(toasts).map((t) => t.text)).toEqual(['saved']);

        clear();
        expect(get(toasts)).toHaveLength(0);
    });

    it('live subscription re-emits the latest queue on every change', () => {
        const { toasts, toast } = useToastSvelte();
        let latest = -1;
        const unsub = toasts.subscribe((list) => (latest = list.length));
        expect(latest).toBe(0);
        toast('a');
        expect(latest).toBe(1);
        toast('b');
        expect(latest).toBe(2);
        unsub();
    });
});

describe('useToast (Vue re-export shares the singleton)', () => {
    afterEach(() => useToastHeadlessVue().clear());

    it('a push via @oriui/headless/vue shows in the @oriui/vue re-export (one queue)', () => {
        const headless = useToastHeadlessVue();
        const pkg = useToastPkg();
        headless.clear();

        headless.toast('shared');
        expect(pkg.toasts).toHaveLength(1);
        expect(pkg.toasts[0].text).toBe('shared');
    });
});
