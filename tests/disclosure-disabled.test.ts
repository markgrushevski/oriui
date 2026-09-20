import { afterEach, describe, it, expect, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { derived, get, writable } from 'svelte/store'
import { renderHook, act, cleanup } from '@testing-library/react'
import { disclosure } from '@oriui/headless'
import { useDisclosure as useDisclosureVue, type DisclosureControl } from '@oriui/headless/vue'
import { nativeDisclosure as nativeDisclosureSvelte } from '@oriui/headless/svelte'
import { useDisclosure as useDisclosureReact } from '@oriui/headless/react'

// `disabled` is the one disclosure option that is LIVE state, not a seed: a consumer binds it to a form
// that disables its sections while saving. The composables advertise a reactive options form
// (`MaybeRefOrGetter` / a store / a fresh object each render), so the machine has to hear about the change
// — before this, the adapters read `disabled` once at creation and the flag was frozen for good.
// These specs pin the core event and all three adapters' re-sync.

afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
})

describe('core disclosure machine — SET_DISABLED', () => {
    it('flips `disabled` and refuses TOGGLE while set, without collapsing open content', () => {
        const service = disclosure.machine({ id: 'core' })
        service.send({ type: 'OPEN' })

        service.send({ type: 'SET_DISABLED', disabled: true })
        expect(service.getState().disabled).toBe(true)
        // Deliberately NOT the menu / combobox behaviour (they close): an expanded panel whose trigger is
        // disabled is the accordion idiom for "this section must stay open".
        expect(service.getState().open).toBe(true)

        service.send({ type: 'TOGGLE' })
        expect(service.getState().open).toBe(true)

        service.send({ type: 'SET_DISABLED', disabled: false })
        service.send({ type: 'TOGGLE' })
        expect(service.getState().open).toBe(false)
    })

    it('is a no-op when the value is unchanged (no spurious re-render)', () => {
        const service = disclosure.machine({ id: 'core2', disabled: true })
        const listener = vi.fn()
        service.subscribe(listener)

        service.send({ type: 'SET_DISABLED', disabled: true })
        expect(listener).not.toHaveBeenCalled()

        service.send({ type: 'SET_DISABLED', disabled: false })
        expect(listener).toHaveBeenCalledTimes(1)
    })
})

describe('Vue useDisclosure — a getter-bound `disabled` stays live', () => {
    function mountDisclosure(disabled: ReturnType<typeof ref<boolean>>) {
        let api!: DisclosureControl
        const wrapper = mount(
            defineComponent({
                setup() {
                    api = useDisclosureVue(() => ({ id: 'vd', disabled: disabled.value }))
                    return () => h('div')
                }
            })
        )
        return { wrapper, api: () => api }
    }

    it('re-reads the option past the first render and the trigger bag follows', async () => {
        const disabled = ref(false)
        const { wrapper, api } = mountDisclosure(disabled)

        expect(api().triggerProps.value.disabled).toBeUndefined()
        expect(api().triggerProps.value['data-disabled']).toBeUndefined()

        disabled.value = true
        await nextTick()

        expect(api().triggerProps.value.disabled).toBe(true)
        expect(api().triggerProps.value['data-disabled']).toBe('')

        // Not just an attribute: the behaviour goes with it.
        api().toggle()
        expect(api().open.value).toBe(false)

        disabled.value = false
        await nextTick()
        api().toggle()
        expect(api().open.value).toBe(true)
        expect(api().triggerProps.value.disabled).toBeUndefined()

        wrapper.unmount()
    })
})

describe('Svelte nativeDisclosure — a store-bound `disabled` stays live', () => {
    it('re-reads the option from the options store and the trigger bag follows', () => {
        const disabled = writable(false)
        const d = nativeDisclosureSvelte(derived(disabled, (value) => ({ id: 'sd', disabled: value })))

        expect(get(d.triggerProps).disabled).toBeUndefined()

        disabled.set(true)
        expect(get(d.triggerProps).disabled).toBe(true)
        expect(get(d.triggerProps)['data-disabled']).toBe('')

        d.toggle()
        expect(get(d.open)).toBe(false)

        disabled.set(false)
        d.toggle()
        expect(get(d.open)).toBe(true)
    })

    it('still accepts a plain options object (the snapshot call style is unchanged)', () => {
        const d = nativeDisclosureSvelte({ id: 'quiet', disabled: true })
        expect(get(d.triggerProps).disabled).toBe(true)
        d.toggle()
        expect(get(d.open)).toBe(false)
    })
})

describe('React useDisclosure — `disabled` tracks the prop', () => {
    it('re-syncs on re-render and the trigger bag follows', () => {
        const { result, rerender } = renderHook(
            (props: { disabled: boolean }) => useDisclosureReact({ id: 'rd', disabled: props.disabled }),
            { initialProps: { disabled: false } }
        )

        expect(result.current.triggerProps.disabled).toBeUndefined()

        rerender({ disabled: true })
        expect(result.current.triggerProps.disabled).toBe(true)
        expect(result.current.triggerProps['data-disabled']).toBe('')

        act(() => result.current.toggle())
        expect(result.current.open).toBe(false)

        rerender({ disabled: false })
        act(() => result.current.toggle())
        expect(result.current.open).toBe(true)
    })
})
