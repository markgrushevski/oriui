import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, isRef } from 'vue'
import { mount } from '@vue/test-utils'
import { get, type Readable } from 'svelte/store'
import { act, cleanup, renderHook } from '@testing-library/react'
import {
    useCombobox as useComboboxVue,
    useDialog as useDialogVue,
    useDisclosure as useDisclosureVue,
    useMenu as useMenuVue,
    useTabs as useTabsVue,
    type ComboboxItem,
    type MenuItem,
    type TabItem,
    type UseComboboxOptions as VueComboboxOptions,
    type UseDialogOptions as VueDialogOptions,
    type UseDisclosureOptions as VueDisclosureOptions,
    type UseMenuOptions as VueMenuOptions,
    type UseTabsOptions as VueTabsOptions
} from '@oriui/headless/vue'
import {
    useCombobox as useComboboxSvelte,
    useDialog as useDialogSvelte,
    useDisclosure as useDisclosureSvelte,
    useMenu as useMenuSvelte,
    useTabs as useTabsSvelte,
    type UseComboboxOptions as SvelteComboboxOptions,
    type UseDialogOptions as SvelteDialogOptions,
    type UseDisclosureOptions as SvelteDisclosureOptions,
    type UseMenuOptions as SvelteMenuOptions,
    type UseTabsOptions as SvelteTabsOptions
} from '@oriui/headless/svelte'
import {
    useCombobox as useComboboxReact,
    useDialog as useDialogReact,
    useDisclosure as useDisclosureReact,
    useMenu as useMenuReact,
    useTabs as useTabsReact,
    type UseComboboxOptions as ReactComboboxOptions,
    type UseDialogOptions as ReactDialogOptions,
    type UseDisclosureOptions as ReactDisclosureOptions,
    type UseMenuOptions as ReactMenuOptions,
    type UseTabsOptions as ReactTabsOptions
} from '@oriui/headless/react'

/**
 * Cross-adapter parity — the test behind the headline promise.
 *
 * docs/content/overview/installation.md: "The surface is identical across the three: same options, same
 * prop bags, same ARIA"; README.md repeats it. Nothing held the adapters to it. Each of
 * packages/headless/src/{vue,svelte,react}/ hand-writes its own option interfaces and its own
 * normalize-props, and each adapter's suite checks only itself, in its own idiom — so a key added to one
 * connect and lost in one normalizer, or an option only one contract grew, would ship unnoticed.
 *
 * So: drive the same widget through all three adapters with the same options, run the same interactions
 * through the prop bags themselves, and diff everything an adapter hands a UI — control members, state,
 * every bag, and the callback arguments the interactions produced.
 *
 * Exactly two things are folded away, both spelled out below: key CASING (framework idiom) and the
 * generated id BASE (different by construction — its shape is asserted separately, and the ids derived
 * from it still have to line up with each other). Everything else must match exactly, down to a key
 * present with an `undefined` value.
 *
 * Covered: the five widgets behind the swappable `HeadlessAdapters` contract. NOT covered, and still on
 * per-framework suites only: useToolbar (React deliberately diverges — it returns a rendered provider;
 * see DECISIONS.md), useColorPicker, useToast, useTheme, useToken, useDismissable.
 */

// ── the comparison: what it folds, and what it refuses to ──────────────────────────────────────
// Only the SPELLING of a key is per-framework idiom. The key's identity, its value and its presence are
// the contract. The same wire attribute is spelled three ways:
//
//   core connect emits      React bag         Vue bag          Svelte bag
//   onClick                 onClick           onClick          onclick
//   onKeydown               onKeyDown         onKeydown        onkeydown
//   onPointermove           onPointerMove     onPointermove    onpointermove
//   tabindex                tabIndex          tabindex         tabindex
//   className / htmlFor     className/htmlFor class / for      class / for
//
// Case-folding collapses the first four rows. The last needs an alias: today's connects never emit it,
// but all three normalizers special-case it, so a future one will.
const KEY_ALIASES: Record<string, string> = { classname: 'class', htmlfor: 'for' }

/** `onKeyDown` / `onKeydown` / `onkeydown` -> `onkeydown`; `tabIndex` -> `tabindex`; `className` -> `class`. */
function canonicalKey(key: string): string {
    const folded = key.toLowerCase()
    return KEY_ALIASES[folded] ?? folded
}

