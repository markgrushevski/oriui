import { describe, it, expect, vi, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { OriDrawer } from '../packages/vue/src'
import { expectNoA11yViolations } from './helpers/axe'

type Props = Record<string, unknown>
type Slots = Record<string, unknown>
type TriggerScope = { props: Record<string, unknown>; open: boolean }

const wrappers: VueWrapper[] = []

function mountDrawer(props: Props = {}, slots: Slots = {}, attrs: Record<string, unknown> = {}) {
    const wrapper = mount(OriDrawer, {
        props: { title: 'Filters', ...props },
        slots: {
            trigger: (scope: TriggerScope) =>
                h('button', { ...scope.props, 'data-testid': 'trigger' }, scope.open ? 'Close drawer' : 'Open drawer'),
            ...slots
        },
        attrs,
        attachTo: document.body
    })
    wrappers.push(wrapper)
    return wrapper
}

// Mounts a host template that uses <OriDrawer> (v-model:open, several drawers in one app). One app, so the
// drawers draw their ids from a shared counter — a separate mount() restarts it.
function mountHost(template: string, state: Record<string, unknown> = {}) {
    const Host = defineComponent({ components: { OriDrawer }, setup: () => state, template })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper as unknown as VueWrapper)
    return wrapper
}

// OriDrawer renders a real <dialog> and, when non-modal, listens on `document` — unmount every wrapper so a
// finished test cannot keep reacting to the next one's events, then clear the body.
afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

const drawerEl = () => document.querySelector('dialog.ori-drawer') as HTMLDialogElement
const triggerEl = () => document.querySelector('[data-testid="trigger"]') as HTMLButtonElement
const closeButton = () => document.querySelector('.ori-drawer__close') as HTMLButtonElement

function addOutside(): HTMLButtonElement {
    const outside = document.createElement('button')
    outside.textContent = 'Page'
    document.body.append(outside)
    return outside
}

const pressEscape = (target: EventTarget = document) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
const pointerDown = (target: EventTarget) => target.dispatchEvent(new Event('pointerdown', { bubbles: true }))

describe('OriDrawer — rendering', () => {
    it('renders the trigger and a closed <dialog> by default', async () => {
        mountDrawer()
        await nextTick()

        expect(triggerEl()).not.toBeNull()
        expect(drawerEl()).not.toBeNull()
        expect(drawerEl().open).toBe(false)
    })

    it('renders content > header (title + close) + body, and no footer without a #footer slot', () => {
        mountDrawer({ title: 'Filters' }, { default: () => 'Body copy' })

        const content = drawerEl().querySelector(':scope > .ori-drawer__content') as HTMLElement
        expect(content).not.toBeNull()
        expect(content.querySelector(':scope > header.ori-drawer__header')).not.toBeNull()
        expect(content.querySelector('header > h2.ori-drawer__title')?.textContent?.trim()).toBe('Filters')
        expect(content.querySelector('header > button.ori-drawer__close')).not.toBeNull()
        expect(content.querySelector(':scope > .ori-drawer__body')?.textContent).toContain('Body copy')
        expect(content.querySelector('footer')).toBeNull()
    })

    it('renders the close button as a labeled, non-submitting button', () => {
        mountDrawer()

        expect(closeButton().tagName).toBe('BUTTON')
        expect(closeButton().getAttribute('type')).toBe('button')
        expect(closeButton().getAttribute('aria-label')).toBe('Close')
    })

    it('docks to the end by default', () => {
        mountDrawer()

        expect(drawerEl().className).toBe('ori-drawer ori-drawer_end')
    })

    it.each(['start', 'end', 'top', 'bottom'] as const)('maps side="%s" to the ori-drawer_%s class', (side) => {
        mountDrawer({ side })

        expect(drawerEl().className).toBe(`ori-drawer ori-drawer_${side}`)
    })

    it('changes the side class when the prop changes', async () => {
        const wrapper = mountDrawer({ side: 'start' })
        await wrapper.setProps({ side: 'bottom' })

        expect(drawerEl().classList.contains('ori-drawer_bottom')).toBe(true)
        expect(drawerEl().classList.contains('ori-drawer_start')).toBe(false)
    })

    it('renders the #footer slot inside a <footer> only when given', () => {
        mountDrawer({}, { footer: () => h('button', { type: 'button' }, 'Apply') })

        const footer = drawerEl().querySelector('.ori-drawer__content > footer.ori-drawer__footer')
        expect(footer).not.toBeNull()
        expect(footer?.textContent).toContain('Apply')
    })

    it('renders no <footer> when the #footer slot is absent', () => {
        mountDrawer({}, { default: () => 'Body' })

        expect(drawerEl().querySelector('footer')).toBeNull()
    })

    it('lands stray attributes (data-*, aria-label, class) on the <dialog>, not on the trigger', () => {
        mountDrawer({}, {}, { 'data-feature': 'filters', 'aria-label': 'Filter panel', class: 'my-drawer' })

        expect(drawerEl().getAttribute('data-feature')).toBe('filters')
        expect(drawerEl().getAttribute('aria-label')).toBe('Filter panel')
        expect(drawerEl().classList.contains('my-drawer')).toBe(true)
        // The caller's class is merged with, not replacing, the component classes.
        expect(drawerEl().classList.contains('ori-drawer')).toBe(true)
        expect(drawerEl().classList.contains('ori-drawer_end')).toBe(true)
        expect(triggerEl().hasAttribute('data-feature')).toBe(false)
        expect(triggerEl().classList.contains('my-drawer')).toBe(false)
    })
})

