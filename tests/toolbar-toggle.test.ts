import { describe, it, expect, afterEach, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { get, writable } from 'svelte/store'
import { isToolbarTogglePressed, resolveToolbarToggle, type ToolbarToggleValue } from '@oriui/headless'
import { useToolbarToggleGroup as useGroupVue, useToolbarToggleItem as useItemVue } from '@oriui/headless/vue'

/**
 * The toolbar toggle group's SELECTION rules — the one thing the three adapters used to hand-write three
 * times, and the home of two register entries:
 *
 * - ORI-I-48: `type: 'single'` was unconditionally deselectable. Pressing the active item always cleared
 *   it, so a tool picker that must always have a tool was impossible and its only consumer guarded it by
 *   hand. `deselectable` (default `true`, today's behaviour) is the missing option.
 * - ORI-I-04: the options interfaces mixed idioms — Vue's `value` was a bare getter while `type` beside
 *   it was a `MaybeRefOrGetter`, and Svelte's toggle group took per-member stores while every other
 *   Svelte composable (its own `useToolbar` included) takes `MaybeReactive<UseXOptions>`.
 *
 * So: the rules once, as a truth table over the shared `../core/toolbar` helpers, then each adapter's
 * plumbing to them in that adapter's own idiom. React's half lives in tests/react-toolbar.test.ts, on the
 * component-tree harness already there.
 *
 * Svelte's toggle group only reaches its items through `setContext`, which throws outside component init,
 * and this suite runs composables without rendering Svelte components — so `svelte`'s context pair is
 * replaced by the Map it effectively is. Everything under test is still our code.
 */
vi.mock('svelte', async (importOriginal) => {
    const actual = await importOriginal<typeof import('svelte')>()
    const contexts = new Map<unknown, unknown>()
    return {
        ...actual,
        setContext: (key: unknown, value: unknown) => {
            contexts.set(key, value)
            return value
        },
        getContext: (key: unknown) => contexts.get(key)
    }
})

const { useToolbarToggleGroup: useGroupSvelte, useToolbarToggleItem: useItemSvelte } =
    await import('@oriui/headless/svelte')

afterEach(() => {
    document.body.innerHTML = ''
})

// ── the rules, once ────────────────────────────────────────────────────────────────────────────

describe('core resolveToolbarToggle', () => {
    it("type='single' selects, switches and (by default) clears on re-press", () => {
        expect(resolveToolbarToggle('single', undefined, 'pen')).toBe('pen')
        expect(resolveToolbarToggle('single', 'eraser', 'pen')).toBe('pen')
        expect(resolveToolbarToggle('single', 'pen', 'pen')).toBeUndefined()
    })

    it("type='single' + deselectable:false keeps the pressed value, returning it UNCHANGED", () => {
        // Same reference back = "nothing happened", which is how an adapter skips the redundant commit.
        expect(resolveToolbarToggle('single', 'pen', 'pen', false)).toBe('pen')
        // Switching is still allowed — only emptying is refused.
        expect(resolveToolbarToggle('single', 'pen', 'eraser', false)).toBe('eraser')
    })

    it("type='multiple' adds and removes independently", () => {
        expect(resolveToolbarToggle('multiple', undefined, 'bold')).toEqual(['bold'])
        expect(resolveToolbarToggle('multiple', ['bold'], 'italic')).toEqual(['bold', 'italic'])
        expect(resolveToolbarToggle('multiple', ['bold', 'italic'], 'bold')).toEqual(['italic'])
    })

    it("type='multiple' + deselectable:false refuses to empty the set, but not to shrink it", () => {
        const two = ['bold', 'italic']
        expect(resolveToolbarToggle('multiple', two, 'bold', false)).toEqual(['italic'])

        const one = ['bold']
        expect(resolveToolbarToggle('multiple', one, 'bold', false)).toBe(one) // unchanged, same reference
    })

    it('isToolbarTogglePressed reads either selection shape', () => {
        expect(isToolbarTogglePressed('single', 'pen', 'pen')).toBe(true)
        expect(isToolbarTogglePressed('single', 'pen', 'eraser')).toBe(false)
        expect(isToolbarTogglePressed('multiple', ['bold'], 'bold')).toBe(true)
        expect(isToolbarTogglePressed('multiple', undefined, 'bold')).toBe(false)
    })
})

// ── Vue: per-member MaybeRefOrGetter, the idiom its own `useToolbar` uses ───────────────────────

const VueItem = defineComponent({
    props: { value: { type: String, required: true } },
    setup(props) {
        const { itemProps, pressed } = useItemVue(() => props.value)
        return () => h('button', { ...itemProps.value, 'data-testid': props.value }, pressed.value ? 'on' : 'off')
    }
})

/** Mounts a group of two toggle items over whatever `value` form the caller wants to prove works. */
function mountVueGroup(options: Parameters<typeof useGroupVue>[0]) {
    const Group = defineComponent({
        setup() {
            const { groupProps } = useGroupVue(options)
            return () => h('div', groupProps.value, [h(VueItem, { value: 'pen' }), h(VueItem, { value: 'eraser' })])
        }
    })
    return mount(Group, { attachTo: document.body })
}

describe('Vue useToolbarToggleGroup — `value` accepts the whole MaybeRefOrGetter family (ORI-I-04)', () => {
    it('takes a ref: reads it for aria-pressed and re-reads it on press', async () => {
        const value = ref<ToolbarToggleValue>('pen')
        const wrapper = mountVueGroup({ type: 'single', value, onChange: (next) => (value.value = next) })

        expect(wrapper.get('[data-testid="pen"]').attributes('aria-pressed')).toBe('true')

        await wrapper.get('[data-testid="eraser"]').trigger('click')
        expect(value.value).toBe('eraser')
        expect(wrapper.get('[data-testid="pen"]').attributes('aria-pressed')).toBe('false')
        expect(wrapper.get('[data-testid="eraser"]').attributes('aria-pressed')).toBe('true')
    })

    it('takes a plain value', () => {
        const wrapper = mountVueGroup({ type: 'single', value: 'eraser', onChange: () => {} })

        expect(wrapper.get('[data-testid="eraser"]').attributes('aria-pressed')).toBe('true')
    })

    it('still takes a getter — the form the styled OriToolbarToggleGroup passes', async () => {
        const value = ref<ToolbarToggleValue>(undefined)
        const wrapper = mountVueGroup({
            type: () => 'single',
            value: () => value.value,
            onChange: (next) => (value.value = next)
        })

        await wrapper.get('[data-testid="pen"]').trigger('click')
        expect(value.value).toBe('pen')
    })
})

describe('Vue useToolbarToggleGroup — deselectable (ORI-I-48)', () => {
    it('defaults to deselectable: re-pressing the active item clears the selection', async () => {
        const value = ref<ToolbarToggleValue>('pen')
        const wrapper = mountVueGroup({ type: 'single', value, onChange: (next) => (value.value = next) })

        await wrapper.get('[data-testid="pen"]').trigger('click')
        expect(value.value).toBeUndefined()
    })

    it('deselectable:false pins the selection — no clear, and no redundant onChange', async () => {
        const value = ref<ToolbarToggleValue>('pen')
        const onChange = vi.fn((next: ToolbarToggleValue) => (value.value = next))
        const wrapper = mountVueGroup({ type: 'single', value, deselectable: false, onChange })

        await wrapper.get('[data-testid="pen"]').trigger('click')
        expect(onChange).not.toHaveBeenCalled()
        expect(value.value).toBe('pen')
        expect(wrapper.get('[data-testid="pen"]').attributes('aria-pressed')).toBe('true')

        // Switching tools is untouched — only emptying is refused.
        await wrapper.get('[data-testid="eraser"]').trigger('click')
        expect(onChange).toHaveBeenCalledWith('eraser')
        expect(value.value).toBe('eraser')
    })

    it('deselectable is live: flipping it at runtime changes the next press', async () => {
        const value = ref<ToolbarToggleValue>('pen')
        const deselectable = ref(false)
        const wrapper = mountVueGroup({
            type: 'single',
            value,
            deselectable,
            onChange: (next) => (value.value = next)
        })

        await wrapper.get('[data-testid="pen"]').trigger('click')
        expect(value.value).toBe('pen')

        deselectable.value = true
        await nextTick()
        await wrapper.get('[data-testid="pen"]').trigger('click')
        expect(value.value).toBeUndefined()
    })
})

// ── Svelte: MaybeReactive<Options>, the idiom its own `useToolbar` uses ─────────────────────────

describe('Svelte useToolbarToggleGroup — options are the whole object, plain or a store (ORI-I-04)', () => {
    it('takes a plain options object', () => {
        const onChange = vi.fn()
        useGroupSvelte({ type: 'single', value: 'pen', onChange })
        const { itemProps, pressed } = useItemSvelte('pen')

        expect(get(pressed)).toBe(true)
        expect(get(itemProps)['aria-pressed']).toBe(true)

        get(itemProps).onclick()
        expect(onChange).toHaveBeenCalledWith(undefined) // re-press clears, the default
    })

    it('takes a Readable of the options and re-reads BOTH the pressed state and the press target', () => {
        const onChange = vi.fn()
        const options = writable({ type: 'single' as const, value: 'pen' as ToolbarToggleValue, onChange })
        useGroupSvelte(options)
        const { itemProps, pressed } = useItemSvelte('eraser')

        expect(get(pressed)).toBe(false)

        options.set({ type: 'single', value: 'eraser', onChange })
        expect(get(pressed)).toBe(true) // the store change reached aria-pressed

        get(itemProps).onclick()
        expect(onChange).toHaveBeenCalledWith(undefined) // …and the press read the NEW value, not the seed
    })
})

describe('Svelte useToolbarToggleGroup — deselectable (ORI-I-48)', () => {
    it('deselectable:false pins the selection — no clear, and no redundant onChange', () => {
        const onChange = vi.fn()
        useGroupSvelte({ type: 'single', value: 'pen', deselectable: false, onChange })

        const pen = useItemSvelte('pen')
        get(pen.itemProps).onclick()
        expect(onChange).not.toHaveBeenCalled()
        expect(get(pen.pressed)).toBe(true)

        const eraser = useItemSvelte('eraser')
        get(eraser.itemProps).onclick()
        expect(onChange).toHaveBeenCalledWith('eraser') // switching still commits
    })

    it("deselectable:false under type='multiple' refuses to empty the set", () => {
        const onChange = vi.fn()
        useGroupSvelte({ type: 'multiple', value: ['bold'], deselectable: false, onChange })

        const bold = useItemSvelte('bold')
        get(bold.itemProps).onclick()
        expect(onChange).not.toHaveBeenCalled()

        const italic = useItemSvelte('italic')
        get(italic.itemProps).onclick()
        expect(onChange).toHaveBeenCalledWith(['bold', 'italic'])
    })
})