/**
 * Handlers become one marker: parity means a handler is THERE (and, via the interaction steps, that it
 * does the same thing) — not that two frameworks closed over the same function object. Strings get the
 * framework-minted id base substituted out, so `ori-v-0-trigger` (Vue) and `ori-_r_0_-trigger` (React)
 * compare equal while the cross-references between bags (a trigger's `aria-controls` -> the content's
 * `id`) still have to line up. Nothing else is touched — notably, `undefined` is kept, so a key one
 * adapter emits and another omits fails the diff.
 */
function canonicalValue(value: unknown, base: string): unknown {
    if (typeof value === 'function') return '[handler]'
    if (typeof value === 'string') return value.split(base).join('<base>')
    return value
}

type Dict = Record<string, unknown>

const canonicalBag = (bag: Dict, base: string): Dict =>
    Object.fromEntries(Object.entries(bag).map(([key, value]) => [canonicalKey(key), canonicalValue(value, base)]))

/** State members are framework-neutral data; only their values need canonicalising, not their names. */
const canonicalState = (state: Dict, base: string): Dict =>
    Object.fromEntries(Object.entries(state).map(([key, value]) => [key, canonicalValue(value, base)]))

/** Pull the framework-minted base back out of a derived id: `ori-<base>-trigger` -> `<base>`. */
function baseFrom(id: unknown, prefix: string, suffix: string): string {
    const text = String(id)
    expect(text.startsWith(prefix) && text.endsWith(suffix), `id "${text}" is not ${prefix}<base>${suffix}`).toBe(true)
    return text.slice(prefix.length, text.length - suffix.length)
}

/** Find a handler by its canonical name, whatever the framework spells it — the same fold the diff uses. */
function handlerOf(bag: Dict, canonical: string): (event?: unknown) => void {
    const key = Object.keys(bag).find((name) => canonicalKey(name) === canonical)
    expect(key, `no ${canonical} handler in ${JSON.stringify(Object.keys(bag))}`).toBeDefined()
    return bag[key as string] as (event?: unknown) => void
}

/** The minimal event shape all three handlers read — a React synthetic event and a DOM event share no ctor. */
const keyEvent = (key: string, currentTarget?: unknown, target?: unknown) => ({
    key,
    currentTarget,
    target,
    preventDefault: () => {}
})

// ── hosts: one per framework, hiding only HOW the framework is driven ───────────────────────────

/** Unwraps one control member: Vue hands back a `ComputedRef`, Svelte a store, React a plain value. */
type Read = (member: unknown) => unknown

interface Host {
    /** The control as the framework currently sees it — React re-creates it on every render. */
    control(): Dict
    /** Run one interaction the way the framework requires (React: inside `act`). */
    act(step: () => void): void
    read: Read
}

// Vue composables need a component instance (`useId`, `onMounted`), so the hook runs inside a mounted
// probe — the shape tests/headless-adapter-swap already uses.
function hostVue(hook: () => object): Host {
    let captured: Dict = {}
    const Probe = defineComponent({
        setup() {
            captured = hook() as Dict
            return () => h('div')
        }
    })
    mount(Probe)

    return {
        control: () => captured,
        act: (step) => step(),
        read: (member) => (isRef(member) ? member.value : member)
    }
}

function isStore(member: unknown): member is Readable<unknown> {
    if (typeof member !== 'object' || member === null) return false
    return typeof (member as Readable<unknown>).subscribe === 'function'
}

// Svelte composables are plain functions returning stores, callable without a component (see
// `safeOnDestroy`); `get()` reads one. Item prop-getters are stores OF a function, which `read` unwraps too.
function hostSvelte(hook: () => object): Host {
    const captured = hook() as Dict

    return {
        control: () => captured,
        act: (step) => step(),
        read: (member) => (isStore(member) ? get(member) : member)
    }
}

// React re-creates the control on every render, so the control is read fresh through `result.current` and
// every interaction is flushed with `act`.
function hostReact(hook: () => object): Host {
    const { result } = renderHook(hook)

    return {
        control: () => result.current as Dict,
        act: (step) => {
            act(step)
        },
        read: (member) => member
    }
}