describe('OriDrawer — title', () => {
    it('renders the title prop in an <h2> that names the dialog via aria-labelledby', () => {
        mountDrawer({ title: 'Filters' })

        const title = document.querySelector('h2.ori-drawer__title') as HTMLElement
        expect(title.textContent?.trim()).toBe('Filters')
        expect(title.id).toBeTruthy()
        expect(drawerEl().getAttribute('aria-labelledby')).toBe(title.id)
    })

    it('renders the #title slot, which wins over the title prop', () => {
        mountDrawer({ title: 'Prop title' }, { title: () => h('em', 'Slot title') })

        const title = document.querySelector('h2.ori-drawer__title') as HTMLElement
        expect(title.querySelector('em')?.textContent).toBe('Slot title')
        expect(title.textContent).not.toContain('Prop title')
        expect(drawerEl().getAttribute('aria-labelledby')).toBe(title.id)
    })

    it('renders a #title slot with no title prop', () => {
        mountDrawer({ title: undefined }, { title: () => 'Only slot' })

        expect(document.querySelector('h2.ori-drawer__title')?.textContent?.trim()).toBe('Only slot')
    })

    it('renders no empty <h2> without a title or #title slot', () => {
        mountDrawer({ title: undefined }, {}, { 'aria-label': 'Settings' })

        expect(document.querySelector('.ori-drawer__title')).toBeNull()
        expect(drawerEl().querySelector('h2')).toBeNull()
    })
})

