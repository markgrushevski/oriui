import { describe, it, expect, vi, afterEach } from 'vitest'
import { defineComponent, h, markRaw, nextTick, ref, type SetupContext, type VNode } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { OriList, OriListItem } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

const ICON = 'M0 0h24v24H0z'

const wrappers: VueWrapper[] = []

// Every wrapper is unmounted and the body cleared after each test, so an attached tree never leaks into the next.
function track<T extends VueWrapper>(wrapper: T): T {
    wrappers.push(wrapper)
    return wrapper
}

afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
    document.body.innerHTML = ''
})

// OriListItem's root is the <li>; the row is the one element inside it.
function mountItem(
    props: Record<string, unknown> = {},
    slots: Record<string, () => VNode> = {},
    attrs: Record<string, unknown> = {}
) {
    const wrapper = track(mount(OriListItem, { props: { label: 'Row', ...props }, slots, attrs }))
    return { wrapper, row: wrapper.find('.ori-list__row') }
}

// A click with `_vts` preset: Vue's event invoker skips a listener whose event predates its attach time, so a
// raw click fired in the mount millisecond could pass a "does not emit" assertion without testing anything.
function click(el: Element) {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    ;(event as unknown as { _vts: number })._vts = Date.now() + 1
    el.dispatchEvent(event)
}

// A component-scope host: lists and rows written in a template, the way a consumer writes them.
function mountTree(template: string, state: Record<string, unknown> = {}) {
    const Host = defineComponent({ components: { OriList, OriListItem }, setup: () => state, template })
    return track(mount(Host, { attachTo: document.body }))
}

// The shape a router-link component has: a `to` prop turned into an <a href>. markRaw, as a component handed
// to `as` is in an app (mount() would otherwise wrap the props object, and the component in it, in reactive()).
const LinkStub = markRaw({
    props: { to: { type: String, default: '' } },
    setup(props: { to: string }, { slots }: SetupContext) {
        return () => h('a', { href: props.to, 'data-to': props.to, 'data-stub': 'link' }, slots.default?.())
    }
})

// A link component that also states aria-current itself, the way a router's active link does.
const ActiveLinkStub = markRaw({
    props: { to: { type: String, default: '' } },
    setup(props: { to: string }, { slots }: SetupContext) {
        return () => h('a', { href: props.to, 'aria-current': 'page' }, slots.default?.())
    }
})

describe('OriList', () => {
    it('renders a <ul class="ori-list"> with an explicit role="list"', () => {
        const wrapper = track(mount(OriList))

        expect(wrapper.element.tagName).toBe('UL')
        expect(wrapper.classes()).toContain('ori-list')
        // Stated, not implied: Safari drops list semantics from a `list-style: none` <ul>.
        expect(wrapper.attributes('role')).toBe('list')
    })

    it('is not divided by default, and `divided` adds ori-list_divided', () => {
        expect(track(mount(OriList)).classes()).not.toContain('ori-list_divided')
        expect(track(mount(OriList, { props: { divided: true } })).classes()).toContain('ori-list_divided')
    })

    it('renders its default slot, one <li> per item', () => {
        const wrapper = track(
            mount(OriList, {
                slots: { default: () => [h(OriListItem, { label: 'One' }), h(OriListItem, { label: 'Two' })] }
            })
        )

        const items = wrapper.findAll(':scope > li.ori-list__item')
        expect(items).toHaveLength(2)
        expect(items.map((item) => item.find('.ori-list__label').text())).toEqual(['One', 'Two'])
    })
})

