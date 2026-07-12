import { describe, it, expect, vi, afterEach } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { derived, writable } from 'svelte/store';
import { isTargetOutside } from '@oriui/headless';
import { useDismissable as useDismissableVue } from '@oriui/headless/vue';
import { useDismissable as useDismissableSvelte } from '@oriui/headless/svelte';

// The shared dismiss layer: a pure `isTargetOutside` predicate + Vue/Svelte composables that attach the
// `document` pointerdown / focusin listeners while enabled. Exercised directly by dispatching events inside
// vs outside the registered element(s). (The Menu outside-click adoption is covered end-to-end by
// tests/menu.test.ts, the Combobox focus-out by tests/combobox.test.ts.)

afterEach(() => {
    document.body.innerHTML = '';
});

describe('isTargetOutside (core)', () => {
    it('is false inside any element, true when outside all', () => {
        const parent = document.createElement('div');
        const child = document.createElement('span');
        parent.appendChild(child);
        const other = document.createElement('div');

        expect(isTargetOutside(child, [parent])).toBe(false);
        expect(isTargetOutside(child, [null, undefined, parent])).toBe(false);
        expect(isTargetOutside(other, [parent])).toBe(true);
        expect(isTargetOutside(null, [parent])).toBe(true); // a null target counts as outside
    });
});

describe('useDismissable (Vue)', () => {
    it('pointerdown outside dismisses; inside does not; disabling removes the listener', async () => {
        const inside = document.createElement('div');
        const outside = document.createElement('div');
        document.body.append(inside, outside);
        const onDismiss = vi.fn();
        const enabled = ref(true);

        const scope = effectScope();
        scope.run(() =>
            useDismissableVue(() => ({
                enabled: enabled.value,
                elements: () => [inside],
                onDismiss,
                pointerDownOutside: true
            }))
        );
        await nextTick(); // flush: 'post' attach

        inside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled();

        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1);

        enabled.value = false;
        await nextTick();
        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1); // detached

        scope.stop();
    });

    it('only the requested strategy is wired (focusOutside → ignores pointerdown)', async () => {
        const outside = document.createElement('div');
        document.body.append(outside);
        const onDismiss = vi.fn();

        const scope = effectScope();
        scope.run(() =>
            useDismissableVue(() => ({ enabled: true, elements: () => [], onDismiss, focusOutside: true }))
        );
        await nextTick();

        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled(); // pointerdown not wired
        outside.dispatchEvent(new Event('focusin', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1);

        scope.stop();
    });

    it('stops listening after the scope disposes', async () => {
        const outside = document.createElement('div');
        document.body.append(outside);
        const onDismiss = vi.fn();

        const scope = effectScope();
        scope.run(() =>
            useDismissableVue(() => ({ enabled: true, elements: () => [], onDismiss, pointerDownOutside: true }))
        );
        await nextTick();
        scope.stop();

        outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled();
    });
});

describe('useDismissable (Svelte)', () => {
    it('focusin outside dismisses; inside does not; toggling enabled attaches/detaches', () => {
        const inside = document.createElement('div');
        const outside = document.createElement('div');
        document.body.append(inside, outside);
        const onDismiss = vi.fn();
        const enabled = writable(true);

        useDismissableSvelte(
            derived(enabled, (e) => ({ enabled: e, elements: () => [inside], onDismiss, focusOutside: true }))
        );

        inside.dispatchEvent(new Event('focusin', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled();

        outside.dispatchEvent(new Event('focusin', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1);

        enabled.set(false);
        outside.dispatchEvent(new Event('focusin', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledTimes(1); // detached
    });
});
