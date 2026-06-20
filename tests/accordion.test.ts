import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriAccordion } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

const ITEMS = [
    { value: 'a', title: 'Section A' },
    { value: 'b', title: 'Section B' },
    { value: 'c', title: 'Section C', disabled: true }
];

describe('OriAccordion', () => {
    it('renders the wrapper with the default token classes', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });

        expect(wrapper.classes()).toContain('ori-accordion');
        expect(wrapper.classes()).toContain('ori-color_primary');
    });

    it('renders one <details> per item with the correct classes', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });
        const details = wrapper.findAll('details');

        expect(details).toHaveLength(3);
        details.forEach((d) => expect(d.classes()).toContain('ori-accordion__item'));
    });

    it('renders a <summary> trigger with the title text per item', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });
        const summaries = wrapper.findAll('summary');

        expect(summaries).toHaveLength(3);
        summaries.forEach((s) => expect(s.classes()).toContain('ori-accordion__trigger'));

        expect(wrapper.findAll('.ori-accordion__title')[0].text()).toBe('Section A');
        expect(wrapper.findAll('.ori-accordion__title')[1].text()).toBe('Section B');
        expect(wrapper.findAll('.ori-accordion__title')[2].text()).toBe('Section C');
    });

    it('chevron SVG is decorative (aria-hidden) and carries the correct class', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });
        const icons = wrapper.findAll('.ori-accordion__icon');

        expect(icons).toHaveLength(3);
        icons.forEach((svg) => {
            expect(svg.attributes('aria-hidden')).toBe('true');
        });
    });

    it('renders a panel wrapper per item', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });

        expect(wrapper.findAll('.ori-accordion__panel')).toHaveLength(3);
    });

    // ----- exclusive / multiple mode -----

    it('in single-open mode (default) all <details> share a single name attribute', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });
        const names = wrapper.findAll('details').map((d) => d.attributes('name'));

        // every name is the same non-empty string
        expect(names[0]).toBeTruthy();
        expect(new Set(names).size).toBe(1);
    });

    it('in multiple mode no <details> carries a name attribute', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS, multiple: true } });

        wrapper.findAll('details').forEach((d) => {
            expect(d.attributes('name')).toBeUndefined();
        });
    });

    // ----- disabled state -----

    it('a disabled item gets aria-disabled="true" on its summary trigger', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });
        const summaries = wrapper.findAll('summary');

        // first two are not disabled
        expect(summaries[0].attributes('aria-disabled')).toBeUndefined();
        expect(summaries[1].attributes('aria-disabled')).toBeUndefined();
        // third is disabled
        expect(summaries[2].attributes('aria-disabled')).toBe('true');
    });

    it('a disabled item has tabindex="-1" on its summary trigger', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });
        const summaries = wrapper.findAll('summary');

        expect(summaries[0].attributes('tabindex')).toBeUndefined();
        expect(summaries[2].attributes('tabindex')).toBe('-1');
    });

    it('enabled items carry no aria-disabled or tabindex override', () => {
        const wrapper = mount(OriAccordion, {
            props: { items: [{ value: 'x', title: 'X' }] }
        });
        const summary = wrapper.find('summary');

        expect(summary.attributes('aria-disabled')).toBeUndefined();
        expect(summary.attributes('tabindex')).toBeUndefined();
    });

    // ----- color prop -----

    it('maps the color prop to the ori-color_<color> class', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS, color: 'success' } });

        expect(wrapper.classes()).toContain('ori-color_success');
        expect(wrapper.classes()).not.toContain('ori-color_primary');
    });

    // ----- radius prop -----

    it('adds the radius value class when the radius prop is set', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS, radius: 'lg' } });

        expect(wrapper.classes()).toContain('ori-size-radius_lg');
    });

    it('applies the default md radius value class when the radius prop is absent', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });

        // radius defaults to 'md'; the single-class utility repoints --ori-size-radius on its own
        // (the bare block also bakes the md default, so corners are never square).
        expect(wrapper.classes()).toContain('ori-size-radius_md');
    });

    // ----- scoped default slot -----

    it('exposes a scoped default slot that receives the current item', () => {
        const wrapper = mount(OriAccordion, {
            props: { items: [{ value: 'a', title: 'Alpha' }] },
            slots: {
                default: `<template #default="{ item }"><p class="slot-content">{{ item.title }}</p></template>`
            }
        });

        expect(wrapper.find('.slot-content').text()).toBe('Alpha');
    });

    // ----- native disclosure semantics -----

    it('<details> is closed by default (no open attribute)', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });

        wrapper.findAll('details').forEach((d) => {
            expect((d.element as HTMLDetailsElement).open).toBe(false);
        });
    });

    it('the tag is a native <details> element (browser manages disclosure role)', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });

        wrapper.findAll('details').forEach((d) => {
            expect(d.element.tagName.toLowerCase()).toBe('details');
        });
    });

    it('the trigger is a native <summary> element', () => {
        const wrapper = mount(OriAccordion, { props: { items: ITEMS } });

        wrapper.findAll('summary').forEach((s) => {
            expect(s.element.tagName.toLowerCase()).toBe('summary');
        });
    });

    // ----- axe -----

    it('has no axe violations', async () => {
        const wrapper = mount(OriAccordion, {
            props: { items: ITEMS, color: 'primary' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