describe('OriDrawer — uncontrolled open state', () => {
    it('opens on trigger click and closes via the × button, emitting update:open and close', async () => {
        const wrapper = mountDrawer()
        await nextTick()
        expect(drawerEl().open).toBe(false)

        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()
        expect(drawerEl().open).toBe(true)
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
        expect(wrapper.emitted('close')).toBeUndefined()

        closeButton().click()
        await nextTick()
        expect(drawerEl().open).toBe(false)
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
        expect(wrapper.emitted('update:open')).toHaveLength(2)
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('starts open with defaultOpen', async () => {
        mountDrawer({ defaultOpen: true })
        await nextTick()

        expect(drawerEl().open).toBe(true)
        expect(triggerEl().getAttribute('aria-expanded')).toBe('true')
    })

    it('mirrors a browser-driven close (dialog.close(), as Escape does natively) into state and events', async () => {
        const wrapper = mountDrawer({ defaultOpen: true })
        await nextTick()
        expect(drawerEl().open).toBe(true)

        drawerEl().close()
        await nextTick()

        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
        expect(wrapper.emitted('close')).toHaveLength(1)
        expect(triggerEl().getAttribute('aria-expanded')).toBe('false')
    })

    it('can be reopened after closing', async () => {
        const wrapper = mountDrawer()
        await nextTick()

        await wrapper.find('[data-testid="trigger"]').trigger('click')
        closeButton().click()
        await nextTick()
        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()

        expect(drawerEl().open).toBe(true)
        expect(wrapper.emitted('update:open')).toEqual([[true], [false], [true]])
    })
})

describe('OriDrawer — controlled open state', () => {
    it('opens and closes from the `open` prop', async () => {
        const wrapper = mountDrawer({ open: false })
        await nextTick()
        expect(drawerEl().open).toBe(false)

        await wrapper.setProps({ open: true })
        await nextTick()
        expect(drawerEl().open).toBe(true)

        await wrapper.setProps({ open: false })
        await nextTick()
        expect(drawerEl().open).toBe(false)
    })

    it('is open on mount when `open` is true', async () => {
        mountDrawer({ open: true })
        await nextTick()

        expect(drawerEl().open).toBe(true)
    })

    it('emits update:open and close on an internal close and leaves the prop to the host', async () => {
        const wrapper = mountDrawer({ open: true })
        await nextTick()

        closeButton().click()
        await nextTick()

        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
        expect(wrapper.emitted('close')).toHaveLength(1)
        expect(drawerEl().open).toBe(false)
    })

    it('round-trips through v-model:open with a host ref', async () => {
        const open = ref(false)
        mountHost(`<OriDrawer v-model:open="open" title="Filters" />`, { open })
        await nextTick()
        expect(drawerEl().open).toBe(false)

        // Host -> drawer.
        open.value = true
        await nextTick()
        await nextTick()
        expect(drawerEl().open).toBe(true)

        // Drawer -> host, with no feedback loop.
        closeButton().click()
        await nextTick()
        expect(open.value).toBe(false)
        expect(drawerEl().open).toBe(false)

        // And back again.
        open.value = true
        await flushPromises()
        expect(drawerEl().open).toBe(true)
    })

    it('writes a trigger-driven open back through v-model:open', async () => {
        const open = ref(false)
        mountHost(
            `<OriDrawer v-model:open="open" title="Filters">
                <template #trigger="{ props }"><button v-bind="props" data-testid="trigger">Open</button></template>
            </OriDrawer>`,
            { open }
        )
        await nextTick()

        triggerEl().click()
        await nextTick()

        expect(open.value).toBe(true)
        expect(drawerEl().open).toBe(true)
    })
})

describe('OriDrawer — modal vs non-modal', () => {
    it('is modal by default: role=dialog, aria-modal="true", not a manual popover', () => {
        mountDrawer()

        expect(drawerEl().getAttribute('role')).toBe('dialog')
        expect(drawerEl().getAttribute('aria-modal')).toBe('true')
        // `:popover="undefined"` removes the attribute in a browser, but happy-dom's `popover` setter only
        // removes it for `null` and writes the string "undefined" — so assert it is not `manual`, and let
        // e2e pin that the attribute is absent.
        expect(drawerEl().getAttribute('popover')).not.toBe('manual')
    })

    it('opens a modal drawer with showModal()', async () => {
        const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
        const show = vi.spyOn(HTMLDialogElement.prototype, 'show')
        const wrapper = mountDrawer()
        await nextTick()

        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()

        expect(showModal).toHaveBeenCalledTimes(1)
        expect(show).not.toHaveBeenCalled()
        expect(drawerEl().open).toBe(true)
    })

    it('is a manual popover without aria-modal when modal is false', () => {
        mountDrawer({ modal: false })

        expect(drawerEl().getAttribute('popover')).toBe('manual')
        expect(drawerEl().hasAttribute('aria-modal')).toBe(false)
        expect(drawerEl().getAttribute('role')).toBe('dialog')
    })

    it('opens a non-modal drawer without showModal() (show() stands in for showPopover() in happy-dom)', async () => {
        const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
        const show = vi.spyOn(HTMLDialogElement.prototype, 'show')
        const wrapper = mountDrawer({ modal: false })
        await nextTick()
        expect(typeof drawerEl().showPopover).toBe('undefined')

        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()

        expect(showModal).not.toHaveBeenCalled()
        expect(show).toHaveBeenCalledTimes(1)
        expect(drawerEl().open).toBe(true)
    })

    it('uses showPopover() / hidePopover() where the Popover API exists', async () => {
        const open = new WeakSet<Element>()
        const showPopover = vi.fn(function (this: Element) {
            open.add(this)
        })
        const hidePopover = vi.fn(function (this: Element) {
            open.delete(this)
        })
        const realMatches = Element.prototype.matches
        const matches = vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
            this: Element,
            selector: string
        ) {
            return selector === ':popover-open' ? open.has(this) : realMatches.call(this, selector)
        })
        Object.assign(HTMLElement.prototype, { showPopover, hidePopover })
        try {
            const wrapper = mountDrawer({ modal: false })
            await nextTick()
            const show = vi.spyOn(HTMLDialogElement.prototype, 'show')

            await wrapper.find('[data-testid="trigger"]').trigger('click')
            await nextTick()
            expect(showPopover).toHaveBeenCalledTimes(1)
            expect(show).not.toHaveBeenCalled()

            await wrapper.find('[data-testid="trigger"]').trigger('click')
            await nextTick()
            expect(hidePopover).toHaveBeenCalledTimes(1)
            expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
        } finally {
            matches.mockRestore()
            delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover
            delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover
        }
    })

    it('does not put the Escape handler on the document for a modal drawer (the platform owns it)', async () => {
        const wrapper = mountDrawer({ defaultOpen: true })
        await nextTick()

        pressEscape(document.body)
        await nextTick()

        expect(drawerEl().open).toBe(true)
        expect(wrapper.emitted('update:open')).toBeUndefined()
    })

    it('does not dismiss a modal drawer on a document pointerdown (the backdrop click does that)', async () => {
        const outside = addOutside()
        mountDrawer({ defaultOpen: true })
        await nextTick()

        pointerDown(outside)
        await nextTick()

        expect(drawerEl().open).toBe(true)
    })
})