describe('OriListItem structure', () => {
    it('renders an <li class="ori-list__item"> holding exactly one .ori-list__row', () => {
        const { wrapper } = mountItem()

        expect(wrapper.element.tagName).toBe('LI')
        expect(wrapper.classes()).toContain('ori-list__item')
        expect(wrapper.findAll('.ori-list__row')).toHaveLength(1)
        expect(wrapper.element.children).toHaveLength(1)
        expect(wrapper.element.firstElementChild?.classList.contains('ori-list__row')).toBe(true)
    })

    it('renders the label in .ori-list__main, with no description element when there is none', () => {
        const { row } = mountItem({ label: 'Profile' })

        expect(row.find('.ori-list__main > .ori-list__label').text()).toBe('Profile')
        expect(row.find('.ori-list__description').exists()).toBe(false)
    })

    it('renders the description under the label', () => {
        const { row } = mountItem({ label: 'Profile', description: 'Name and avatar' })

        const children = [...(row.find('.ori-list__main').element.children as HTMLCollection)]
        expect(children.map((c) => c.className)).toEqual(['ori-list__label', 'ori-list__description'])
        expect(row.find('.ori-list__description').text()).toBe('Name and avatar')
    })

    it('the default slot replaces both the label and the description', () => {
        const { row } = mountItem(
            { label: 'Ignored', description: 'Ignored too' },
            { default: () => h('strong', { class: 'custom' }, 'Custom') }
        )

        expect(row.find('.ori-list__main .custom').text()).toBe('Custom')
        expect(row.find('.ori-list__label').exists()).toBe(false)
        expect(row.find('.ori-list__description').exists()).toBe(false)
        expect(row.text()).not.toContain('Ignored')
    })

    // ----- start -----

    it('renders no .ori-list__start without an icon or a #start slot', () => {
        const { row } = mountItem()

        expect(row.find('.ori-list__start').exists()).toBe(false)
    })

    it('`icon` renders an OriIcon in .ori-list__start', () => {
        const { row } = mountItem({ icon: ICON })

        const icon = row.find('.ori-list__start > .ori-icon')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('aria-hidden')).toBe('true')
        expect(icon.find('path').attributes('d')).toBe(ICON)
    })

    it('the #start slot renders in .ori-list__start and replaces the icon', () => {
        const { row } = mountItem(
            { icon: ICON },
            { start: () => h('span', { class: 'avatar', 'aria-hidden': 'true' }, 'A') }
        )

        expect(row.find('.ori-list__start .avatar').exists()).toBe(true)
        expect(row.find('.ori-icon').exists()).toBe(false)
    })

    it('a #start slot alone is enough to render .ori-list__start', () => {
        const { row } = mountItem({}, { start: () => h('span', { class: 'avatar' }, 'A') })

        expect(row.find('.ori-list__start .avatar').exists()).toBe(true)
    })

    // ----- end -----

    it('renders no .ori-list__end without a hint, a chevron or an #end slot', () => {
        const { row } = mountItem({ label: 'Plain' })

        expect(row.find('.ori-list__end').exists()).toBe(false)
        expect(row.find('.ori-list__hint').exists()).toBe(false)
        expect(row.find('.ori-list__chevron').exists()).toBe(false)
    })

    it('`hint` renders .ori-list__hint in .ori-list__end', () => {
        const { row } = mountItem({ hint: 'Ctrl+S' })

        expect(row.find('.ori-list__end > .ori-list__hint').text()).toBe('Ctrl+S')
        expect(row.find('.ori-list__chevron').exists()).toBe(false)
    })

    it('`chevron` renders an aria-hidden svg and no hint', () => {
        const { row } = mountItem({ chevron: true })

        const chevron = row.find('.ori-list__end > svg.ori-list__chevron')
        expect(chevron.exists()).toBe(true)
        expect(chevron.attributes('aria-hidden')).toBe('true')
        expect(row.find('.ori-list__hint').exists()).toBe(false)
    })

    it('a hint and a chevron sit together, the hint first', () => {
        const { row } = mountItem({ hint: 'Ctrl+K', chevron: true })

        const children = [...(row.find('.ori-list__end').element.children as HTMLCollection)]
        expect(children.map((c) => c.classList[0])).toEqual(['ori-list__hint', 'ori-list__chevron'])
    })

    it('the #end slot renders in .ori-list__end and replaces the hint and the chevron', () => {
        const { row } = mountItem({ hint: 'Ctrl+S', chevron: true }, { end: () => h('span', { class: 'badge' }, '3') })

        expect(row.find('.ori-list__end .badge').text()).toBe('3')
        expect(row.find('.ori-list__hint').exists()).toBe(false)
        expect(row.find('.ori-list__chevron').exists()).toBe(false)
    })
})

