import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriProgress } from '../packages/vue/src/components/progress';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriProgress', () => {
    it('renders with default token classes and role=progressbar', () => {
        const wrapper = mount(OriProgress);
        const classes = wrapper.classes();

        expect(classes).toContain('ori-progress');
        expect(classes).toContain('ori-progress_md');

        expect(wrapper.attributes('role')).toBe('progressbar');
    });

    it('sets default aria attributes: label, valuemin, valuemax, valuenow', () => {
        const wrapper = mount(OriProgress);

        expect(wrapper.attributes('aria-label')).toBe('Loading');
        expect(wrapper.attributes('aria-valuemin')).toBe('0');
        expect(wrapper.attributes('aria-valuemax')).toBe('100');
        expect(wrapper.attributes('aria-valuenow')).toBe('0');
    });

    it('reflects value prop via aria-valuenow', () => {
        const wrapper = mount(OriProgress, { props: { value: 42 } });

        expect(wrapper.attributes('aria-valuenow')).toBe('42');
    });

    it('clamps value below 0 to 0', () => {
        const wrapper = mount(OriProgress, { props: { value: -10 } });

        expect(wrapper.attributes('aria-valuenow')).toBe('0');
    });

    it('clamps value above max to max', () => {
        const wrapper = mount(OriProgress, { props: { value: 150, max: 100 } });

        expect(wrapper.attributes('aria-valuenow')).toBe('100');
    });

    it('reflects custom max via aria-valuemax', () => {
        const wrapper = mount(OriProgress, { props: { value: 5, max: 10 } });

        expect(wrapper.attributes('aria-valuemax')).toBe('10');
        expect(wrapper.attributes('aria-valuenow')).toBe('5');
    });

    it('reflects custom label via aria-label', () => {
        const wrapper = mount(OriProgress, { props: { label: 'Upload progress' } });

        expect(wrapper.attributes('aria-label')).toBe('Upload progress');
    });

    it('indeterminate mode omits aria-valuenow and sets data-indeterminate on indicator', () => {
        const wrapper = mount(OriProgress, { props: { indeterminate: true } });

        expect(wrapper.attributes('aria-valuenow')).toBeUndefined();
        const indicator = wrapper.find('.ori-progress__indicator');
        expect(indicator.attributes('data-indeterminate')).toBe('');
    });

    it('determinate mode does not set data-indeterminate on indicator', () => {
        const wrapper = mount(OriProgress, { props: { value: 50 } });
        const indicator = wrapper.find('.ori-progress__indicator');

        expect(indicator.attributes('data-indeterminate')).toBeUndefined();
    });

    it('determinate mode sets inline width style on indicator', () => {
        const wrapper = mount(OriProgress, { props: { value: 50, max: 100 } });
        const indicator = wrapper.find('.ori-progress__indicator');

        expect(indicator.attributes('style')).toContain('width: 50%');
    });

    it('indeterminate mode does not set inline width style on indicator', () => {
        const wrapper = mount(OriProgress, { props: { indeterminate: true } });
        const indicator = wrapper.find('.ori-progress__indicator');

        // style should not contain a width override from JS
        const style = indicator.attributes('style');
        expect(style == null || !style.includes('width')).toBe(true);
    });

    it('maps size prop to size class', () => {
        const sm = mount(OriProgress, { props: { size: 'sm' } });
        expect(sm.classes()).toContain('ori-progress_sm');

        const lg = mount(OriProgress, { props: { size: 'lg' } });
        expect(lg.classes()).toContain('ori-progress_lg');
    });

    it('maps color prop to ori-color_* class', () => {
        const wrapper = mount(OriProgress, { props: { color: 'success' } });
        const classes = wrapper.classes();

        expect(classes).toContain('ori-color_success');
    });

    it('applies the default color class (primary) when no color prop is provided', () => {
        const wrapper = mount(OriProgress);
        const classes = wrapper.classes();

        expect(classes).toContain('ori-color_primary');
    });

    it('maps radius prop to ori-size-radius_* class', () => {
        const wrapper = mount(OriProgress, { props: { radius: 'xl' } });
        const classes = wrapper.classes();

        expect(classes).toContain('ori-size-radius_xl');
    });

    it('default radius=rounded maps to ori-size-radius_rounded class', () => {
        const wrapper = mount(OriProgress);
        const classes = wrapper.classes();

        expect(classes).toContain('ori-size-radius_rounded');
    });

    it('renders the track and indicator child elements', () => {
        const wrapper = mount(OriProgress);

        expect(wrapper.find('.ori-progress__track').exists()).toBe(true);
        expect(wrapper.find('.ori-progress__indicator').exists()).toBe(true);
    });

    it('has no axe violations (determinate, labeled)', async () => {
        const wrapper = mount(OriProgress, {
            props: { label: 'File upload', value: 60, max: 100 },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations (indeterminate)', async () => {
        const wrapper = mount(OriProgress, {
            props: { label: 'Loading content', indeterminate: true },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
