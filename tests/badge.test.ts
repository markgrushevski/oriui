import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriBadge } from '../packages/vue/src/components/badge';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriBadge', () => {
    // -------------------------------------------------------------------------
    // Default rendering (standalone, no slot)
    // -------------------------------------------------------------------------

    it('renders default token classes on the root badge element', () => {
        const wrapper = mount(OriBadge);
        const c = wrapper.classes();

        expect(c).toContain('ori-badge');
        expect(c).toContain('ori-variant_fill');
        expect(c).toContain('ori-color_primary');
        expect(c).toContain('ori-size-radius_rounded');
    });

    it('is a <span> in standalone mode (no slot)', () => {
        const wrapper = mount(OriBadge);
        expect(wrapper.element.tagName).toBe('SPAN');
        expect(wrapper.classes()).toContain('ori-badge');
    });

    // -------------------------------------------------------------------------
    // Floating (slot) mode
    // -------------------------------------------------------------------------

    it('wraps slotted content in an ori-badge-anchor span', () => {
        const wrapper = mount(OriBadge, {
            slots: { default: '<button>Inbox</button>' }
        });

        expect(wrapper.element.tagName).toBe('SPAN');
        expect(wrapper.classes()).toContain('ori-badge-anchor');
        expect(wrapper.find('.ori-badge').exists()).toBe(true);
        expect(wrapper.find('button').text()).toBe('Inbox');
    });

    it('adds ori-badge_floating modifier only when floating prop is set', () => {
        const withFloat = mount(OriBadge, {
            props: { floating: true },
            slots: { default: '<span>A</span>' }
        });
        const withoutFloat = mount(OriBadge, {
            props: { floating: false },
            slots: { default: '<span>A</span>' }
        });

        expect(withFloat.find('.ori-badge').classes()).toContain('ori-badge_floating');
        expect(withoutFloat.find('.ori-badge').classes()).not.toContain('ori-badge_floating');
    });

    it('floating modifier is absent in standalone mode (no slot)', () => {
        const wrapper = mount(OriBadge, { props: { floating: true } });
        // standalone branch has no ori-badge_floating class
        expect(wrapper.classes()).not.toContain('ori-badge_floating');
    });

    // -------------------------------------------------------------------------
    // Prop → class mapping
    // -------------------------------------------------------------------------

    it('maps variant prop to class', () => {
        const wrapper = mount(OriBadge, { props: { variant: 'outline' } });
        expect(wrapper.classes()).toContain('ori-variant_outline');
    });

    it('maps color prop to class', () => {
        const wrapper = mount(OriBadge, { props: { color: 'success' } });
        expect(wrapper.classes()).toContain('ori-color_success');
    });

    it('maps radius prop to class', () => {
        const wrapper = mount(OriBadge, { props: { radius: 'sm' } });
        expect(wrapper.classes()).toContain('ori-size-radius_sm');
    });

    it('maps all visual props together in standalone mode', () => {
        const wrapper = mount(OriBadge, {
            props: { variant: 'tonal', color: 'danger', radius: 'xl' }
        });
        const c = wrapper.classes();

        expect(c).toContain('ori-variant_tonal');
        expect(c).toContain('ori-color_danger');
        expect(c).toContain('ori-size-radius_xl');
    });

    it('maps all visual props together in floating mode', () => {
        const wrapper = mount(OriBadge, {
            props: { variant: 'tonal', color: 'warn', radius: 'zero', floating: true },
            slots: { default: '<span>X</span>' }
        });
        const badge = wrapper.find('.ori-badge');
        const c = badge.classes();

        expect(c).toContain('ori-variant_tonal');
        expect(c).toContain('ori-color_warn');
        expect(c).toContain('ori-size-radius_zero');
    });

    // -------------------------------------------------------------------------
    // Dot mode
    // -------------------------------------------------------------------------

    it('adds ori-badge_dot class and suppresses content when dot=true', () => {
        const wrapper = mount(OriBadge, { props: { dot: true, content: 99 } });

        expect(wrapper.classes()).toContain('ori-badge_dot');
        // dot suppresses text rendering
        expect(wrapper.text()).toBe('');
    });

    it('dot badge is decorative (aria-hidden=true) when no label', () => {
        const wrapper = mount(OriBadge, { props: { dot: true } });

        expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('dot badge with a label is NOT decorative', () => {
        const wrapper = mount(OriBadge, { props: { dot: true, label: 'Notifications' } });

        expect(wrapper.attributes('aria-hidden')).toBeUndefined();
        expect(wrapper.attributes('aria-label')).toBe('Notifications');
    });

    // -------------------------------------------------------------------------
    // Content and max cap
    // -------------------------------------------------------------------------

    it('renders content as text', () => {
        const wrapper = mount(OriBadge, { props: { content: 7 } });
        expect(wrapper.text()).toBe('7');
    });

    it('renders string content as-is', () => {
        const wrapper = mount(OriBadge, { props: { content: 'NEW' } });
        expect(wrapper.text()).toBe('NEW');
    });

    it('caps numeric content at max and appends "+"', () => {
        const wrapper = mount(OriBadge, { props: { content: 150, max: 99 } });
        expect(wrapper.text()).toBe('99+');
    });

    it('does not cap when content <= max', () => {
        const wrapper = mount(OriBadge, { props: { content: 50, max: 99 } });
        expect(wrapper.text()).toBe('50');
    });

    it('does not cap string content even when max is set', () => {
        const wrapper = mount(OriBadge, { props: { content: '150', max: 99 } });
        // string content bypasses the numeric cap
        expect(wrapper.text()).toBe('150');
    });

    it('renders no text when content is absent', () => {
        const wrapper = mount(OriBadge);
        expect(wrapper.text()).toBe('');
    });

    // -------------------------------------------------------------------------
    // #content slot
    // -------------------------------------------------------------------------

    it('renders the #content slot as custom badge content', () => {
        const wrapper = mount(OriBadge, {
            slots: { content: '<i class="star">*</i>' }
        });

        expect(wrapper.find('.star').exists()).toBe(true);
        expect(wrapper.text()).toBe('*');
    });

    it('falls back to the value when no #content slot is provided', () => {
        const wrapper = mount(OriBadge, { props: { content: 7 } });
        expect(wrapper.text()).toBe('7');
    });

    it('a badge with a #content slot and no content/label is NOT aria-hidden', () => {
        const wrapper = mount(OriBadge, {
            slots: { content: '<i class="star">*</i>' }
        });

        expect(wrapper.attributes('aria-hidden')).toBeUndefined();
    });

    // -------------------------------------------------------------------------
    // Accessible name (label) and aria-hidden (decorative)
    // -------------------------------------------------------------------------

    it('sets aria-label when label prop is provided', () => {
        const wrapper = mount(OriBadge, { props: { label: '3 unread', content: 3 } });

        expect(wrapper.attributes('aria-label')).toBe('3 unread');
        expect(wrapper.attributes('aria-hidden')).toBeUndefined();
    });

    it('a badge with visible content and no label is NOT aria-hidden', () => {
        const wrapper = mount(OriBadge, { props: { content: 5 } });

        expect(wrapper.attributes('aria-hidden')).toBeUndefined();
    });

    it('an empty badge with no label is decorative (aria-hidden=true)', () => {
        const wrapper = mount(OriBadge);

        expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('a badge with empty-string content and no label is decorative', () => {
        const wrapper = mount(OriBadge, { props: { content: '' } });

        expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('label is exposed on the inner badge in floating mode too', () => {
        const wrapper = mount(OriBadge, {
            props: { content: 4, label: '4 alerts' },
            slots: { default: '<button>Bell</button>' }
        });
        const badge = wrapper.find('.ori-badge');

        expect(badge.attributes('aria-label')).toBe('4 alerts');
        expect(badge.attributes('aria-hidden')).toBeUndefined();
    });

    // -------------------------------------------------------------------------
    // Attr passthrough (inheritAttrs: false → v-bind="$attrs" on badge element)
    // -------------------------------------------------------------------------

    it('passes through data-* attrs to the badge element in standalone mode', () => {
        const wrapper = mount(OriBadge, {
            attrs: { 'data-testid': 'my-badge', id: 'badge-1' }
        });

        expect(wrapper.attributes('data-testid')).toBe('my-badge');
        expect(wrapper.attributes('id')).toBe('badge-1');
    });

    it('passes through attrs to the inner badge element in floating mode (not the anchor)', () => {
        const wrapper = mount(OriBadge, {
            attrs: { 'data-testid': 'inner' },
            slots: { default: '<span>X</span>' }
        });

        // the anchor wrapper should NOT have the attr
        expect(wrapper.attributes('data-testid')).toBeUndefined();
        // the inner badge should have it
        expect(wrapper.find('.ori-badge').attributes('data-testid')).toBe('inner');
    });

    // -------------------------------------------------------------------------
    // Axe a11y checks
    // -------------------------------------------------------------------------

    it('has no axe violations — standalone with label and content', async () => {
        const wrapper = mount(OriBadge, {
            props: { content: 3, label: '3 notifications' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations — decorative dot (aria-hidden)', async () => {
        const wrapper = mount(OriBadge, {
            props: { dot: true },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations — floating mode with labeled badge', async () => {
        const wrapper = mount(OriBadge, {
            props: { content: 5, label: '5 items', floating: true },
            slots: { default: '<button type="button">Inbox</button>' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
