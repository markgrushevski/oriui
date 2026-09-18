import { describe, it, expect } from 'vitest'
import { computed, nextTick, ref, toValue, h, type MaybeRefOrGetter } from 'vue'
import { mount } from '@vue/test-utils'
import { OriCombobox, OriMenu } from '../packages/vue/src'
import {
    OriHeadless,
    type ComboboxAdapter,
    type ComboboxControl,
    type ComboboxItem,
    type MenuAdapter,
    type MenuControl,
    type MenuItem,
    type UseComboboxOptions,
    type UseMenuOptions
} from '../packages/headless/src/vue'

// The swap promise, tested the only way that can falsify it. `tests/headless-adapter-swap.test.ts`
// proves the INJECTION SEAM routes, but its fakes are built by spreading the native adapter — so every
// key the styled component reaches for is inherited from the implementation under test, and a third-party
// adapter missing one of them would still pass there. These fakes are written FROM SCRATCH: they never
// import or spread `nativeMenu` / `nativeCombobox`, so whatever they are forced to emit in order to drive
// OriMenu / OriCombobox IS the published contract. Each requirement is pinned twice — once by a test that
// passes because the fake emits it, and once by a test that omits it and shows the silent breakage. When
// one of these fails, either fix the component or update the MUST clause in the control's JSDoc; do not
// quietly widen the fake.

const ITEMS: MenuItem[] = [
    { label: 'Edit', value: 'edit' },
    { label: 'Duplicate', value: 'duplicate' },
    { label: 'Archive', value: 'archive' }
]

const OPTIONS: ComboboxItem[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' }
]

// --- The from-scratch menu adapter ----------------------------------------------------------------

interface FakeMenuHandles {
    adapter: MenuAdapter
    /** The control the component received — the test drives the component THROUGH the contract. */
    control(): MenuControl
}

/**
 * A complete MenuControl built from nothing but Vue reactivity. `omit` drops one contractual key so a
 * test can show what its absence costs; the default emits the full contract.
 */
function fakeMenuAdapter(omit?: 'trigger-id' | 'data-highlighted' | 'item-tabindex'): FakeMenuHandles {
    let captured: MenuControl | null = null

    const adapter: MenuAdapter = (options: MaybeRefOrGetter<UseMenuOptions>) => {
        const open = ref(false)
        const highlightedValue = ref<string | null>(null)
        const items = computed(() => toValue(options).items)
        const triggerId = 'fake-trigger'
        const contentId = 'fake-content'

        const control: MenuControl = {
            open: computed(() => open.value),
            highlightedValue: computed(() => highlightedValue.value),
            items,
            triggerProps: computed(() => ({
                // MUST: the id OriMenu resolves the trigger element by, to return focus on close.
                ...(omit === 'trigger-id' ? {} : { id: triggerId }),
                type: 'button',
                'aria-haspopup': 'menu',
                'aria-controls': contentId,
                'aria-expanded': open.value
            })),
            contentProps: computed(() => ({
                id: contentId,
                role: 'menu',
                // MUST: the content takes focus on open while nothing is highlighted, so it needs to be
                // programmatically focusable.
                tabindex: -1,
                'aria-labelledby': triggerId,
                hidden: !open.value
            })),
            separatorProps: computed(() => ({ role: 'separator' })),
            getItemProps: (item: MenuItem) => {
                const highlighted = item.value === highlightedValue.value
                return {
                    role: 'menuitem',
                    // MUST: roving moves REAL focus, so the highlighted item must be focusable...
                    ...(omit === 'item-tabindex' ? {} : { tabindex: highlighted ? 0 : -1 }),
                    // ...and must be findable by this exact attribute selector.
                    ...(omit === 'data-highlighted' ? {} : { 'data-highlighted': highlighted ? '' : undefined })
                }
            },
            getItemState: (item: MenuItem) => ({ highlighted: item.value === highlightedValue.value }),
            setOpen: (next: boolean) => {
                open.value = next
            },
            highlight: (value: string | null) => {
                highlightedValue.value = value
            },
            highlightFirst: () => {
                highlightedValue.value = items.value[0]?.value ?? null
            },
            highlightLast: () => {
                highlightedValue.value = items.value.at(-1)?.value ?? null
            }
        }

        captured = control
        return control
    }

    return {
        adapter,
        control: () => {
            if (!captured) throw new Error('adapter was never invoked')
            return captured
        }
    }
}

