import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { computed, defineComponent, h, provide, type InjectionKey } from 'vue'
import { mount } from '@vue/test-utils'
import {
    OriHeadless,
    ORI_HEADLESS,
    useCombobox,
    useMenu,
    useToolbarOrientation,
    nativeCombobox,
    nativeMenu,
    type ComboboxAdapter,
    type HeadlessAdapters,
    type MenuAdapter
} from '../packages/headless/src/vue'
import { oriFieldKey, useOriField, type OriFieldContext } from '../packages/vue/src/components/field/context'

// The OriHeadless contract promises Combobox and Menu are swappable — an app can provide a custom /
// Zag-backed engine via the plugin, else the native `../core` adapter is the default. These tests prove
// the seam is real (not just documented): a marker prop from a swapped adapter reaches the consumer,
// and an unwired consumer transparently gets the native default.
const OPTIONS = [{ label: 'Apple', value: 'apple' }]
const ITEMS = [{ label: 'Copy', value: 'copy' }]

describe('OriHeadless contract — Combobox / Menu are swappable', () => {
    it('useCombobox routes through a provided combobox adapter, else falls back to native', () => {
        const fake: ComboboxAdapter = (options) => ({
            ...nativeCombobox(options),
            rootProps: computed(() => ({ 'data-adapter': 'fake-combobox' }))
        })

        const rootPropsWith = (plugins: unknown[]): Record<string, unknown> => {
            let captured: Record<string, unknown> = {}
            const Probe = defineComponent({
                setup() {
                    captured = useCombobox(() => ({ options: OPTIONS })).rootProps.value
                    return () => h('div')
                }
            })
            mount(Probe, { global: { plugins: plugins as never } })
            return captured
        }

        expect(rootPropsWith([[OriHeadless, { combobox: fake }]])['data-adapter']).toBe('fake-combobox')
        // no adapter wired → native default produces the real prop bag, never the marker
        expect(rootPropsWith([])['data-adapter']).toBeUndefined()
    })

    it('useMenu routes through a provided menu adapter, else falls back to native', () => {
        const fake: MenuAdapter = (options) => ({
            ...nativeMenu(options),
            triggerProps: computed(() => ({ 'data-adapter': 'fake-menu' }))
        })

        const triggerPropsWith = (plugins: unknown[]): Record<string, unknown> => {
            let captured: Record<string, unknown> = {}
            const Probe = defineComponent({
                setup() {
                    captured = useMenu(() => ({ items: ITEMS })).triggerProps.value
                    return () => h('div')
                }
            })
            mount(Probe, { global: { plugins: plugins as never } })
            return captured
        }

        expect(triggerPropsWith([[OriHeadless, { menu: fake }]])['data-adapter']).toBe('fake-menu')
        expect(triggerPropsWith([])['data-adapter']).toBeUndefined()
        expect(triggerPropsWith([])['aria-haspopup']).toBeDefined()
    })
})