const FRAMEWORKS = ['vue', 'svelte', 'react'] as const
type Framework = (typeof FRAMEWORKS)[number]

// ── reading a control, framework-independently ─────────────────────────────────────────────────

const membersOf = (host: Host): string[] => Object.keys(host.control()).sort()
const bagOf = (host: Host, member: string): Dict => host.read(host.control()[member]) as Dict
const getterOf = (host: Host, member: string) => host.read(host.control()[member]) as (...args: unknown[]) => Dict

function call(host: Host, member: string, ...args: unknown[]): void {
    const method = host.control()[member] as (...values: unknown[]) => void
    method(...args)
}

// ── the table ──────────────────────────────────────────────────────────────────────────────────
// Every entry hands the SAME options to all three adapters. The one per-framework difference allowed here
// is HOW options are passed — a reactivity idiom, not surface: Vue's composables take `MaybeRefOrGetter`,
// Svelte's `MaybeReactive`, React's a plain object, and all three accept the plain object (`useTabs` is
// the exception; see its entry).

type Recorder = (event: unknown) => void

interface Snapshot {
    members: string[]
    state: Dict
    bags: Record<string, Dict>
}

interface WidgetCase {
    name: string
    hosts: Record<Framework, (record: Recorder) => Host>
    /** Interactions driven through every adapter, in order; each runs inside the host's `act`. */
    steps: Array<(host: Host, record: Recorder) => void>
    /** Everything the adapter hands a UI: control members, state, every prop bag. */
    snapshot: (host: Host) => Snapshot
    /** The framework-minted id base, dug back out of one derived id. */
    base: (host: Host) => string
    /**
     * What the steps must actually have produced. Three adapters that all quietly stopped reacting would
     * still agree with each other, so the diff alone is not enough: this pins the outcome to real values.
     */
    outcome: { events: unknown[]; state: Dict }
}

const DISCLOSURE_OPTIONS = { defaultOpen: false, disabled: false }

const disclosureCase: WidgetCase = {
    name: 'useDisclosure',
    hosts: {
        vue: () => hostVue(() => useDisclosureVue(DISCLOSURE_OPTIONS)),
        svelte: () => hostSvelte(() => useDisclosureSvelte(DISCLOSURE_OPTIONS)),
        react: () => hostReact(() => useDisclosureReact(DISCLOSURE_OPTIONS))
    },
    // Through the bag, the way a UI does it — not through `setOpen`, which would skip the trigger wiring.
    steps: [(host) => handlerOf(bagOf(host, 'triggerProps'), 'onclick')()],
    snapshot: (host) => ({
        members: membersOf(host),
        state: { open: host.read(host.control().open) },
        bags: {
            root: bagOf(host, 'rootProps'),
            trigger: bagOf(host, 'triggerProps'),
            content: bagOf(host, 'contentProps')
        }
    }),
    base: (host) => baseFrom(bagOf(host, 'triggerProps').id, 'ori-', '-trigger'),
    outcome: { events: [], state: { open: true } }
}

const TABS: TabItem[] = [{ value: 'a' }, { value: 'b' }, { value: 'c', disabled: true }, { value: 'd' }]
const TABS_OPTIONS = { tabs: TABS, value: 'b', label: 'Views', orientation: 'vertical' as const }

const tabBag = (host: Host, index: number): Dict => getterOf(host, 'getTabProps')(TABS[index], index)
const panelBag = (host: Host, index: number): Dict => getterOf(host, 'getPanelProps')(TABS[index], index)

/**
 * Press one key on a real tablist DOM and report where focus landed. Tabs use automatic activation, so the
 * keystroke must move focus AND commit a value: both halves are compared — focus through the returned
 * marker, the commit through `onChange`.
 */
function pressTablist(host: Host, from: number, key: string): string {
    const root = document.createElement('div')
    const buttons = TABS.map((tab) => {
        const button = document.createElement('button')
        button.setAttribute('role', 'tab')
        button.disabled = tab.disabled ?? false
        root.append(button)
        return button
    })
    document.body.append(root)
    buttons[from].focus()

    handlerOf(bagOf(host, 'tablistProps'), 'onkeydown')(keyEvent(key, root, buttons[from]))

    const landed = buttons.indexOf(document.activeElement as HTMLButtonElement)
    root.remove()
    return `focus:tab-${landed}`
}