function mountMenuOn(fake: FakeMenuHandles) {
    return mount(OriMenu, {
        props: { items: ITEMS },
        slots: { trigger: (scope: { props: Record<string, unknown> }) => h('button', { ...scope.props }, 'Actions') },
        global: { plugins: [[OriHeadless, { menu: fake.adapter }] as never] },
        attachTo: document.body
    })
}

describe('MenuControl — what an adapter written from scratch MUST emit', () => {
    it('a from-scratch adapter (no nativeMenu anywhere) drives OriMenu: roving focus + focus-return', async () => {
        const fake = fakeMenuAdapter()
        const wrapper = mountMenuOn(fake)
        const trigger = wrapper.find('button').element

        // Roving: the component moves REAL DOM focus to the highlighted item, resolving it by the
        // `[data-highlighted]` attribute the adapter emitted.
        fake.control().setOpen(true)
        await nextTick()
        fake.control().highlight('duplicate')
        await nextTick()
        await nextTick()

        const items = wrapper.findAll('[role="menuitem"]')
        expect(document.activeElement).toBe(items[1]!.element)

        // Roving tabindex: exactly one item is in the tab order, and it is the highlighted one. The
        // items render as <div>s, so in a real browser this is also what makes `.focus()` above work at
        // all — happy-dom focuses a tabindex-less <div> regardless, which is why the absence of
        // `tabindex` is pinned here by attribute rather than by a focus assertion it could not falsify.
        expect(items.map((i) => i.attributes('tabindex'))).toEqual(['-1', '0', '-1'])

        // Focus-return: on close the component looks the trigger up by `triggerProps.id`.
        fake.control().setOpen(false)
        await nextTick()
        expect(document.activeElement).toBe(trigger)

        wrapper.unmount()
    })

    it('MUST emit `id` on triggerProps — without it focus-return silently does nothing', async () => {
        const fake = fakeMenuAdapter('trigger-id')
        const wrapper = mountMenuOn(fake)
        const trigger = wrapper.find('button').element

        fake.control().setOpen(true)
        await nextTick()
        fake.control().highlight('edit')
        await nextTick()
        await nextTick()
        fake.control().setOpen(false)
        await nextTick()

        // No error, no warning — focus is simply left behind on the menu item.
        expect(document.activeElement).not.toBe(trigger)

        wrapper.unmount()
    })

    it('MUST emit `data-highlighted` on the highlighted item bag — without it roving focus never moves', async () => {
        const fake = fakeMenuAdapter('data-highlighted')
        const wrapper = mountMenuOn(fake)

        fake.control().setOpen(true)
        await nextTick()
        fake.control().highlight('duplicate')
        await nextTick()
        await nextTick()

        const items = wrapper.findAll('[role="menuitem"]')
        expect(document.activeElement).not.toBe(items[1]!.element)

        wrapper.unmount()
    })

    it('MUST put the highlighted item in the tab order — omitting roving `tabindex` leaves it unfocusable', async () => {
        const fake = fakeMenuAdapter('item-tabindex')
        const wrapper = mountMenuOn(fake)

        fake.control().setOpen(true)
        await nextTick()
        fake.control().highlight('duplicate')
        await nextTick()
        await nextTick()

        // happy-dom will still report the <div> as focused, so this pins the requirement where it is
        // observable: no item carries a tabindex, and a real browser's `.focus()` would be a no-op.
        const items = wrapper.findAll('[role="menuitem"]')
        expect(items.every((i) => i.attributes('tabindex') === undefined)).toBe(true)

        wrapper.unmount()
    })
})

// --- The from-scratch combobox adapter ------------------------------------------------------------

/**
 * The same class of hidden requirement exists on ComboboxControl: OriCombobox reads `inputProps.id`
 * (:120) and `labelProps.id` (:122) through an unchecked `as string`, and derives the visible input's
 * `id`, the hint / error ids and the listbox's `aria-labelledby` from them. `omit` drops one of the two.
 */