// A provide/inject seam is only as global as its key. When npm cannot dedupe a package — a transitive
// duplicate, two lockfile entries in a monorepo, an exact pin that blocks hoisting — the second copy
// evaluates its own module scope and mints its OWN key. With `Symbol('…')` the two keys are different
// values, so the provide lands on one key while the inject reads the other: no error, no warning, the
// component just falls back to its default and the app silently loses whatever was configured.
// `Symbol.for('…')` interns the key in the cross-realm registry, so both copies agree.
//
// The description carries the MAJOR (`@1`), so the interning is scoped to one contract shape: copies of
// the same major meet, while a future v2 installed alongside v1 keeps missing — which is the safe
// direction, since a miss falls back but a cross-major match would hand a consumer a shape it was never
// typed against.
//
// Each test below stands in for the duplicated copy by minting the key the way that copy would — fresh,
// from the same description — and then driving the REAL consumer, which injects under the key its own
// module scope holds.
describe('cross-package keys survive a duplicated install', () => {
    /** What a second copy of the package, at the same major, would compute at module scope. */
    const duplicateKey = <T>(description: string) => Symbol.for(`${description}@1`) as InjectionKey<T>

    // The `@<major>` suffix is what keeps two MAJORS from meeting in the global symbol registry (see
    // DECISIONS.md). It is therefore a thing that must be bumped at 2.0 — and a forgotten bump fails
    // silently, years later, in someone else's app. This guard reads the major from the package manifest
    // and scans the sources, so the day the version goes to 2.x it stays red until every key follows.
    it('every global injection key is scoped to the package major', () => {
        const root = process.cwd()
        const major = JSON.parse(readFileSync(resolve(root, 'packages/headless/package.json'), 'utf8')).version.split(
            '.'
        )[0]

        const sources: string[] = []
        const walk = (dir: string): void => {
            for (const entry of readdirSync(dir, { withFileTypes: true })) {
                const full = resolve(dir, entry.name)
                if (entry.isDirectory()) walk(full)
                else if (/\.(ts|vue)$/.test(entry.name)) sources.push(readFileSync(full, 'utf8'))
            }
        }
        walk(resolve(root, 'packages'))

        const descriptions = sources
            .flatMap((src) => [...src.matchAll(/Symbol\.for\(['"]([^'"]+)['"]\)/g)])
            .map((m) => m[1])

        // A scan that scans nothing passes vacuously — pin the floor too.
        expect(sources.length, 'no package sources scanned').toBeGreaterThan(50)
        expect(descriptions.length, 'no Symbol.for keys found — did they move or revert to Symbol()?').toBe(7)
        for (const description of descriptions) {
            expect(description.endsWith(`@${major}`), `${description} is not scoped to @${major}`).toBe(true)
        }
    })

    /** Provide `value` under `key` in a parent, render `Child` beneath it, as a real copy would. */
    const mountUnder = <T>(key: InjectionKey<T>, value: T, Child: ReturnType<typeof defineComponent>) =>
        mount(
            defineComponent({
                setup() {
                    provide(key, value)
                    return () => h(Child)
                }
            }),
            { attachTo: document.body }
        )

    it('a duplicate @oriui/headless provides adapters the resolver still finds', () => {
        const fake: MenuAdapter = (options) => ({
            ...nativeMenu(options),
            triggerProps: computed(() => ({ 'data-adapter': 'from-the-duplicate' }))
        })

        let captured: Record<string, unknown> = {}
        const Probe = defineComponent({
            setup() {
                captured = useMenu(() => ({ items: [{ label: 'Copy', value: 'copy' }] })).triggerProps.value
                return () => h('div')
            }
        })

        const wrapper = mountUnder(duplicateKey<HeadlessAdapters>('ori-headless'), { menu: fake }, Probe)

        expect(ORI_HEADLESS).toBe(Symbol.for('ori-headless@1'))
        expect(captured['data-adapter']).toBe('from-the-duplicate')
        wrapper.unmount()
    })

    it('but a NEXT-major copy stays isolated, so it cannot satisfy this major with a foreign shape', () => {
        let captured: Record<string, unknown> = {}
        const Probe = defineComponent({
            setup() {
                captured = useMenu(() => ({ items: [{ label: 'Copy', value: 'copy' }] })).triggerProps.value
                return () => h('div')
            }
        })

        const v2Key = Symbol.for('ori-headless@2') as InjectionKey<HeadlessAdapters>
        const v2Adapter: MenuAdapter = (options) => ({
            ...nativeMenu(options),
            triggerProps: computed(() => ({ 'data-adapter': 'from-the-next-major' }))
        })
        const wrapper = mountUnder(v2Key, { menu: v2Adapter }, Probe)

        expect(ORI_HEADLESS).not.toBe(v2Key)
        // Missed, so this major falls back to its own native engine — degraded, never mis-shaped.
        expect(captured['data-adapter']).toBeUndefined()
        expect(captured['aria-haspopup']).toBe('menu')
        wrapper.unmount()
    })

    it('a duplicate @oriui/headless provides a toolbar context nested items still read', () => {
        let orientation = (): string => ''
        const Probe = defineComponent({
            setup() {
                orientation = useToolbarOrientation()
                return () => h('div')
            }
        })

        // The shape `useToolbar` provides; only `orientation` is observable through the public reader.
        const ctx = {
            orientation: () => 'vertical' as const,
            activeId: { value: null },
            register: () => {},
            unregister: () => {},
            setActive: () => {}
        }
        const wrapper = mountUnder(duplicateKey<typeof ctx>('ori-toolbar'), ctx, Probe)

        // 'horizontal' is the no-context fallback — reading it here would mean the key missed.
        expect(orientation()).toBe('vertical')
        wrapper.unmount()
    })

    it('a duplicate @oriui/vue provides a field context its controls still adopt', () => {
        let seen: OriFieldContext | undefined
        const Probe = defineComponent({
            setup() {
                seen = useOriField()
                return () => h('div')
            }
        })

        const ctx = {
            id: computed(() => 'from-the-duplicate'),
            labelId: computed(() => undefined),
            describedBy: computed(() => undefined),
            invalid: computed(() => false),
            required: computed(() => true),
            disabled: computed(() => false),
            size: computed(() => 'md' as const)
        }
        const wrapper = mountUnder(duplicateKey<OriFieldContext>('ori-field'), ctx, Probe)

        expect(oriFieldKey).toBe(Symbol.for('ori-field@1'))
        expect(seen?.id.value).toBe('from-the-duplicate')
        wrapper.unmount()
    })
})
