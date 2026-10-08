import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref, type VNode } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { OriTable } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

// happy-dom has no layout: scrollWidth / clientWidth / scrollHeight / clientHeight are all 0. The component's
// "is it scrolling" measurement is driven here by stubbing those four properties on the scroll box, and the
// ResizeObserver by a stub the test can fire by hand. Real geometry is covered in e2e/table.spec.ts.
type Geometry = { clientHeight: number; clientWidth: number; scrollHeight: number; scrollWidth: number }

const geometry: Geometry = { clientHeight: 0, clientWidth: 0, scrollHeight: 0, scrollWidth: 0 }
const GEOMETRY_KEYS = Object.keys(geometry) as (keyof Geometry)[]
const originalDescriptors = new Map<string, PropertyDescriptor | undefined>()

function setGeometry(next: Partial<Geometry>): void {
    Object.assign(geometry, next)
}

function stubGeometry(): void {
    for (const key of GEOMETRY_KEYS) {
        originalDescriptors.set(key, Object.getOwnPropertyDescriptor(HTMLElement.prototype, key))
        Object.defineProperty(HTMLElement.prototype, key, {
            configurable: true,
            get(this: HTMLElement) {
                return this.classList.contains('ori-table-scroll') ? geometry[key] : 0
            }
        })
    }
}

function restoreGeometry(): void {
    for (const key of GEOMETRY_KEYS) {
        const original = originalDescriptors.get(key)
        if (original) Object.defineProperty(HTMLElement.prototype, key, original)
        else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[key]
    }
    originalDescriptors.clear()
}

class ResizeObserverStub {
    static instances: ResizeObserverStub[] = []

    observed: Element[] = []
    disconnects = 0

    constructor(private readonly callback: () => void) {
        ResizeObserverStub.instances.push(this)
    }

    observe(el: Element): void {
        this.observed.push(el)
    }

    unobserve(): void {}

    disconnect(): void {
        this.disconnects += 1
    }

    fire(): void {
        this.callback()
    }
}

const wrappers: VueWrapper[] = []

// Every wrapper is unmounted and the body cleared after each test, so an attached tree never leaks into the next.
function track<T extends VueWrapper>(wrapper: T): T {
    wrappers.push(wrapper)
    return wrapper
}

// For a test that unmounts on purpose: the afterEach must not unmount the same app a second time.
function unmount(wrapper: VueWrapper): void {
    const index = wrappers.indexOf(wrapper)
    if (index !== -1) wrappers.splice(index, 1)
    wrapper.unmount()
}

beforeEach(() => {
    setGeometry({ clientHeight: 0, clientWidth: 0, scrollHeight: 0, scrollWidth: 0 })
    ResizeObserverStub.instances = []
    stubGeometry()
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    restoreGeometry()
})

function rows(): VNode[] {
    return [
        h('thead', [h('tr', [h('th', { scope: 'col' }, 'Name'), h('th', { scope: 'col' }, 'Qty')])]),
        h('tbody', [h('tr', [h('td', 'Apples'), h('td', '3')]), h('tr', [h('td', 'Pears'), h('td', '5')])]),
        h('tfoot', [h('tr', [h('td', 'Total'), h('td', '8')])])
    ]
}

function mountTable(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
    return track(mount(OriTable, { props, attrs, slots: { default: rows }, attachTo: document.body }))
}

function overflowing(): void {
    setGeometry({ clientWidth: 200, scrollWidth: 640 })
}

const HOST_TEMPLATE = `
    <OriTable caption="Inventory">
        <thead>
            <tr><th scope="col">Name</th><th scope="col">Qty</th></tr>
        </thead>
        <tbody>
            <tr><td>Apples</td><td>3</td></tr>
            <tr><td>Pears</td><td>5</td></tr>
        </tbody>
    </OriTable>
`

// A component-scope host: tables written in a template, the way a consumer writes them.
function mountTemplate(template: string, state: Record<string, unknown> = {}) {
    const Host = defineComponent({ components: { OriTable }, setup: () => state, template })
    return track(mount(Host, { attachTo: document.body }))
}

function mountHost(template = HOST_TEMPLATE) {
    return mountTemplate(template)
}

