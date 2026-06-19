import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriTooltip } from '../src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriTooltip', () => {
    // -------------------------------------------------------------------------
    // Default rendering
    // -------------------------------------------------------------------------

    it('renders the wrapper with the ori-tooltip class', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Info' } });

        expect(wrapper.classes()).toContain('ori-tooltip');
    });

    it('renders a trigger element and a bubble element', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Info' } });

        expect(wrapper.find('.ori-tooltip__trigger').exists()).toBe(true);
        expect(wrapper.find('.ori-tooltip__bubble').exists()).toBe(true);
    });

    it('bubble has role="tooltip"', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Tooltip text' } });

        expect(wrapper.find('.ori-tooltip__bubble').attributes('role')).toBe('tooltip');
    });

    it('renders the content prop as bubble text', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Helpful hint' } });

        expect(wrapper.find('.ori-tooltip__bubble').text()).toBe('Helpful hint');
    });

    // -------------------------------------------------------------------------
    // aria-describedby association
    // -------------------------------------------------------------------------

    it('trigger carries aria-describedby referencing the bubble id', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Info' } });
        const trigger = wrapper.find('.ori-tooltip__trigger');
        const bubble = wrapper.find('.ori-tooltip__bubble');

        const bubbleId = bubble.attributes('id');
        expect(bubbleId).toBeTruthy();
        expect(trigger.attributes('aria-describedby')).toBe(bubbleId);
    });

    it('bubble id is stable (always in the DOM — no dangling reference)', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Stable' } });
        const bubble = wrapper.find('.ori-tooltip__bubble');

        // The bubble must always exist in the DOM (not v-if) so aria-describedby never dangles.
        expect(bubble.exists()).toBe(true);
        expect(bubble.attributes('id')).toBeTruthy();
    });

    // -------------------------------------------------------------------------
    // Placement modifier classes
    // -------------------------------------------------------------------------

    it('defaults to placement="top" — bubble carries ori-tooltip__bubble_top', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Info' } });

        expect(wrapper.find('.ori-tooltip__bubble').classes()).toContain('ori-tooltip__bubble_top');
    });

    it('placement="bottom" adds the correct modifier', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Info', placement: 'bottom' } });

        expect(wrapper.find('.ori-tooltip__bubble').classes()).toContain('ori-tooltip__bubble_bottom');
        expect(wrapper.find('.ori-tooltip__bubble').classes()).not.toContain('ori-tooltip__bubble_top');
    });

    it('placement="left" adds the correct modifier', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Info', placement: 'left' } });

        expect(wrapper.find('.ori-tooltip__bubble').classes()).toContain('ori-tooltip__bubble_left');
    });

    it('placement="right" adds the correct modifier', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Info', placement: 'right' } });

        expect(wrapper.find('.ori-tooltip__bubble').classes()).toContain('ori-tooltip__bubble_right');
    });

    it('bubble carries only one placement modifier at a time', () => {
        const placements = ['top', 'bottom', 'left', 'right'] as const;
        placements.forEach((p) => {
            const wrapper = mount(OriTooltip, { props: { content: 'x', placement: p } });
            const classes = wrapper.find('.ori-tooltip__bubble').classes();
            const placementClasses = placements.map((pl) => `ori-tooltip__bubble_${pl}`);

            expect(classes.filter((c) => placementClasses.includes(c))).toHaveLength(1);
        });
    });

    // -------------------------------------------------------------------------
    // Color prop — ori-color utility classes
    // -------------------------------------------------------------------------

    it('color prop adds ori-color and ori-color_<color> classes to the wrapper', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Info', color: 'primary' } });
        const classes = wrapper.classes();

        expect(classes).toContain('ori-color');
        expect(classes).toContain('ori-color_primary');
    });

    it('without a color prop the wrapper carries neither ori-color nor ori-color_* class', () => {
        const wrapper = mount(OriTooltip, { props: { content: 'Info' } });
        const classes = wrapper.classes();

        expect(classes).not.toContain('ori-color');
        expect(classes.some((c) => c.startsWith('ori-color_'))).toBe(false);
    });

    it('different color values produce the correct class', () => {
        const colors = ['primary', 'danger', 'success', 'warn', 'info'] as const;
        colors.forEach((color) => {
            const wrapper = mount(OriTooltip, { props: { content: 'x', color } });
            expect(wrapper.classes()).toContain(`ori-color_${color}`);
        });
    });

    // -------------------------------------------------------------------------
    // Slots
    // -------------------------------------------------------------------------

    it('default slot renders the trigger content', () => {
        const wrapper = mount(OriTooltip, {
            props: { content: 'Info' },
            slots: { default: '<button type="button">Hover me</button>' }
        });

        expect(wrapper.find('.ori-tooltip__trigger button').text()).toBe('Hover me');
    });

    it('#content slot takes precedence over the content prop', () => {
        const wrapper = mount(OriTooltip, {
            props: { content: 'Plain text fallback' },
            slots: { content: '<strong>Rich content</strong>' }
        });
        const bubble = wrapper.find('.ori-tooltip__bubble');

        expect(bubble.find('strong').exists()).toBe(true);
        expect(bubble.text()).toBe('Rich content');
    });

    it('#content slot renders arbitrary markup inside the bubble', () => {
        const wrapper = mount(OriTooltip, {
            slots: { content: '<em>Emphasized</em><span> extra</span>' }
        });
        const bubble = wrapper.find('.ori-tooltip__bubble');

        expect(bubble.find('em').exists()).toBe(true);
        expect(bubble.text()).toContain('Emphasized');
    });

    // -------------------------------------------------------------------------
    // Axe a11y checks
    // -------------------------------------------------------------------------

    it('has no axe violations with a plain content prop', async () => {
        const wrapper = mount(OriTooltip, {
            props: { content: 'More information' },
            slots: { default: '<button type="button">Info</button>' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations with the content slot', async () => {
        const wrapper = mount(OriTooltip, {
            slots: {
                default: '<button type="button">Details</button>',
                content: '<span>Rich <em>tooltip</em> text</span>'
            },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations with a color prop', async () => {
        const wrapper = mount(OriTooltip, {
            props: { content: 'Colored tooltip', color: 'primary' },
            slots: { default: '<button type="button">Trigger</button>' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
