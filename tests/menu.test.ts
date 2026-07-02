import { describe, it, expect } from 'vitest';
import { nextTick, h } from 'vue';
import { mount } from '@vue/test-utils';
import { OriMenu } from '../packages/vue/src';
import type { MenuItem } from '@oriui/headless/vue';
import { expectNoA11yViolations } from './helpers/axe';

// OriMenu is pure JS (no Popover API / CSS Anchor Positioning dependency) — the roving-tabindex
// WAI-ARIA menu-button pattern (open/close, Arrow/Home/End navigation, Enter/Space activate,
// Escape/outside-click close) lives in the @oriui/headless menu machine, and the SFC moves real DOM
// focus to the highlighted item. happy-dom supports focus() / document.activeElement fully, so this
// suite drives the whole interaction live (unlike OriPopover, which needs Playwright for that part).

const ITEMS: MenuItem[] = [
    { label: 'Edit', value: 'edit' },
    { label: 'Duplicate', value: 'duplicate' },
    { label: 'Delete', value: 'delete', disabled: true },
    { label: 'Archive', value: 'archive' }
];

type Props = Record<string, unknown>;

function mountMenu(props: Props = {}) {
    return mount(OriMenu, {
        props: { items: ITEMS, ...props },
        slots: {
            trigger: (scope: { props: Record<string, unknown> }) => h('button', { ...scope.props }, 'Actions')
        },
        attachTo: document.body
    });
}