const tabsCase: WidgetCase = {
    name: 'useTabs',
    hosts: {
        // Vue's useTabs takes a getter ONLY (`options: () => UseTabsOptions`), where every other Vue
        // composable here takes `MaybeRefOrGetter`. Same option KEYS (pinned below), different call idiom.
        vue: (record) => hostVue(() => useTabsVue(() => ({ ...TABS_OPTIONS, onChange: record }))),
        svelte: (record) => hostSvelte(() => useTabsSvelte({ ...TABS_OPTIONS, onChange: record })),
        react: (record) => hostReact(() => useTabsReact({ ...TABS_OPTIONS, onChange: record }))
    },
    steps: [
        (host, record) => record(pressTablist(host, 1, 'ArrowDown')),
        (host) => handlerOf(tabBag(host, 0), 'onclick')()
    ],
    snapshot: (host) => ({
        members: membersOf(host),
        state: { selectedValue: host.read(host.control().selectedValue) },
        bags: {
            tablist: bagOf(host, 'tablistProps'),
            tab0: tabBag(host, 0),
            tab1: tabBag(host, 1),
            tabDisabled: tabBag(host, 2),
            panel0: panelBag(host, 0),
            panel1: panelBag(host, 1)
        }
    }),
    base: (host) => baseFrom(tabBag(host, 0).id, '', '-tab-0'),
    // ArrowDown from tab 1 skips the disabled tab 2, lands on tab 3 and — automatic activation — commits
    // 'd' on the way; the click then commits 'a'. `value` is controlled and never fed back, so it stays 'b'.
    outcome: { events: ['d', 'focus:tab-3', 'a'], state: { selectedValue: 'b' } }
}

const MENU_ITEMS: MenuItem[] = [
    { value: 'copy', label: 'Copy' },
    { value: 'paste', label: 'Paste' },
    { value: 'delete', label: 'Delete', disabled: true }
]

const menuItemBag = (host: Host, index: number): Dict => getterOf(host, 'getItemProps')(MENU_ITEMS[index], index)

const menuCase: WidgetCase = {
    name: 'useMenu',
    hosts: {
        vue: (record) => hostVue(() => useMenuVue(() => ({ items: MENU_ITEMS, onSelect: record }))),
        svelte: (record) => hostSvelte(() => useMenuSvelte({ items: MENU_ITEMS, onSelect: record })),
        react: (record) => hostReact(() => useMenuReact({ items: MENU_ITEMS, onSelect: record }))
    },
    steps: [
        // ArrowDown on the trigger opens and highlights the first item; ArrowDown in the content moves on;
        // clicking an item fires onSelect and closes. All three through the bags the adapter published.
        (host) => handlerOf(bagOf(host, 'triggerProps'), 'onkeydown')(keyEvent('ArrowDown')),
        (host) => handlerOf(bagOf(host, 'contentProps'), 'onkeydown')(keyEvent('ArrowDown')),
        (host) => handlerOf(menuItemBag(host, 1), 'onclick')()
    ],
    snapshot: (host) => ({
        members: membersOf(host),
        state: {
            open: host.read(host.control().open),
            highlightedValue: host.read(host.control().highlightedValue),
            items: host.read(host.control().items),
            itemStates: MENU_ITEMS.map((item) => getterOf(host, 'getItemState')(item))
        },
        bags: {
            trigger: bagOf(host, 'triggerProps'),
            content: bagOf(host, 'contentProps'),
            separator: bagOf(host, 'separatorProps'),
            item0: menuItemBag(host, 0),
            item1: menuItemBag(host, 1),
            itemDisabled: menuItemBag(host, 2)
        }
    }),
    base: (host) => baseFrom(bagOf(host, 'triggerProps').id, 'ori-', '-trigger'),
    // Two ArrowDowns highlight 'paste'; clicking it selects and closes, which clears the highlight.
    outcome: { events: ['paste'], state: { open: false, highlightedValue: null } }
}

const COMBOBOX_ITEMS: ComboboxItem[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry', disabled: true }
]

const optionBag = (host: Host, index: number): Dict => getterOf(host, 'getOptionProps')(COMBOBOX_ITEMS[index], index)