function fakeComboboxAdapter(omit?: 'input-id' | 'label-id'): ComboboxAdapter {
    return (options: MaybeRefOrGetter<UseComboboxOptions>) => {
        const open = ref(false)
        const value = ref<string | null>(null)
        const inputValue = ref('')
        const items = computed(() => toValue(options).options)
        const inputId = 'fake-input'
        const labelId = 'fake-label'
        const listboxId = 'fake-listbox'

        const control: ComboboxControl = {
            open: computed(() => open.value),
            value: computed(() => value.value),
            inputValue: computed(() => inputValue.value),
            highlightedValue: computed(() => null),
            items,
            rootProps: computed(() => ({})),
            // MUST: `id` — OriCombobox names the listbox with it via aria-labelledby.
            labelProps: computed(() => ({ ...(omit === 'label-id' ? {} : { id: labelId }), for: inputId })),
            controlProps: computed(() => ({})),
            // MUST: `id` — it becomes the visible input's id (standalone) and the hint / error id stems.
            inputProps: computed(() => ({
                ...(omit === 'input-id' ? {} : { id: inputId }),
                role: 'combobox',
                'aria-expanded': open.value,
                'aria-controls': listboxId,
                value: inputValue.value
            })),
            triggerProps: computed(() => ({ type: 'button', tabindex: -1 })),
            clearTriggerProps: computed(() => ({ type: 'button', tabindex: -1 })),
            listboxProps: computed(() => ({ id: listboxId, role: 'listbox', hidden: !open.value })),
            getOptionProps: (item: ComboboxItem, index: number) => ({ id: `${listboxId}-${index}`, role: 'option' }),
            getOptionState: (item: ComboboxItem) => ({ highlighted: false, selected: item.value === value.value }),
            setOpen: (next: boolean) => {
                open.value = next
            },
            setInputValue: (next: string) => {
                inputValue.value = next
            },
            select: (item: ComboboxItem) => {
                value.value = item.value
            },
            clear: () => {
                value.value = null
            }
        }

        return control
    }
}

function mountComboboxOn(adapter: ComboboxAdapter) {
    return mount(OriCombobox, {
        props: { options: OPTIONS, label: 'Fruit', hint: 'Pick one' },
        global: { plugins: [[OriHeadless, { combobox: adapter }] as never] },
        attachTo: document.body
    })
}

describe('ComboboxControl — what an adapter written from scratch MUST emit', () => {
    it('a from-scratch adapter drives OriCombobox: input id, label association and hint wiring hold', () => {
        const wrapper = mountComboboxOn(fakeComboboxAdapter())
        const input = wrapper.find('input[role="combobox"]')
        const label = wrapper.find('label')

        // The visible input takes its id from `inputProps.id`, and the label's `for` resolves to it.
        expect(input.attributes('id')).toBe('fake-input')
        expect(label.attributes('for')).toBe('fake-input')
        // hint / error ids are derived from the same id, so aria-describedby resolves to a real element.
        const hintId = input.attributes('aria-describedby')
        expect(hintId).toBe('fake-input-hint')
        expect(wrapper.find(`#${hintId}`).exists()).toBe(true)
        // The listbox is named by `labelProps.id`.
        expect(wrapper.find('[role="listbox"]').attributes('aria-labelledby')).toBe('fake-label')

        wrapper.unmount()
    })

    it('MUST emit `id` on inputProps — without it the input loses its id and aria-describedby dangles', () => {
        const wrapper = mountComboboxOn(fakeComboboxAdapter('input-id'))
        const input = wrapper.find('input[role="combobox"]')

        expect(input.attributes('id')).toBeUndefined()
        // The hint id is derived from the missing id, so it stringifies and points at nothing sane.
        expect(input.attributes('aria-describedby')).toBe('undefined-hint')

        wrapper.unmount()
    })

    it('MUST emit `id` on labelProps — without it the listbox loses its accessible name', () => {
        const wrapper = mountComboboxOn(fakeComboboxAdapter('label-id'))

        expect(wrapper.find('[role="listbox"]').attributes('aria-labelledby')).toBeUndefined()

        wrapper.unmount()
    })
})