describe('OriListItem row element', () => {
    it('is a static <div> with no interactive attributes by default', () => {
        const { row } = mountItem()
        const el = row.element

        expect(el.tagName).toBe('DIV')
        expect(el.hasAttribute('href')).toBe(false)
        expect(el.hasAttribute('type')).toBe(false)
        expect(el.hasAttribute('disabled')).toBe(false)
        expect(el.hasAttribute('aria-disabled')).toBe(false)
        expect(el.hasAttribute('tabindex')).toBe(false)
    })

    it('`href` makes the row an <a href>', () => {
        const { row } = mountItem({ href: '/settings' })

        expect(row.element.tagName).toBe('A')
        expect(row.attributes('href')).toBe('/settings')
        expect(row.attributes('type')).toBeUndefined()
    })

    it('a click listener (onClick attr) makes the row a <button type="button">', () => {
        const { row } = mountItem({}, {}, { onClick: vi.fn() })

        expect(row.element.tagName).toBe('BUTTON')
        expect(row.attributes('type')).toBe('button')
        expect(row.attributes('href')).toBeUndefined()
    })

    it('`@click` in a parent template makes a button row too', async () => {
        const onClick = vi.fn()
        const wrapper = mountTree(`<OriList><OriListItem label="Open" @click="onClick" /></OriList>`, { onClick })

        const button = wrapper.find('.ori-list__row')
        expect(button.element.tagName).toBe('BUTTON')
        await button.trigger('click')
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('a row with `href` stays a link even when it also has a click listener', () => {
        const onClick = vi.fn()
        const { row } = mountItem({ href: '/go' }, {}, { onClick })

        expect(row.element.tagName).toBe('A')
        click(row.element)
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('`as` (a tag) wins over `href` and over a click listener', () => {
        const asButton = mountItem({ as: 'button', href: '/x' })
        expect(asButton.row.element.tagName).toBe('BUTTON')
        expect(asButton.row.attributes('type')).toBe('button')
        expect(asButton.row.attributes('href')).toBeUndefined()

        const asDiv = mountItem({ as: 'div' }, {}, { onClick: vi.fn() })
        expect(asDiv.row.element.tagName).toBe('DIV')
        expect(asDiv.row.attributes('type')).toBeUndefined()

        const asLink = mountItem({ as: 'a' }, {}, { onClick: vi.fn() })
        expect(asLink.row.element.tagName).toBe('A')
    })

    it('`as` (a component) renders that component as the row and hands it the row attrs', () => {
        const { wrapper, row } = mountItem({ as: LinkStub, current: true }, {}, { to: '/inbox', 'data-id': '7' })

        // The stub stands in for a router link: its own <a> is the row, with the li still the root.
        expect(wrapper.element.tagName).toBe('LI')
        expect(row.element.tagName).toBe('A')
        expect(row.attributes('data-stub')).toBe('link')
        // `to` reached the component as its own prop, and the other attrs fell through onto its root.
        expect(row.attributes('data-to')).toBe('/inbox')
        expect(row.attributes('data-id')).toBe('7')
        // A component row counts as a link: `page`, not `true`.
        expect(row.attributes('aria-current')).toBe('page')
        // The parts still render inside it, through the stub's default slot.
        expect(row.find('.ori-list__label').text()).toBe('Row')
    })

    it('a component row gets the row class and the caller class on its root', () => {
        const { row } = mountItem({ as: LinkStub }, {}, { to: '/inbox', class: 'extra' })

        expect(row.classes()).toEqual(expect.arrayContaining(['ori-list__row', 'extra']))
    })

    it('a component row is not given type or disabled (those are button-only)', () => {
        const { row } = mountItem({ as: LinkStub, disabled: true }, {}, { to: '/inbox' })

        expect(row.attributes('type')).toBeUndefined()
        expect(row.attributes('disabled')).toBeUndefined()
    })

    // Vue merges fallthrough attrs by assignment, so an attr bound to `undefined` ERASES the same attr that the
    // component sets on its own root. A router link sets its own href and aria-current; the row must not bind
    // those keys at all when it has nothing to say.
    it('a component row keeps the href its own root sets', () => {
        const { row } = mountItem({ as: LinkStub }, {}, { to: '/inbox' })

        expect(row.attributes('href')).toBe('/inbox')
    })

    it('a component row keeps the aria-current its own root sets when `current` is off', () => {
        const { row } = mountItem({ as: ActiveLinkStub }, {}, { to: '/inbox' })

        expect(row.attributes('aria-current')).toBe('page')
    })
})

describe('OriListItem current', () => {
    it('a tag other than a or button is a static row: aria-current="true", no href', () => {
        const { row } = mountItem({ as: 'span', current: true, href: '/x' })

        expect(row.element.tagName).toBe('SPAN')
        expect(row.attributes('aria-current')).toBe('true')
        expect(row.attributes('href')).toBeUndefined()
    })

    it('is absent unless `current`', () => {
        expect(mountItem({ href: '/a' }).row.element.hasAttribute('aria-current')).toBe(false)
        expect(mountItem({}, {}, { onClick: vi.fn() }).row.element.hasAttribute('aria-current')).toBe(false)
        expect(mountItem().row.element.hasAttribute('aria-current')).toBe(false)
        expect(mountItem({ href: '/a', current: false }).row.element.hasAttribute('aria-current')).toBe(false)
    })

    it('is aria-current="page" on a link row', () => {
        expect(mountItem({ href: '/a', current: true }).row.attributes('aria-current')).toBe('page')
    })

    it('is aria-current="true" on a button row', () => {
        expect(mountItem({ current: true }, {}, { onClick: vi.fn() }).row.attributes('aria-current')).toBe('true')
        expect(mountItem({ as: 'button', current: true }).row.attributes('aria-current')).toBe('true')
    })

    it('is aria-current="true" on a static div row', () => {
        expect(mountItem({ current: true }).row.attributes('aria-current')).toBe('true')
    })
})

describe('OriListItem disabled', () => {
    it('a button row gets the real disabled attribute and stays type="button"', () => {
        const el = mountItem({ disabled: true }, {}, { onClick: vi.fn() }).row.element as HTMLButtonElement

        expect(el.tagName).toBe('BUTTON')
        expect(el.disabled).toBe(true)
        expect(el.getAttribute('type')).toBe('button')
    })

    it('an enabled button row has no disabled attribute', () => {
        const el = mountItem({}, {}, { onClick: vi.fn() }).row.element as HTMLButtonElement

        expect(el.disabled).toBe(false)
        expect(el.hasAttribute('disabled')).toBe(false)
    })

    it('a link row loses its href, keeps the link role and gets aria-disabled="true"', () => {
        const { row } = mountItem({ href: '/settings', disabled: true })

        expect(row.element.tagName).toBe('A')
        expect(row.attributes('href')).toBeUndefined()
        expect(row.attributes('role')).toBe('link')
        expect(row.attributes('aria-disabled')).toBe('true')
    })

    it('an enabled link row keeps its href and has no aria-disabled', () => {
        const { row } = mountItem({ href: '/settings' })

        expect(row.attributes('href')).toBe('/settings')
        expect(row.attributes('aria-disabled')).toBeUndefined()
    })

    it('a disabled component row gets aria-disabled="true"', () => {
        const { row } = mountItem({ as: LinkStub, disabled: true }, {}, { to: '/inbox' })

        expect(row.attributes('aria-disabled')).toBe('true')
    })

    it('a disabled button row does not emit click; an enabled one does', () => {
        const disabled = vi.fn()
        const enabled = vi.fn()
        const off = mountItem({ disabled: true }, {}, { onClick: disabled })
        const on = mountItem({}, {}, { onClick: enabled })

        click(off.row.element)
        click(on.row.element)

        expect(disabled).not.toHaveBeenCalled()
        expect(enabled).toHaveBeenCalledTimes(1)
    })

    it('a disabled link row swallows the click before its listeners run', () => {
        const onClick = vi.fn()
        const { row } = mountItem({ disabled: true, href: '/inbox' }, {}, { onClick })

        const event = new MouseEvent('click', { bubbles: true, cancelable: true })
        ;(event as unknown as { _vts: number })._vts = Date.now() + 1
        row.element.dispatchEvent(event)

        expect(onClick).not.toHaveBeenCalled()
        expect(event.defaultPrevented).toBe(true)
    })
})

describe('OriListItem attribute and listener routing', () => {
    it('class, data-* and aria-* land on the row, not the <li>', () => {
        const { wrapper, row } = mountItem(
            { href: '/a' },
            {},
            { class: 'extra', 'data-id': '42', 'data-testid': 'row', 'aria-label': 'Open a' }
        )

        expect(row.classes()).toEqual(expect.arrayContaining(['ori-list__row', 'extra']))
        expect(row.attributes('data-id')).toBe('42')
        expect(row.attributes('data-testid')).toBe('row')
        expect(row.attributes('aria-label')).toBe('Open a')

        // inheritAttrs: false — the <li> carries only its own class.
        expect(wrapper.classes()).toEqual(['ori-list__item'])
        expect(wrapper.attributes('data-id')).toBeUndefined()
        expect(wrapper.attributes('data-testid')).toBeUndefined()
        expect(wrapper.attributes('aria-label')).toBeUndefined()
    })

    it('`target` (and `rel`) land on a link row', () => {
        const { wrapper, row } = mountItem({ href: 'https://example.com' }, {}, { target: '_blank', rel: 'noopener' })

        expect(row.attributes('target')).toBe('_blank')
        expect(row.attributes('rel')).toBe('noopener')
        expect(wrapper.attributes('target')).toBeUndefined()
    })

    it('a click on the row emits the caller listener, and the <li> carries no listener of its own', async () => {
        const onClick = vi.fn()
        const { wrapper, row } = mountItem({}, {}, { onClick })

        await row.trigger('click')
        expect(onClick).toHaveBeenCalledTimes(1)

        // Clicking the <li> itself (outside the row) is not a row activation.
        click(wrapper.element)
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('a click on a part inside the row bubbles to the row listener', async () => {
        const onClick = vi.fn()
        const { row } = mountItem({ label: 'Open', hint: 'Ctrl+O' }, {}, { onClick })

        await row.find('.ori-list__label').trigger('click')
        await row.find('.ori-list__hint').trigger('click')

        expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('a caller attr overrides the row default, such as type="submit" on a button row', () => {
        const { row } = mountItem({}, {}, { onClick: vi.fn(), type: 'submit' })

        expect(row.attributes('type')).toBe('submit')
    })

    it('follows `href` as it changes: link, then a plain row', async () => {
        const { wrapper, row } = mountItem({ href: '/a' })
        expect(row.element.tagName).toBe('A')

        await wrapper.setProps({ href: undefined })

        expect(wrapper.find('.ori-list__row').element.tagName).toBe('DIV')
    })
})

describe('OriListItem static row with a control of its own', () => {
    it('holds a real checkbox in #end inside a <div> row, never inside a button or a link', () => {
        const { row } = mountItem(
            { label: 'Notifications' },
            { end: () => h('input', { type: 'checkbox', 'aria-label': 'Notifications' }) }
        )
        const checkbox = row.find('.ori-list__end input[type="checkbox"]')

        expect(row.element.tagName).toBe('DIV')
        expect(checkbox.exists()).toBe(true)
        expect(checkbox.element.closest('button, a')).toBeNull()
    })

    it('the control in #end keeps working: toggling it changes its state and does not need a row listener', async () => {
        const { row } = mountItem({ label: 'Notifications' }, { end: () => h('input', { type: 'checkbox' }) })
        const checkbox = row.find('input').element as HTMLInputElement

        expect(checkbox.checked).toBe(false)
        await row.find('input').setValue(true)
        expect(checkbox.checked).toBe(true)
    })

    it('a reactive v-model on a control in #end round-trips through a host', async () => {
        const on = ref(false)
        const wrapper = mountTree(
            `<OriList>
                <OriListItem label="Dark mode">
                    <template #end><input v-model="on" type="checkbox" aria-label="Dark mode" /></template>
                </OriListItem>
            </OriList>`,
            { on }
        )
        const input = wrapper.find('input')

        expect(wrapper.find('.ori-list__row').element.tagName).toBe('DIV')
        await input.setValue(true)
        expect(on.value).toBe(true)
        on.value = false
        await nextTick()
        expect((input.element as HTMLInputElement).checked).toBe(false)
    })
})

// ----- axe -----

describe('OriList a11y', () => {
    it('has no axe violations as a nav list of link rows with one current page', async () => {
        const wrapper = mountTree(`
            <nav aria-label="Main">
                <OriList>
                    <OriListItem label="Overview" href="/" current />
                    <OriListItem label="Projects" href="/projects" icon="M0 0h24v24H0z" />
                    <OriListItem label="Settings" href="/settings" description="Account and billing" chevron />
                </OriList>
            </nav>
        `)

        expect(wrapper.findAll('a.ori-list__row')).toHaveLength(3)
        expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1)
        await expectNoA11yViolations(wrapper.element)
    })

    it('has no axe violations as a divided action list of button rows with hints and a chevron', async () => {
        const wrapper = mountTree(
            `
            <OriList divided>
                <OriListItem label="Save" hint="Ctrl+S" icon="M0 0h24v24H0z" @click="noop" />
                <OriListItem label="Export" hint="Ctrl+E" @click="noop" />
                <OriListItem label="More options" description="Share, print, rename" chevron @click="noop" />
                <OriListItem label="Delete" disabled @click="noop" />
            </OriList>
        `,
            { noop: () => {} }
        )

        expect(wrapper.findAll('button.ori-list__row')).toHaveLength(4)
        await expectNoA11yViolations(wrapper.element)
    })

    it('has no axe violations as a settings list of static rows holding a labeled checkbox', async () => {
        const wrapper = mountTree(
            `
            <OriList>
                <OriListItem label="Notifications" description="Email me about new activity">
                    <template #end><input v-model="notify" type="checkbox" aria-label="Notifications" /></template>
                </OriListItem>
                <OriListItem label="Dark mode">
                    <template #end><input v-model="dark" type="checkbox" aria-label="Dark mode" /></template>
                </OriListItem>
            </OriList>
        `,
            { notify: ref(true), dark: ref(false) }
        )

        expect(wrapper.findAll('div.ori-list__row')).toHaveLength(2)
        expect(wrapper.findAll('.ori-list__row input[type="checkbox"]')).toHaveLength(2)
        await expectNoA11yViolations(wrapper.element)
    })

    it('has no axe violations for a disabled link row', async () => {
        const wrapper = mountTree(`
            <nav aria-label="Account">
                <OriList>
                    <OriListItem label="Billing" href="/billing" disabled />
                    <OriListItem label="Profile" href="/profile" />
                </OriList>
            </nav>
        `)

        await expectNoA11yViolations(wrapper.element)
    })
})
