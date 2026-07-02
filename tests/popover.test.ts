import { describe, it, expect } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { OriPopover } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

type Props = Record<string, unknown>;
type Slots = Record<string, unknown>;

// OriPopover is zero-JS: the trigger opens the panel via the platform Popover API and CSS Anchor
// Positioning. happy-dom implements neither (no showPopover()/:popover-open, no anchor layout), so
// these tests assert only what's actually in the DOM — the popover/role attributes, the
// trigger<->panel id and anchor-name wiring, and the placement/role prop-to-class/attr mapping.
// Live open/close + real positioning need Playwright and are out of scope here.
function mountPopover(props: Props = {}, slots: Slots = {}) {
    return mount(OriPopover, {
        props,
        slots: {
            trigger: (scope: { props: Record<string, unknown> }) =>
                h('button', { ...scope.props, type: 'button', 'data-testid': 'trigger' }, 'Open'),
            default: 'Panel content',
            ...slots
        },
        attachTo: document.body
    });
}

describe('OriPopover', () => {
    // -------------------------------------------------------------------------
    // Panel rendering
    // -------------------------------------------------------------------------

    it('renders the panel with the popover attribute and default role="dialog"', () => {
        const wrapper = mountPopover();
        const panel = wrapper.find('.ori-popover');

        expect(panel.exists()).toBe(true);
        expect(panel.attributes('popover')).toBe('');
        expect(panel.attributes('role')).toBe('dialog');
    });

    it('panel carries the ori-popover class plus the default placement modifier', () => {
        const wrapper = mountPopover();
        const classes = wrapper.find('.ori-popover').classes();

        expect(classes).toContain('ori-popover');
        expect(classes).toContain('ori-anchored');
        expect(classes).toContain('ori-anchored_bottom-start');
    });

    it('projects the default slot as the panel content', () => {
        const wrapper = mountPopover({}, { default: 'Hello from the panel' });

        expect(wrapper.find('.ori-popover').text()).toBe('Hello from the panel');
    });

    it('projects the trigger scoped slot', () => {
        const wrapper = mountPopover();

        expect(wrapper.find('[data-testid="trigger"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="trigger"]').text()).toBe('Open');
    });

    // -------------------------------------------------------------------------
    // Trigger <-> panel wiring
    // -------------------------------------------------------------------------

    it('links the trigger to the panel via popovertarget/aria-controls === panel id', () => {
        const wrapper = mountPopover();
        const trigger = wrapper.find('[data-testid="trigger"]');
        const panel = wrapper.find('.ori-popover');

        const panelId = panel.attributes('id');
        expect(panelId).toBeTruthy();
        expect(trigger.attributes('popovertarget')).toBe(panelId);
        expect(trigger.attributes('aria-controls')).toBe(panelId);
    });

    it('sets aria-haspopup on the trigger to mirror the panel role', () => {
        const wrapper = mountPopover();
        const trigger = wrapper.find('[data-testid="trigger"]');

        expect(trigger.attributes('aria-haspopup')).toBe('dialog');
    });

    it('pairs the trigger anchor-name with the panel --ori-anchor custom property, per instance', () => {
        const wrapper = mountPopover();
        const trigger = wrapper.find('[data-testid="trigger"]').element as HTMLElement;
        const panel = wrapper.find('.ori-popover').element as HTMLElement;

        // happy-dom doesn't serialize the (unsupported) `anchor-name` CSS property into
        // style.cssText/getPropertyValue, but Vue's object style binding still sets it as a JS
        // property on the CSSStyleDeclaration — read it directly.
        const anchorName = (trigger.style as unknown as Record<string, string>).anchorName;
        const anchorVar = panel.style.getPropertyValue('--ori-anchor');

        expect(anchorName).toBeTruthy();
        expect(anchorName).toMatch(/^--ori-popover-/);
        expect(anchorName).toBe(anchorVar);
    });

    it('gives two instances distinct ids and anchor names (no collision)', () => {
        // useId() is scoped per Vue app instance, so two independent mount() calls would each start
        // their counter at v-0 and collide — that's expected Vue behavior, not a bug in the
        // component. To prove real uniqueness, mount two OriPopovers inside the *same* app.
        const wrapper = mount(
            {
                components: { OriPopover },
                template: `
                    <OriPopover>
                        <template #trigger="{ props }"><button v-bind="props" data-testid="t1" type="button">Open 1</button></template>
                        Panel 1
                    </OriPopover>
                    <OriPopover>
                        <template #trigger="{ props }"><button v-bind="props" data-testid="t2" type="button">Open 2</button></template>
                        Panel 2
                    </OriPopover>
                `
            },
            { attachTo: document.body }
        );

        const panels = wrapper.findAll('.ori-popover');
        expect(panels).toHaveLength(2);

        const firstPanelId = panels[0]!.attributes('id');
        const secondPanelId = panels[1]!.attributes('id');
        expect(firstPanelId).toBeTruthy();
        expect(secondPanelId).toBeTruthy();
        expect(firstPanelId).not.toBe(secondPanelId);

        const firstAnchor = (
            (wrapper.find('[data-testid="t1"]').element as HTMLElement).style as unknown as Record<string, string>
        ).anchorName;
        const secondAnchor = (
            (wrapper.find('[data-testid="t2"]').element as HTMLElement).style as unknown as Record<string, string>
        ).anchorName;
        expect(firstAnchor).toBeTruthy();
        expect(firstAnchor).not.toBe(secondAnchor);

        wrapper.unmount();
    });

    // -------------------------------------------------------------------------
    // placement prop
    // -------------------------------------------------------------------------

    it('placement prop drives the panel modifier class', () => {
        const wrapper = mountPopover({ placement: 'top' });
        const classes = wrapper.find('.ori-popover').classes();

        expect(classes).toContain('ori-anchored_top');
        expect(classes).not.toContain('ori-anchored_bottom');
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
            const wrapper = mountPopover({ placement });
            expect(wrapper.find('.ori-popover').classes()).toContain(`ori-anchored_${placement}`);
        });
    });

    // -------------------------------------------------------------------------
    // role prop
    // -------------------------------------------------------------------------

    it('role prop overrides the panel role and the trigger aria-haspopup together', () => {
        const wrapper = mountPopover({ role: 'menu' });

        expect(wrapper.find('.ori-popover').attributes('role')).toBe('menu');
        expect(wrapper.find('[data-testid="trigger"]').attributes('aria-haspopup')).toBe('menu');
    });

    // -------------------------------------------------------------------------
    // Attribute passthrough
    // -------------------------------------------------------------------------

    it('falls through aria-label onto the panel (inheritAttrs: false)', () => {
        const wrapper = mountPopover({ 'aria-label': 'Details' });

        expect(wrapper.find('.ori-popover').attributes('aria-label')).toBe('Details');
    });

    it('falls through arbitrary data-* attributes onto the panel', () => {
        const wrapper = mountPopover({ 'data-testid': 'my-panel' });

        expect(wrapper.find('.ori-popover').attributes('data-testid')).toBe('my-panel');
    });

    // -------------------------------------------------------------------------
    // Axe a11y checks
    // -------------------------------------------------------------------------

    it('has no axe violations (role="dialog" panel with an accessible name)', async () => {
        const wrapper = mountPopover({ 'aria-label': 'More information' });
        await expectNoA11yViolations(wrapper.element as HTMLElement);
        wrapper.unmount();
    });
});