const comboboxCase: WidgetCase = {
    name: 'useCombobox',
    hosts: {
        vue: () => hostVue(() => useComboboxVue({ options: COMBOBOX_ITEMS })),
        svelte: () => hostSvelte(() => useComboboxSvelte({ options: COMBOBOX_ITEMS })),
        react: () => hostReact(() => useComboboxReact({ options: COMBOBOX_ITEMS }))
    },
    steps: [
        // Open + highlight from the keyboard, filter to one item ('an' matches only Banana), then select
        // the first VISIBLE option — so the filtered collection itself has to agree, not just the bags.
        (host) => handlerOf(bagOf(host, 'inputProps'), 'onkeydown')(keyEvent('ArrowDown')),
        (host) => call(host, 'setInputValue', 'an'),
        (host) => {
            const visible = host.read(host.control().items) as ComboboxItem[]
            handlerOf(getterOf(host, 'getOptionProps')(visible[0], 0), 'onclick')()
        }
    ],
    snapshot: (host) => ({
        members: membersOf(host),
        state: {
            open: host.read(host.control().open),
            value: host.read(host.control().value),
            inputValue: host.read(host.control().inputValue),
            highlightedValue: host.read(host.control().highlightedValue),
            items: host.read(host.control().items),
            optionStates: COMBOBOX_ITEMS.map((item) => getterOf(host, 'getOptionState')(item))
        },
        bags: {
            root: bagOf(host, 'rootProps'),
            label: bagOf(host, 'labelProps'),
            control: bagOf(host, 'controlProps'),
            input: bagOf(host, 'inputProps'),
            trigger: bagOf(host, 'triggerProps'),
            clearTrigger: bagOf(host, 'clearTriggerProps'),
            listbox: bagOf(host, 'listboxProps'),
            option0: optionBag(host, 0),
            option1: optionBag(host, 1),
            optionDisabled: optionBag(host, 2)
        }
    }),
    base: (host) => baseFrom(bagOf(host, 'inputProps').id, 'ori-', '-input'),
    // Selecting the one visible match commits the value, writes its label back into the input and closes —
    // and the input now equalling the selection's label is what restores the full (unfiltered) list.
    outcome: { events: [], state: { open: false, value: 'banana', inputValue: 'Banana' } }
}

const DIALOG_OPTIONS = { modal: true, closeOnEscape: true, closeOnInteractOutside: true }

// The one widget whose adapters share no engine: `nativeDialog` is written out three times over the
// platform `<dialog>`, so nothing but this diff keeps the three ARIA bags and the open/close wiring aligned.
const dialogCase: WidgetCase = {
    name: 'useDialog',
    hosts: {
        vue: (record) => hostVue(() => useDialogVue({ ...DIALOG_OPTIONS, onOpenChange: record })),
        svelte: (record) => hostSvelte(() => useDialogSvelte({ ...DIALOG_OPTIONS, onOpenChange: record })),
        react: (record) => hostReact(() => useDialogReact({ ...DIALOG_OPTIONS, onOpenChange: record }))
    },
    steps: [
        (host) => handlerOf(bagOf(host, 'triggerProps'), 'onclick')(),
        // A click landing on the <dialog> itself is the backdrop; the element is both target and
        // currentTarget, which is how the light-dismiss check is written in all three.
        (host) => {
            const element = document.createElement('dialog')
            handlerOf(bagOf(host, 'dialogProps'), 'onclick')({ currentTarget: element, target: element })
        }
    ],
    snapshot: (host) => ({
        members: membersOf(host),
        state: { open: host.read(host.control().open) },
        bags: {
            trigger: bagOf(host, 'triggerProps'),
            dialog: bagOf(host, 'dialogProps'),
            title: bagOf(host, 'titleProps'),
            description: bagOf(host, 'descriptionProps'),
            closeTrigger: bagOf(host, 'closeTriggerProps')
        }
    }),
    base: (host) => baseFrom(bagOf(host, 'titleProps').id, '', '-title'),
    outcome: { events: [true, false], state: { open: false } }
}

const WIDGETS: WidgetCase[] = [disclosureCase, tabsCase, menuCase, comboboxCase, dialogCase]