describe('OriMenu', () => {
    // -------------------------------------------------------------------------
    // Closed by default
    // -------------------------------------------------------------------------

    it('starts closed: panel hidden, trigger aria-expanded=false', () => {
        const wrapper = mountMenu();
        const panel = wrapper.find('[role="menu"]');
        const trigger = wrapper.find('button');

        expect(panel.attributes('hidden')).toBeDefined();
        expect(trigger.attributes('aria-expanded')).toBe('false');
        wrapper.unmount();
    });

    it('wires aria-haspopup=menu and aria-controls === panel id on the trigger', () => {
        const wrapper = mountMenu();
        const trigger = wrapper.find('button');
        const panel = wrapper.find('[role="menu"]');

        expect(trigger.attributes('aria-haspopup')).toBe('menu');
        expect(trigger.attributes('aria-controls')).toBe(panel.attributes('id'));
        expect(panel.attributes('aria-labelledby')).toBe(trigger.attributes('id'));
        wrapper.unmount();
    });

    it('panel carries the anchored placement class (default bottom-start)', () => {
        const wrapper = mountMenu();
        const classes = wrapper.find('[role="menu"]').classes();

        expect(classes).toContain('ori-menu');
        expect(classes).toContain('ori-anchored');
        expect(classes).toContain('ori-anchored_bottom-start');
        wrapper.unmount();
    });

    it('every placement value maps to its own modifier class', () => {
        const placements = [
            'top',
            'top-start',
            'top-end',
            'bottom',
            'bottom-start',
            'bottom-end',
            'left',
            'left-start',
            'left-end',
            'right',
            'right-start',
            'right-end'
        ] as const;
        placements.forEach((placement) => {
            const wrapper = mountMenu({ placement });
            expect(wrapper.find('[role="menu"]').classes()).toContain(`ori-anchored_${placement}`);
            wrapper.unmount();
        });
    });

    // -------------------------------------------------------------------------
    // Items
    // -------------------------------------------------------------------------

    it('renders items with role=menuitem, ids, and default label content', () => {
        const wrapper = mountMenu();
        const items = wrapper.findAll('[role="menuitem"]');

        expect(items).toHaveLength(4);
        expect(items[0]!.text()).toBe('Edit');
        items.forEach((item) => expect(item.attributes('id')).toBeTruthy());
        wrapper.unmount();
    });

    it('marks a disabled item with aria-disabled=true', () => {
        const wrapper = mountMenu();
        const items = wrapper.findAll('[role="menuitem"]');

        expect(items[2]!.attributes('aria-disabled')).toBe('true');
        expect(items[0]!.attributes('aria-disabled')).toBeUndefined();
        wrapper.unmount();
    });

    it('supports the #item scoped slot to override content', () => {
        const wrapper = mount(OriMenu, {
            props: { items: ITEMS },
            slots: {
                trigger: (scope: { props: Record<string, unknown> }) => h('button', { ...scope.props }, 'Actions'),
                item: (scope: { item: MenuItem }) => h('span', `>> ${scope.item.value}`)
            },
            attachTo: document.body
        });

        expect(wrapper.findAll('[role="menuitem"]')[0]!.text()).toBe('>> edit');
        wrapper.unmount();
    });

    // -------------------------------------------------------------------------
    // Open / close via the trigger
    // -------------------------------------------------------------------------

    it('click on the trigger opens the menu', async () => {
        const wrapper = mountMenu();
        await wrapper.find('button').trigger('click');

        expect(wrapper.find('button').attributes('aria-expanded')).toBe('true');
        expect(wrapper.find('[role="menu"]').attributes('hidden')).toBeUndefined();
        wrapper.unmount();
    });

    it('click on the trigger again closes the menu', async () => {
        const wrapper = mountMenu();
        const trigger = wrapper.find('button');
        await trigger.trigger('click');
        await trigger.trigger('click');

        expect(trigger.attributes('aria-expanded')).toBe('false');
        expect(wrapper.find('[role="menu"]').attributes('hidden')).toBeDefined();
        wrapper.unmount();
    });

    it('ArrowDown on the trigger opens the menu and highlights the first enabled item', async () => {
        const wrapper = mountMenu();
        await wrapper.find('button').trigger('keydown', { key: 'ArrowDown' });
        await nextTick();

        const trigger = wrapper.find('button');
        expect(trigger.attributes('aria-expanded')).toBe('true');

        const first = wrapper.findAll('[role="menuitem"]')[0]!;
        expect(first.attributes('data-highlighted')).toBeDefined();
        expect(first.attributes('tabindex')).toBe('0');
        expect(document.activeElement).toBe(first.element);
        wrapper.unmount();
    });

    it('ArrowUp on the trigger opens the menu and highlights the last enabled item', async () => {
        const wrapper = mountMenu();
        await wrapper.find('button').trigger('keydown', { key: 'ArrowUp' });
        await nextTick();

        // Last item (Archive) is enabled; Delete (index 2) is disabled and must be skipped.
        const items = wrapper.findAll('[role="menuitem"]');
        const last = items[3]!;
        expect(last.attributes('data-highlighted')).toBeDefined();
        expect(document.activeElement).toBe(last.element);
        wrapper.unmount();
    });

    it('disabled prop blocks the trigger and prevents opening', async () => {
        const wrapper = mountMenu({ disabled: true });
        const trigger = wrapper.find('button');

        expect((trigger.element as HTMLButtonElement).disabled).toBe(true);
        wrapper.unmount();
    });

    // -------------------------------------------------------------------------
    // Roving tabindex + keyboard navigation inside the panel
    // -------------------------------------------------------------------------

    it('roving tabindex: only the highlighted item is tabbable (tabindex=0), the rest are -1', async () => {
        const wrapper = mountMenu();
        await wrapper.find('button').trigger('keydown', { key: 'ArrowDown' });
        await nextTick();

        const items = wrapper.findAll('[role="menuitem"]');
        expect(items[0]!.attributes('tabindex')).toBe('0');
        items.slice(1).forEach((item) => expect(item.attributes('tabindex')).toBe('-1'));
        wrapper.unmount();
    });

    it('ArrowDown inside the panel moves the highlight to the next enabled item, skipping disabled', async () => {
        const wrapper = mountMenu();
        const trigger = wrapper.find('button');
        await trigger.trigger('click'); // open, nothing highlighted yet
        await nextTick();

        const panel = wrapper.find('[role="menu"]');
        await panel.trigger('keydown', { key: 'ArrowDown' }); // Edit
        await nextTick();
        await panel.trigger('keydown', { key: 'ArrowDown' }); // Duplicate
        await nextTick();
        await panel.trigger('keydown', { key: 'ArrowDown' }); // Archive (skips disabled Delete)
        await nextTick();

        const archive = wrapper.findAll('[role="menuitem"]')[3]!;
        expect(archive.attributes('data-highlighted')).toBeDefined();
        expect(document.activeElement).toBe(archive.element);
        wrapper.unmount();
    });

    it('ArrowUp inside the panel moves the highlight to the previous enabled item', async () => {
        const wrapper = mountMenu();
        const trigger = wrapper.find('button');
        await trigger.trigger('click');
        await nextTick();

        const panel = wrapper.find('[role="menu"]');
        await panel.trigger('keydown', { key: 'End' }); // Archive
        await nextTick();
        await panel.trigger('keydown', { key: 'ArrowUp' }); // Duplicate (skips disabled Delete going up)
        await nextTick();

        const duplicate = wrapper.findAll('[role="menuitem"]')[1]!;
        expect(duplicate.attributes('data-highlighted')).toBeDefined();
        expect(document.activeElement).toBe(duplicate.element);
        wrapper.unmount();
    });

    it('Home / End jump to the first / last enabled item', async () => {
        const wrapper = mountMenu();
        const trigger = wrapper.find('button');
        await trigger.trigger('click');
        await nextTick();

        const panel = wrapper.find('[role="menu"]');
        const items = wrapper.findAll('[role="menuitem"]');

        await panel.trigger('keydown', { key: 'End' });
        await nextTick();
        expect(items[3]!.attributes('data-highlighted')).toBeDefined();
        expect(document.activeElement).toBe(items[3]!.element);

        await panel.trigger('keydown', { key: 'Home' });
        await nextTick();
        expect(items[0]!.attributes('data-highlighted')).toBeDefined();
        expect(document.activeElement).toBe(items[0]!.element);
        wrapper.unmount();
    });

    // -------------------------------------------------------------------------
    // Activation (select) + close + focus return
    // -------------------------------------------------------------------------

    it('Enter on the highlighted item emits select, closes the menu, and returns focus to the trigger', async () => {
        const wrapper = mountMenu();
        const trigger = wrapper.find('button');
        await trigger.trigger('keydown', { key: 'ArrowDown' }); // opens + highlights Edit
        await nextTick();

        const panel = wrapper.find('[role="menu"]');
        await panel.trigger('keydown', { key: 'Enter' });
        await nextTick();

        expect(wrapper.emitted('select')).toEqual([['edit']]);
        expect(trigger.attributes('aria-expanded')).toBe('false');
        expect(wrapper.find('[role="menu"]').attributes('hidden')).toBeDefined();
        expect(document.activeElement).toBe(trigger.element);
        wrapper.unmount();
    });

    it('Space on the highlighted item also activates it', async () => {
        const wrapper = mountMenu();
        await wrapper.find('button').trigger('keydown', { key: 'ArrowDown' });
        await nextTick();

        await wrapper.find('[role="menu"]').trigger('keydown', { key: ' ' });
        await nextTick();

        expect(wrapper.emitted('select')).toEqual([['edit']]);
        wrapper.unmount();
    });

    it('clicking an item activates it directly', async () => {
        const wrapper = mountMenu();
        await wrapper.find('button').trigger('click');
        await nextTick();

        await wrapper.findAll('[role="menuitem"]')[1]!.trigger('click'); // Duplicate
        await nextTick();

        expect(wrapper.emitted('select')).toEqual([['duplicate']]);
        expect(wrapper.find('button').attributes('aria-expanded')).toBe('false');
        wrapper.unmount();
    });

    it('clicking a disabled item does not activate it or close the menu', async () => {
        const wrapper = mountMenu();
        await wrapper.find('button').trigger('click');
        await nextTick();

        await wrapper.findAll('[role="menuitem"]')[2]!.trigger('click'); // Delete (disabled)
        await nextTick();

        expect(wrapper.emitted('select')).toBeFalsy();
        expect(wrapper.find('button').attributes('aria-expanded')).toBe('true');
        wrapper.unmount();
    });

    // -------------------------------------------------------------------------
    // Escape
    // -------------------------------------------------------------------------

    it('Escape closes the menu and returns focus to the trigger', async () => {
        const wrapper = mountMenu();
        const trigger = wrapper.find('button');
        await trigger.trigger('click');
        await nextTick();
        expect(trigger.attributes('aria-expanded')).toBe('true');

        await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Escape' });
        await nextTick();

        expect(trigger.attributes('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(trigger.element);
        wrapper.unmount();
    });

    // -------------------------------------------------------------------------
    // Outside click
    // -------------------------------------------------------------------------

    it('a pointerdown outside the menu closes it', async () => {
        const wrapper = mountMenu();
        await wrapper.find('button').trigger('click');
        await nextTick();
        expect(wrapper.find('button').attributes('aria-expanded')).toBe('true');

        document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await nextTick();

        expect(wrapper.find('button').attributes('aria-expanded')).toBe('false');
        wrapper.unmount();
    });

    // -------------------------------------------------------------------------
    // Axe
    // -------------------------------------------------------------------------

    it('has no axe violations when open (trigger has an accessible name, panel is aria-labelledby it)', async () => {
        const wrapper = mountMenu();
        await wrapper.find('button').trigger('click');
        await nextTick();

        await expectNoA11yViolations(wrapper.element as HTMLElement);
        wrapper.unmount();
    });

    it('has no axe violations when closed', async () => {
        const wrapper = mountMenu();
        await expectNoA11yViolations(wrapper.element as HTMLElement);
        wrapper.unmount();
    });
});