describe('OriTable', () => {
    describe('structure and classes', () => {
        it('renders a div.ori-table-scroll holding one table.ori-table at the md size', () => {
            const wrapper = mountTable()

            expect(wrapper.element.tagName).toBe('DIV')
            expect(wrapper.classes()).toEqual(['ori-table-scroll'])
            expect(wrapper.element.children).toHaveLength(1)

            const table = wrapper.element.firstElementChild as HTMLElement
            expect(table.tagName).toBe('TABLE')
            expect(Array.from(table.classList)).toEqual(['ori-table', 'ori-table_md'])
        })

        it.each(['sm', 'md', 'lg'] as const)('maps size="%s" to its class and no other size', (size) => {
            const table = mountTable({ size }).find('table')

            expect(table.classes()).toContain(`ori-table_${size}`)
            for (const other of ['sm', 'md', 'lg'].filter((s) => s !== size)) {
                expect(table.classes()).not.toContain(`ori-table_${other}`)
            }
        })

        it.each([
            ['striped', 'ori-table_striped'],
            ['hover', 'ori-table_hover'],
            ['stickyHeader', 'ori-table_sticky-header'],
            ['captionHidden', 'ori-table_caption-hidden']
        ])('maps %s to %s, and only when set', (prop, cls) => {
            expect(
                mountTable({ [prop]: true })
                    .find('table')
                    .classes()
            ).toContain(cls)
            expect(
                mountTable({ [prop]: false })
                    .find('table')
                    .classes()
            ).not.toContain(cls)
            expect(mountTable().find('table').classes()).not.toContain(cls)
        })

        it('combines every modifier with a size', () => {
            const table = mountTable({
                captionHidden: true,
                hover: true,
                size: 'lg',
                stickyHeader: true,
                striped: true
            }).find('table')

            expect(table.classes().sort()).toEqual(
                [
                    'ori-table',
                    'ori-table_caption-hidden',
                    'ori-table_hover',
                    'ori-table_lg',
                    'ori-table_sticky-header',
                    'ori-table_striped'
                ].sort()
            )
        })

        it('sets the scroll box max-height from maxHeight', () => {
            const wrapper = mountTable({ maxHeight: '20rem' })

            expect((wrapper.element as HTMLElement).style.maxHeight).toBe('20rem')
            expect((wrapper.find('table').element as HTMLElement).style.maxHeight).toBe('')
        })

        it('adds no inline style without maxHeight', () => {
            const wrapper = mountTable()

            expect(wrapper.attributes('style')).toBeUndefined()
        })
    })

    describe('slots and attributes', () => {
        it("renders the caller's thead / tbody / tfoot rows inside the table", () => {
            const table = mountTable().find('table').element

            expect(Array.from(table.children).map((el) => el.tagName)).toEqual(['THEAD', 'TBODY', 'TFOOT'])
            expect(table.querySelectorAll('thead th')).toHaveLength(2)
            expect(table.querySelectorAll('tbody tr')).toHaveLength(2)
            expect(table.querySelector('tfoot td')?.textContent).toBe('Total')
        })

        it('passes class, data-* and aria-* attributes to the table, not the scroll box', () => {
            const wrapper = mountTable({}, { class: 'extra', 'data-testid': 'inventory', 'aria-describedby': 'hint' })
            const table = wrapper.find('table')

            expect(table.classes()).toEqual(expect.arrayContaining(['extra', 'ori-table', 'ori-table_md']))
            expect(table.attributes('data-testid')).toBe('inventory')
            expect(table.attributes('aria-describedby')).toBe('hint')

            expect(wrapper.classes()).toEqual(['ori-table-scroll'])
            expect(wrapper.attributes('data-testid')).toBeUndefined()
            expect(wrapper.attributes('aria-describedby')).toBeUndefined()
        })

        it('keeps an aria-label passed by the caller on the table', () => {
            const wrapper = mountTable({}, { 'aria-label': 'Fruit' })

            expect(wrapper.find('table').attributes('aria-label')).toBe('Fruit')
            expect(wrapper.attributes('aria-label')).toBeUndefined()
        })
    })

    describe('caption', () => {
        it('renders the caption prop as the first child <caption>, with an id', () => {
            const table = mountTable({ caption: 'Inventory' }).find('table')
            const caption = table.find('caption')

            expect(caption.exists()).toBe(true)
            expect(caption.text()).toBe('Inventory')
            expect(caption.attributes('id')).toBeTruthy()
            expect(table.element.firstElementChild).toBe(caption.element)
        })

        it('renders the #caption slot as the caption, and the slot wins over the prop', () => {
            const wrapper = track(
                mount(OriTable, {
                    props: { caption: 'From the prop' },
                    slots: { default: rows, caption: () => h('em', 'From the slot') },
                    attachTo: document.body
                })
            )
            const caption = wrapper.find('caption')

            expect(wrapper.findAll('caption')).toHaveLength(1)
            expect(caption.find('em').text()).toBe('From the slot')
            expect(caption.text()).toBe('From the slot')
            expect(caption.attributes('id')).toBeTruthy()
        })

        it('renders the #caption slot with no prop at all', () => {
            const wrapper = track(
                mount(OriTable, {
                    slots: { default: rows, caption: () => 'Slot only' },
                    attachTo: document.body
                })
            )

            expect(wrapper.find('caption').text()).toBe('Slot only')
        })

        it('renders no <caption> without a prop or a slot', () => {
            expect(mountTable().find('caption').exists()).toBe(false)
        })

        it('renders no <caption> for an empty caption string', () => {
            expect(mountTable({ caption: '' }).find('caption').exists()).toBe(false)
        })

        it('adds and removes the <caption> as the caption prop changes', async () => {
            const wrapper = mountTable()

            await wrapper.setProps({ caption: 'Later' })
            expect(wrapper.find('caption').text()).toBe('Later')

            await wrapper.setProps({ caption: undefined })
            expect(wrapper.find('caption').exists()).toBe(false)
        })

        it('gives each table its own caption id', () => {
            const wrapper = mountTemplate(`<div><OriTable caption="One" /><OriTable caption="Two" /></div>`)
            const [one, two] = wrapper.findAll('caption').map((c) => c.attributes('id'))

            expect(one).toBeTruthy()
            expect(two).toBeTruthy()
            expect(one).not.toBe(two)
        })
    })

    describe('scroll box accessibility', () => {
        it('is a plain box (no role, no tab stop, no name) while the table fits', async () => {
            const wrapper = mountTable({ caption: 'Inventory' })
            await nextTick()

            expect(wrapper.attributes('role')).toBeUndefined()
            expect(wrapper.attributes('tabindex')).toBeUndefined()
            expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
        })

        it('is a region, a tab stop and named by the caption when wider than its box on mount', async () => {
            overflowing()
            const wrapper = mountTable({ caption: 'Inventory' })
            await nextTick()

            const captionId = wrapper.find('caption').attributes('id')
            expect(captionId).toBeTruthy()
            expect(wrapper.attributes('role')).toBe('region')
            expect(wrapper.attributes('tabindex')).toBe('0')
            expect(wrapper.attributes('aria-labelledby')).toBe(captionId)
            expect(document.getElementById(captionId as string)?.textContent).toContain('Inventory')
        })

        it('is named by a #caption slot caption too', async () => {
            overflowing()
            const wrapper = track(
                mount(OriTable, {
                    slots: { default: rows, caption: () => 'Slot caption' },
                    attachTo: document.body
                })
            )
            await nextTick()

            expect(wrapper.attributes('role')).toBe('region')
            expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.find('caption').attributes('id'))
        })

        it('treats a taller-than-its-box table as scrolling too', async () => {
            setGeometry({ clientHeight: 120, scrollHeight: 480 })
            const wrapper = mountTable({ caption: 'Inventory', maxHeight: '120px' })
            await nextTick()

            expect(wrapper.attributes('role')).toBe('region')
            expect(wrapper.attributes('tabindex')).toBe('0')
            expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.find('caption').attributes('id'))
        })

        it('does not scroll when the content is exactly as large as the box', async () => {
            setGeometry({ clientHeight: 120, clientWidth: 300, scrollHeight: 120, scrollWidth: 300 })
            const wrapper = mountTable({ caption: 'Inventory' })
            await nextTick()

            expect(wrapper.attributes('role')).toBeUndefined()
            expect(wrapper.attributes('tabindex')).toBeUndefined()
        })

        it('gets a tab stop but no region when the table has no name', async () => {
            overflowing()
            const wrapper = mountTable()
            await nextTick()

            expect(wrapper.attributes('role')).toBeUndefined()
            expect(wrapper.attributes('tabindex')).toBe('0')
            expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
        })

        it('names the region like the table when there is no caption', async () => {
            overflowing()
            const labeled = mountTable({}, { 'aria-label': 'Inventory' })
            await nextTick()
            expect(labeled.attributes('role')).toBe('region')
            expect(labeled.attributes('aria-label')).toBe('Inventory')
            expect(labeled.find('table').attributes('aria-label')).toBe('Inventory')

            const labelledBy = mountTable({}, { 'aria-labelledby': 'heading' })
            await nextTick()
            expect(labelledBy.attributes('role')).toBe('region')
            expect(labelledBy.attributes('aria-labelledby')).toBe('heading')
        })

        it('drops the role, the tab stop and the name when the table stops overflowing', async () => {
            overflowing()
            const wrapper = mountTable({ caption: 'Inventory' })
            await nextTick()
            expect(wrapper.attributes('role')).toBe('region')

            setGeometry({ clientWidth: 800, scrollWidth: 640 })
            ResizeObserverStub.instances[0].fire()
            await nextTick()

            expect(wrapper.attributes('role')).toBeUndefined()
            expect(wrapper.attributes('tabindex')).toBeUndefined()
            expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
        })

        it('gains the role, the tab stop and the name when the table starts overflowing', async () => {
            const wrapper = mountTable({ caption: 'Inventory' })
            await nextTick()
            expect(wrapper.attributes('role')).toBeUndefined()

            overflowing()
            ResizeObserverStub.instances[0].fire()
            await nextTick()

            expect(wrapper.attributes('role')).toBe('region')
            expect(wrapper.attributes('tabindex')).toBe('0')
            expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.find('caption').attributes('id'))
        })

        it('names the region once a caption arrives while it already scrolls', async () => {
            overflowing()
            const wrapper = mountTable()
            await nextTick()
            expect(wrapper.attributes('aria-labelledby')).toBeUndefined()

            await wrapper.setProps({ caption: 'Inventory' })

            expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.find('caption').attributes('id'))
        })

        it('names the region once a #caption slot appears while it already scrolls', async () => {
            overflowing()
            const withCaption = ref(false)
            const wrapper = mountTemplate(
                `<OriTable>
                    <template v-if="withCaption" #caption>Slot caption</template>
                    <tbody><tr><td>Apples</td></tr></tbody>
                </OriTable>`,
                { withCaption }
            )
            await nextTick()
            expect(wrapper.find('caption').exists()).toBe(false)
            expect(wrapper.find('.ori-table-scroll').attributes('aria-labelledby')).toBeUndefined()

            withCaption.value = true
            await nextTick()

            const caption = wrapper.find('caption')
            expect(caption.exists()).toBe(true)
            expect(wrapper.find('.ori-table-scroll').attributes('aria-labelledby')).toBe(caption.attributes('id'))
        })
    })

    describe('ResizeObserver', () => {
        it('observes the scroll box and the table', () => {
            const wrapper = mountTable()

            expect(ResizeObserverStub.instances).toHaveLength(1)
            expect(ResizeObserverStub.instances[0].observed).toEqual([wrapper.element, wrapper.find('table').element])
        })

        it('disconnects on unmount', () => {
            const wrapper = mountTable()
            const [observer] = ResizeObserverStub.instances
            expect(observer.disconnects).toBe(0)

            unmount(wrapper)

            expect(observer.disconnects).toBe(1)
        })

        it('still measures once on mount when ResizeObserver is undefined, and does not throw', async () => {
            vi.stubGlobal('ResizeObserver', undefined)
            overflowing()

            const wrapper = mountTable({ caption: 'Inventory' })
            await nextTick()

            expect(ResizeObserverStub.instances).toHaveLength(0)
            expect(wrapper.attributes('role')).toBe('region')
            expect(wrapper.attributes('tabindex')).toBe('0')
            expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.find('caption').attributes('id'))
            expect(() => unmount(wrapper)).not.toThrow()
        })

        it('stays a plain box without ResizeObserver when the table fits', async () => {
            vi.stubGlobal('ResizeObserver', undefined)

            const wrapper = mountTable({ caption: 'Inventory' })
            await nextTick()

            expect(wrapper.attributes('role')).toBeUndefined()
            expect(wrapper.attributes('tabindex')).toBeUndefined()
        })
    })

    describe('a11y', () => {
        it('has no axe violations for a captioned table with th scope="col" headers', async () => {
            const wrapper = mountHost()
            await nextTick()

            await expectNoA11yViolations(wrapper.element)
        })

        it('has no axe violations for a table with a hidden caption', async () => {
            const wrapper = mountHost(
                HOST_TEMPLATE.replace('caption="Inventory"', 'caption="Inventory" caption-hidden striped hover')
            )
            await nextTick()

            expect(wrapper.find('table').classes()).toContain('ori-table_caption-hidden')
            expect(wrapper.find('caption').text()).toBe('Inventory')
            await expectNoA11yViolations(wrapper.element)
        })

        it('has no axe violations for an overflowing table whose region is named by its caption', async () => {
            overflowing()
            const wrapper = mountHost()
            await nextTick()

            const box = wrapper.find('.ori-table-scroll')
            expect(box.attributes('role')).toBe('region')
            expect(box.attributes('tabindex')).toBe('0')
            expect(box.attributes('aria-labelledby')).toBe(wrapper.find('caption').attributes('id'))
            await expectNoA11yViolations(wrapper.element)
        })
    })
})