describe('OriDrawer — modal light dismiss and cancel', () => {
    it('closes on a click that lands on the <dialog> itself (its backdrop), not on the content', async () => {
        const wrapper = mountDrawer({ defaultOpen: true })
        await nextTick()

        ;(document.querySelector('.ori-drawer__content') as HTMLElement).click()
        await nextTick()
        expect(drawerEl().open).toBe(true)

        drawerEl().click()
        await nextTick()
        expect(drawerEl().open).toBe(false)
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('ignores a backdrop click when closeOnInteractOutside is false', async () => {
        mountDrawer({ defaultOpen: true, closeOnInteractOutside: false })
        await nextTick()

        drawerEl().click()
        await nextTick()

        expect(drawerEl().open).toBe(true)
    })

    it('lets the platform cancel (Escape) run by default and blocks it with closeOnEscape=false', async () => {
        mountDrawer({ defaultOpen: true })
        await nextTick()
        const allowed = new Event('cancel', { cancelable: true })
        drawerEl().dispatchEvent(allowed)
        expect(allowed.defaultPrevented).toBe(false)

        document.body.innerHTML = ''
        wrappers.splice(0).forEach((wrapper) => wrapper.unmount())

        mountDrawer({ defaultOpen: true, closeOnEscape: false })
        await nextTick()
        const blocked = new Event('cancel', { cancelable: true })
        drawerEl().dispatchEvent(blocked)
        expect(blocked.defaultPrevented).toBe(true)
    })
})

describe('OriDrawer — trigger', () => {
    it('carries aria-haspopup="dialog", aria-expanded and a data-ori-drawer-trigger hook', async () => {
        mountDrawer()
        await nextTick()

        expect(triggerEl().getAttribute('aria-haspopup')).toBe('dialog')
        expect(triggerEl().getAttribute('aria-expanded')).toBe('false')
        expect(triggerEl().getAttribute('data-ori-drawer-trigger')).toBeTruthy()
    })

    it('gives each drawer its own trigger key', async () => {
        mountHost(`
            <OriDrawer title="One">
                <template #trigger="{ props }"><button v-bind="props">One</button></template>
            </OriDrawer>
            <OriDrawer title="Two">
                <template #trigger="{ props }"><button v-bind="props">Two</button></template>
            </OriDrawer>`)
        await nextTick()

        const keys = Array.from(document.querySelectorAll('[data-ori-drawer-trigger]')).map((el) =>
            el.getAttribute('data-ori-drawer-trigger')
        )
        expect(keys).toHaveLength(2)
        expect(keys[0]).toBeTruthy()
        expect(keys[0]).not.toBe(keys[1])
    })

    it('exempts only its own trigger from outside-press dismissal, not a sibling drawer trigger', async () => {
        const open = ref(true)
        mountHost(
            `<OriDrawer v-model:open="open" :modal="false" title="One">
                <template #trigger="{ props }"><button v-bind="props" id="one">One</button></template>
            </OriDrawer>
            <OriDrawer :modal="false" title="Two">
                <template #trigger="{ props }"><button v-bind="props" id="two">Two</button></template>
            </OriDrawer>`,
            { open }
        )
        await nextTick()
        await nextTick()
        expect(open.value).toBe(true)

        pointerDown(document.getElementById('one') as HTMLElement)
        await nextTick()
        expect(open.value).toBe(true)

        pointerDown(document.getElementById('two') as HTMLElement)
        await nextTick()
        expect(open.value).toBe(false)
    })

    it('toggles: a click opens, a second click closes, and aria-expanded follows', async () => {
        const wrapper = mountDrawer({ modal: false })
        await nextTick()

        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()
        expect(drawerEl().open).toBe(true)
        expect(triggerEl().getAttribute('aria-expanded')).toBe('true')

        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()
        expect(drawerEl().open).toBe(false)
        expect(triggerEl().getAttribute('aria-expanded')).toBe('false')
        expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('hands the slot its open state', async () => {
        const wrapper = mountDrawer()
        await nextTick()
        expect(triggerEl().textContent).toBe('Open drawer')

        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()
        expect(triggerEl().textContent).toBe('Close drawer')
    })

    it('keeps a caller-supplied id on the trigger', async () => {
        mountDrawer(
            {},
            {
                trigger: (scope: TriggerScope) =>
                    h('button', { ...scope.props, id: 'my-trigger', 'data-testid': 'trigger' }, 'Open')
            }
        )
        await nextTick()

        expect(triggerEl().id).toBe('my-trigger')
        expect(triggerEl().getAttribute('data-ori-drawer-trigger')).toBeTruthy()
    })
})

describe('OriDrawer — non-modal Escape', () => {
    async function openNonModal(props: Props = {}, slots: Slots = {}) {
        const wrapper = mountDrawer({ modal: false, defaultOpen: true, ...props }, slots)
        await nextTick()
        expect(drawerEl().open).toBe(true)
        return wrapper
    }

    it('closes on Escape pressed on the document', async () => {
        const wrapper = await openNonModal()

        pressEscape(document)
        await nextTick()

        expect(drawerEl().open).toBe(false)
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('closes on Escape from an element outside any dialog, and from inside the drawer itself', async () => {
        const outside = addOutside()
        await openNonModal()
        pressEscape(outside)
        await nextTick()
        expect(drawerEl().open).toBe(false)

        // Reopen and press Escape on a control inside the drawer: its closest <dialog> is this drawer.
        const wrapper = wrappers[0]!
        await wrapper.setProps({ open: true })
        await nextTick()
        expect(drawerEl().open).toBe(true)
        pressEscape(closeButton())
        await nextTick()
        expect(drawerEl().open).toBe(false)
    })

    it('ignores other keys', async () => {
        await openNonModal()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await nextTick()

        expect(drawerEl().open).toBe(true)
    })

    it('ignores an Escape that something else already handled (defaultPrevented)', async () => {
        const inner = addOutside()
        // A listener between the target and `document` that claims the key, as a menu or combobox would.
        const claim = (event: Event) => event.preventDefault()
        document.body.addEventListener('keydown', claim)
        await openNonModal()

        pressEscape(inner)
        await nextTick()
        expect(drawerEl().open).toBe(true)

        document.body.removeEventListener('keydown', claim)
        pressEscape(inner)
        await nextTick()
        expect(drawerEl().open).toBe(false)
    })

    it('ignores Escape when closeOnEscape is false', async () => {
        const wrapper = await openNonModal({ closeOnEscape: false })

        pressEscape(document)
        await nextTick()

        expect(drawerEl().open).toBe(true)
        expect(wrapper.emitted('update:open')).toBeUndefined()
    })

    it('starts and stops listening as closeOnEscape changes', async () => {
        const wrapper = await openNonModal({ closeOnEscape: false })

        await wrapper.setProps({ closeOnEscape: true })
        pressEscape(document)
        await nextTick()

        expect(drawerEl().open).toBe(false)
    })

    it('ignores an Escape that belongs to a different open <dialog>', async () => {
        await openNonModal()
        const other = document.createElement('dialog')
        other.setAttribute('open', '')
        const otherButton = document.createElement('button')
        other.append(otherButton)
        document.body.append(other)

        pressEscape(otherButton)
        await nextTick()
        expect(drawerEl().open).toBe(true)

        // The same key from the page (no dialog around the target) still closes the drawer.
        pressEscape(document.body)
        await nextTick()
        expect(drawerEl().open).toBe(false)
    })

    it('does nothing on Escape while closed', async () => {
        const wrapper = mountDrawer({ modal: false })
        await nextTick()

        pressEscape(document)
        await nextTick()

        expect(drawerEl().open).toBe(false)
        expect(wrapper.emitted('update:open')).toBeUndefined()
        expect(wrapper.emitted('close')).toBeUndefined()
    })

    it('removes its document listener on unmount', async () => {
        const wrapper = await openNonModal()
        const remove = vi.spyOn(document, 'removeEventListener')

        wrapper.unmount()

        expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function))
        expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function), true)
        wrappers.splice(wrappers.indexOf(wrapper), 1)
    })
})

describe('OriDrawer — non-modal outside press', () => {
    async function openNonModal(props: Props = {}) {
        const wrapper = mountDrawer({ modal: false, ...props })
        await nextTick()
        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()
        expect(drawerEl().open).toBe(true)
        return wrapper
    }

    it('closes on a pointerdown outside the drawer and its trigger', async () => {
        const outside = addOutside()
        const wrapper = await openNonModal()

        pointerDown(outside)
        await nextTick()

        expect(drawerEl().open).toBe(false)
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('does not close on a pointerdown inside the drawer', async () => {
        await openNonModal()

        pointerDown(drawerEl())
        pointerDown(document.querySelector('.ori-drawer__content') as HTMLElement)
        pointerDown(closeButton())
        await nextTick()

        expect(drawerEl().open).toBe(true)
    })

    it('does not dismiss on a pointerdown on the trigger, so the click can toggle it shut', async () => {
        const wrapper = await openNonModal()

        pointerDown(triggerEl())
        await nextTick()
        expect(drawerEl().open).toBe(true)

        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()
        expect(drawerEl().open).toBe(false)
        // One close, from the toggle — the pointerdown did not close it first.
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('does not dismiss on a pointerdown inside a child of the trigger', async () => {
        mountDrawer(
            { modal: false },
            {
                trigger: (scope: TriggerScope) =>
                    h('button', { ...scope.props, 'data-testid': 'trigger' }, [h('span', { id: 'trigger-icon' }, '☰')])
            }
        )
        await nextTick()
        triggerEl().click()
        await nextTick()
        expect(drawerEl().open).toBe(true)

        pointerDown(document.getElementById('trigger-icon') as HTMLElement)
        await nextTick()

        expect(drawerEl().open).toBe(true)
    })

    it('ignores an outside pointerdown when closeOnInteractOutside is false', async () => {
        const outside = addOutside()
        const wrapper = await openNonModal({ closeOnInteractOutside: false })

        pointerDown(outside)
        await nextTick()

        expect(drawerEl().open).toBe(true)
        expect(wrapper.emitted('close')).toBeUndefined()
    })

    it('stops listening once closed', async () => {
        const outside = addOutside()
        const wrapper = await openNonModal()

        closeButton().click()
        await nextTick()
        pointerDown(outside)
        await nextTick()

        expect(wrapper.emitted('close')).toHaveLength(1)
    })
})

describe('OriDrawer — non-modal focus', () => {
    it('moves focus to the first focusable element on open and returns it to the trigger on close', async () => {
        mountDrawer({ modal: false })
        await nextTick()

        triggerEl().focus()
        expect(document.activeElement).toBe(triggerEl())
        triggerEl().click()
        await nextTick()

        // The header's close button is the first focusable element in the drawer.
        expect(drawerEl().open).toBe(true)
        expect(document.activeElement).toBe(closeButton())

        closeButton().click()
        await nextTick()
        expect(drawerEl().open).toBe(false)
        expect(document.activeElement).toBe(triggerEl())
    })

    it('prefers an [autofocus] element over the first focusable one', async () => {
        mountDrawer(
            { modal: false },
            { default: () => h('input', { id: 'search', autofocus: true, 'aria-label': 'Search' }) }
        )
        await nextTick()

        triggerEl().focus()
        triggerEl().click()
        await nextTick()

        expect(document.activeElement).toBe(document.getElementById('search'))
    })

    it('focuses inside when opened with defaultOpen', async () => {
        mountDrawer({ modal: false, defaultOpen: true })
        await nextTick()

        expect(document.activeElement).toBe(closeButton())
    })

    it('returns focus to the previously focused element when closed from a controlled prop', async () => {
        const outside = addOutside()
        const wrapper = mountDrawer({ modal: false, open: false })
        await nextTick()

        outside.focus()
        await wrapper.setProps({ open: true })
        await nextTick()
        expect(document.activeElement).toBe(closeButton())

        await wrapper.setProps({ open: false })
        await nextTick()
        expect(document.activeElement).toBe(outside)
    })

    it('returns focus on an Escape close', async () => {
        const wrapper = mountDrawer({ modal: false })
        await nextTick()
        triggerEl().focus()
        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()
        expect(document.activeElement).toBe(closeButton())

        pressEscape(closeButton())
        await nextTick()

        expect(drawerEl().open).toBe(false)
        expect(document.activeElement).toBe(triggerEl())
    })

    it('leaves focus alone on close when it was already outside the drawer', async () => {
        const outside = addOutside()
        const wrapper = mountDrawer({ modal: false, open: false })
        await nextTick()
        triggerEl().focus()
        await wrapper.setProps({ open: true })
        await nextTick()

        // The user moved on to the page while the drawer stayed open.
        outside.focus()
        await wrapper.setProps({ open: false })
        await nextTick()

        expect(drawerEl().open).toBe(false)
        expect(document.activeElement).toBe(outside)
    })

    it('does not steal focus when a modal drawer opens (showModal() owns it natively)', async () => {
        const wrapper = mountDrawer()
        await nextTick()
        triggerEl().focus()

        await wrapper.find('[data-testid="trigger"]').trigger('click')
        await nextTick()

        expect(drawerEl().open).toBe(true)
        expect(document.activeElement).toBe(triggerEl())
    })
})

describe('OriDrawer — accessible name and description', () => {
    it('names a titleless drawer with a caller aria-label and renders no title node', () => {
        mountDrawer({ title: undefined, defaultOpen: true }, {}, { 'aria-label': 'Settings' })

        expect(drawerEl().getAttribute('aria-label')).toBe('Settings')
        expect(document.querySelector('.ori-drawer__title')).toBeNull()
    })

    // The shell merges the adapter's props AFTER the caller's attrs, so the adapter's `aria-labelledby`
    // (a dangling title id when there is no title) replaces the caller's — while the DEV warning counts the
    // caller's `aria-labelledby` as a name. The drawer ends up nameless.
    it("honors a caller's aria-labelledby on a titleless drawer", () => {
        const heading = document.createElement('h1')
        heading.id = 'page-heading'
        heading.textContent = 'Page'
        document.body.append(heading)
        mountDrawer({ title: undefined, defaultOpen: true }, {}, { 'aria-labelledby': 'page-heading' })

        expect(drawerEl().getAttribute('aria-labelledby')).toBe('page-heading')
    })

    // A drawer holds filters, navigation or a form: read out whole on open, it would drown the title (APG).
    it('is not described by its body', () => {
        mountDrawer({ defaultOpen: true }, { default: () => 'Narrow the list.' })

        expect(drawerEl().hasAttribute('aria-describedby')).toBe(false)
    })

    it("a caller's own aria-describedby wins", () => {
        mountDrawer({ defaultOpen: true }, { default: () => 'body' }, { 'aria-describedby': 'my-own-id' })

        expect(drawerEl().getAttribute('aria-describedby')).toBe('my-own-id')
    })

    describe('DEV warning', () => {
        // Silences console.warn and returns what was warned about this component.
        function spyOnWarnings() {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
            return () => warn.mock.calls.map((call) => String(call[0])).filter((text) => text.includes('[OriDrawer]'))
        }

        it('warns when opened with no accessible name', async () => {
            const warnings = spyOnWarnings()
            const wrapper = mountDrawer({ title: undefined })
            await nextTick()
            expect(warnings()).toHaveLength(0)

            await wrapper.find('[data-testid="trigger"]').trigger('click')
            await nextTick()

            expect(warnings()).toHaveLength(1)
            expect(warnings()[0]).toContain('accessible name')
        })

        it('warns for a drawer that is open from the start with no name', async () => {
            const warnings = spyOnWarnings()
            mountDrawer({ title: undefined, defaultOpen: true })
            await nextTick()

            expect(warnings()).toHaveLength(1)
        })

        it('stays quiet when the drawer is named by a title, a #title slot, aria-label or aria-labelledby', async () => {
            const warnings = spyOnWarnings()
            mountDrawer({ title: 'Filters', defaultOpen: true })
            mountDrawer({ title: undefined, defaultOpen: true }, { title: () => 'Slot' })
            mountDrawer({ title: undefined, defaultOpen: true }, {}, { 'aria-label': 'Settings' })
            mountDrawer({ title: undefined, defaultOpen: true }, {}, { 'aria-labelledby': 'elsewhere' })
            await nextTick()

            expect(warnings()).toHaveLength(0)
        })

        it('stays quiet while the drawer is closed', async () => {
            const warnings = spyOnWarnings()
            mountDrawer({ title: undefined })
            await nextTick()

            expect(warnings()).toHaveLength(0)
        })
    })
})

describe('OriDrawer — a11y', () => {
    it('has no axe violations while open and modal', async () => {
        mountDrawer(
            { title: 'Filters', defaultOpen: true },
            {
                default: () => 'Narrow the list by status.',
                footer: () => h('button', { type: 'button' }, 'Apply')
            }
        )
        await nextTick()

        expect(drawerEl().open).toBe(true)
        await expectNoA11yViolations(drawerEl())
    })

    it('has no axe violations while open and non-modal', async () => {
        mountDrawer(
            { title: 'Filters', modal: false, defaultOpen: true, side: 'start' },
            {
                default: () => 'Narrow the list by status.',
                footer: () => h('button', { type: 'button' }, 'Apply')
            }
        )
        await nextTick()

        expect(drawerEl().open).toBe(true)
        expect(drawerEl().getAttribute('popover')).toBe('manual')
        await expectNoA11yViolations(drawerEl())
    })

    it('has no axe violations when named by an aria-label instead of a title', async () => {
        mountDrawer({ title: undefined, defaultOpen: true }, { default: () => 'Body' }, { 'aria-label': 'Settings' })
        await nextTick()

        await expectNoA11yViolations(drawerEl())
    })

    it('has no axe violations with the trigger, closed', async () => {
        const wrapper = mountDrawer({ title: 'Filters' })
        await nextTick()

        await expectNoA11yViolations(wrapper.element.parentElement as HTMLElement)
    })
})