/** Mount one widget in one framework, snapshot it at rest, drive the steps, snapshot it again. */
function capture(widget: WidgetCase, framework: Framework) {
    const events: unknown[] = []
    const record: Recorder = (event) => events.push(event)
    const host = widget.hosts[framework](record)
    const base = widget.base(host)

    const snapshot = (): Snapshot => {
        const taken = widget.snapshot(host)
        return {
            members: taken.members,
            state: canonicalState(taken.state, base),
            bags: Object.fromEntries(Object.entries(taken.bags).map(([part, bag]) => [part, canonicalBag(bag, base)]))
        }
    }

    const rest = snapshot()
    for (const step of widget.steps) host.act(() => step(host, record))

    return { base, surface: { rest, after: snapshot(), events } }
}

afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
})

describe.each(WIDGETS)('$name — one surface across Vue, Svelte and React', (widget) => {
    it('mints a base id that is usable as an id and a selector in every adapter', () => {
        for (const framework of FRAMEWORKS) {
            // The VALUE differs by construction — Vue's `useId()`, Svelte's module counter, React's
            // `useId()` all mint their own — so only the shape is asserted here. That every other id in
            // every bag is derived from it identically is what the diff below checks, by substituting it.
            expect(capture(widget, framework).base, framework).toMatch(/^[A-Za-z_][A-Za-z0-9_-]*$/)
        }
    })

    it('projects the same members, state and bags — at rest and after the same interactions', () => {
        const vue = capture(widget, 'vue')
        const svelte = capture(widget, 'svelte')
        const react = capture(widget, 'react')

        // Pin the outcome before diffing: three adapters that had all quietly stopped reacting would agree
        // with each other perfectly, and this test would say the promise holds.
        expect(vue.surface.events, 'the interactions no longer reach the callbacks').toStrictEqual(
            widget.outcome.events
        )
        expect(vue.surface.after.state, 'the interactions no longer change state').toMatchObject(widget.outcome.state)

        expect(svelte.surface, 'the Svelte adapter diverges from Vue').toStrictEqual(vue.surface)
        expect(react.surface, 'the React adapter diverges from Vue').toStrictEqual(vue.surface)
    })
})

// ── the option surface, pinned at compile time ─────────────────────────────────────────────────
// The table above proves the OUTPUT matches. This proves the INPUT does: each adapter hand-writes its own
// option interfaces (ISSUES-INNER ORI-I-07), so an option added to one and forgotten in the others is
// exactly the drift 1.0 would freeze. `npm run test:types` fails on the offending line — naming the two
// interfaces — if either side has a key the other lacks.
type KeyGap<A, B> = Exclude<keyof A, keyof B> | Exclude<keyof B, keyof A>
type SameKeys<A, B> = [KeyGap<A, B>] extends [never] ? true : KeyGap<A, B>

const OPTION_KEY_PARITY = {
    'useDisclosure — Vue/Svelte': true satisfies SameKeys<VueDisclosureOptions, SvelteDisclosureOptions>,
    'useDisclosure — Vue/React': true satisfies SameKeys<VueDisclosureOptions, ReactDisclosureOptions>,
    'useDialog — Vue/Svelte': true satisfies SameKeys<VueDialogOptions, SvelteDialogOptions>,
    'useDialog — Vue/React': true satisfies SameKeys<VueDialogOptions, ReactDialogOptions>,
    'useCombobox — Vue/Svelte': true satisfies SameKeys<VueComboboxOptions, SvelteComboboxOptions>,
    'useCombobox — Vue/React': true satisfies SameKeys<VueComboboxOptions, ReactComboboxOptions>,
    'useMenu — Vue/Svelte': true satisfies SameKeys<VueMenuOptions, SvelteMenuOptions>,
    'useMenu — Vue/React': true satisfies SameKeys<VueMenuOptions, ReactMenuOptions>,
    'useTabs — Vue/Svelte': true satisfies SameKeys<VueTabsOptions, SvelteTabsOptions>,
    'useTabs — Vue/React': true satisfies SameKeys<VueTabsOptions, ReactTabsOptions>
}

describe('option surface', () => {
    it('declares the same option keys in all three adapters (enforced by test:types)', () => {
        expect(Object.values(OPTION_KEY_PARITY).every(Boolean)).toBe(true)
    })
})
