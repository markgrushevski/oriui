import { afterEach, describe, it, expect, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { combobox, createNormalizer, disclosure, menu, type Dict } from '@oriui/headless'
import { normalizeProps } from '@oriui/headless/react'

/**
 * The React normalizer renames compound handlers (`onKeydown` → `onKeyDown`)
 * through a hand-maintained allowlist and passes everything else through. Its failure mode is SILENCE:
 * the day a `connect()` emits an `onXxx` the map does not know, it reaches React mis-cased, React ignores
 * the unknown prop, and the widget loses that interaction with no error, no warning and no failing test.
 * Nothing held the map to the core — the coupling was a comment.
 *
 * This is that coupling, executable. The event list is DERIVED: every prop bag of every core `connect`
 * (open and closed, item getters included) is walked through a pass-through normalizer and every key
 * matching /^on[A-Z]/ is collected. Each one is then pushed through the REAL React normalizer onto a real
 * React element, and the matching native event is dispatched at it — so the assertion is not "the key is
 * in the map" (a map can be wrong as easily as incomplete) but "React actually calls the handler".
 *
 * Add a handler to a connect and forget the map, and this goes red naming the key.
 */

afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
})

// A normalizer that changes nothing: what the core emits is what we collect.
const passthrough = createNormalizer<{ element: Dict; button: Dict }>((props) => props)

const COMBOBOX_ITEMS = [
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' }
]
const MENU_ITEMS = [{ value: 'copy', label: 'Copy' }, { value: 'paste' }]

/**
 * Every `getXxxProps` an api exposes, discovered by shape rather than listed — a getter added to a
 * connect is picked up here without anyone remembering to add it. The two item getters take
 * `(item, index)`; everything else takes nothing, which their arity tells us.
 */
function collectHandlerKeys(api: object, sampleItem: unknown): string[] {
    const keys: string[] = []

    for (const [name, member] of Object.entries(api) as [string, unknown][]) {
        if (typeof member !== 'function' || !/^get[A-Za-z]*Props$/.test(name)) continue
        const bag = member.length === 0 ? member() : member(sampleItem, 0)
        for (const key of Object.keys(bag as Dict)) {
            if (/^on[A-Z]/.test(key)) keys.push(key)
        }
    }

    return keys
}

/** The handler keys the core emits today, across both machine states (some bags only exist when open). */
function coreHandlerKeys(): string[] {
    const keys: string[] = []

    const disclosureService = disclosure.machine({ id: 'd' })
    const comboboxService = combobox.machine({ id: 'c' })
    const menuService = menu.machine({ id: 'm' })

    for (const open of [false, true]) {
        if (open) {
            disclosureService.send({ type: 'OPEN' })
            comboboxService.send({ type: 'OPEN' })
            comboboxService.send({ type: 'HIGHLIGHT', value: 'vue' })
            menuService.send({ type: 'OPEN' })
            menuService.send({ type: 'HIGHLIGHT', value: 'copy' })
        }

        keys.push(
            ...collectHandlerKeys(disclosure.connect(disclosureService, passthrough), undefined),
            ...collectHandlerKeys(combobox.connect(comboboxService, passthrough, COMBOBOX_ITEMS), COMBOBOX_ITEMS[0]),
            ...collectHandlerKeys(menu.connect(menuService, passthrough, MENU_ITEMS), MENU_ITEMS[0])
        )
    }

    return [...new Set(keys)].sort()
}

describe('React normalizeProps vs. the events the core actually emits', () => {
    it('the derivation itself works — the walk finds the handlers the connects are known to emit', () => {
        // Without this, a broken walk would hand the test below an empty list and it would pass vacuously.
        expect(coreHandlerKeys()).toEqual(expect.arrayContaining(['onClick', 'onInput', 'onKeydown', 'onPointermove']))
    })

    it('every one of them reaches React as a handler React actually calls', () => {
        const warn = vi.spyOn(console, 'error').mockImplementation(() => {})

        for (const key of coreHandlerKeys()) {
            const handler = vi.fn()
            const normalized = normalizeProps.element({ [key]: handler }) as Dict

            const rendered = Object.keys(normalized)
            expect(rendered, `${key} should normalize to exactly one prop`).toHaveLength(1)

            render(createElement('div', { ...normalized, 'data-testid': 'probe' }))

            // The core spells handlers `on` + the native event name, capitalised (`onPointermove` ->
            // `pointermove`), so the event to dispatch is derived too — no second hand-written table.
            const nativeEvent = key.slice(2).toLowerCase()
            screen.getByTestId('probe').dispatchEvent(new Event(nativeEvent, { bubbles: true }))

            expect(
                handler,
                `the core emits ${key}; React received it as ${rendered[0]}, which does not fire on a native "${nativeEvent}" — add the mapping to eventMap in packages/headless/src/react/normalize-props.ts`
            ).toHaveBeenCalledTimes(1)

            const complaints = warn.mock.calls.flat().filter((arg) => String(arg).includes(rendered[0] as string))
            expect(complaints, `React complained about ${rendered[0]}`).toHaveLength(0)

            cleanup()
        }

        warn.mockRestore()
    })
})
