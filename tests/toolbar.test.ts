import { describe, it, expect, afterEach } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import {
    OriToolbar,
    OriToolbarButton,
    OriToolbarSeparator,
    OriToolbarToggleGroup,
    OriToolbarToggleItem
} from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

afterEach(() => {
    document.body.innerHTML = '';
});

// Roving reads back the real DOM — the headless engine navigates by `querySelectorAll` in document
// order, so tests assert against the same live NodeList rather than a Vue-side model.
const buttons = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.ori-toolbar .ori-button'));

// A raw `el.click()` dispatches a MouseEvent whose Vue-assigned `_vts` (first-invoker timestamp) can,
// at millisecond resolution, collide with the `invoker.attached` time Vue recorded for a listener that
// was (re)attached in the same tick — Vue then treats that second listener as "attached during this
// event's own dispatch" and silently skips it. OriToolbarButton/OriToolbarToggleItem carry TWO click
// listeners on the same <button> (the action/toggle handler + the capture-phase disabled guard), so a
// click fired immediately after mount is exposed to this: the toggle handler occasionally never runs,
// with no error — `value.value`/`aria-pressed` just silently fail to update. `@vue/test-utils`'s own
// `trigger()` works around the exact same thing by bumping `_vts` past the collision window (see
// node_modules/@vue/test-utils …/trigger, and https://github.com/vuejs/test-utils/issues/1854); mirror
// it here since these tests click raw elements from `buttons()`, not `.find()`-wrapped ones.
function click(el: HTMLElement): void {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    (event as unknown as { _vts: number })._vts = Date.now() + 1;
    el.dispatchEvent(event);
}

type ToolbarTestProps = {
    dir?: 'ltr' | 'rtl';
    label?: string;
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
};

/** Mounts a toolbar of `count` plain icon buttons (labelled A, B, C, …), attached to the document. */
function mountToolbar(props: ToolbarTestProps = {}, count = 3) {
    return mount(OriToolbar, {
        props: { label: 'Bar', ...props },
        slots: {
            default: () =>
                Array.from({ length: count }, (_, i) =>
                    h(OriToolbarButton, { key: i, label: String.fromCharCode(65 + i), icon: 'x' })
                )
        },
        attachTo: document.body
    });
}

describe('OriToolbar — container', () => {
    it('renders role=toolbar with an accessible name via aria-label', () => {
        const wrapper = mountToolbar({ label: 'Formatting' });

        expect(wrapper.attributes('role')).toBe('toolbar');
        expect(wrapper.attributes('aria-label')).toBe('Formatting');
    });

    it('omits aria-orientation for the default horizontal orientation', () => {
        const wrapper = mountToolbar();

        expect(wrapper.attributes('aria-orientation')).toBeUndefined();
        expect(wrapper.classes()).not.toContain('ori-toolbar_vertical');
    });

    it('sets aria-orientation="vertical" and the vertical modifier class for orientation="vertical"', () => {
        const wrapper = mountToolbar({ orientation: 'vertical' });

        expect(wrapper.attributes('aria-orientation')).toBe('vertical');
        expect(wrapper.classes()).toContain('ori-toolbar_vertical');
    });

    it('forwards arbitrary native attributes to the root element', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            attrs: { id: 'main-toolbar', 'data-testid': 'toolbar' },
            attachTo: document.body
        });

        expect(wrapper.attributes('id')).toBe('main-toolbar');
        expect(wrapper.attributes('data-testid')).toBe('toolbar');
    });
});

describe('OriToolbar — roving tabindex', () => {
    it('gives exactly one item tabindex=0 (defaulting to the first) and the rest -1', () => {
        mountToolbar({}, 4);
        const tabindexes = buttons().map((b) => b.getAttribute('tabindex'));

        expect(tabindexes).toEqual(['0', '-1', '-1', '-1']);
        expect(tabindexes.filter((t) => t === '0')).toHaveLength(1);
    });
});

describe('OriToolbar — horizontal keyboard navigation (ltr default)', () => {
    it('ArrowRight moves the roving tab stop + DOM focus to the next item', async () => {
        mountToolbar();
        const [a, b] = buttons();

        a.focus();
        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(b);
        expect(b.getAttribute('tabindex')).toBe('0');
        expect(a.getAttribute('tabindex')).toBe('-1');
    });

    it('ArrowLeft moves the roving tab stop + DOM focus to the previous item', async () => {
        mountToolbar();
        const [a, b] = buttons();

        b.focus();
        b.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(a);
        expect(a.getAttribute('tabindex')).toBe('0');
        expect(b.getAttribute('tabindex')).toBe('-1');
    });

    it('ArrowRight wraps from the last item to the first when loop=true (the default)', async () => {
        mountToolbar({ loop: true });
        const items = buttons();
        const last = items[items.length - 1];

        last.focus();
        last.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(items[0]);
        expect(items[0].getAttribute('tabindex')).toBe('0');
    });

    it('ArrowLeft wraps from the first item to the last when loop=true (the default)', async () => {
        mountToolbar({ loop: true });
        const items = buttons();

        items[0].focus();
        items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await nextTick();

        const last = items[items.length - 1];
        expect(document.activeElement).toBe(last);
        expect(last.getAttribute('tabindex')).toBe('0');
    });

    it('ArrowRight does NOT wrap when loop=false — stays on the last item', async () => {
        mountToolbar({ loop: false });
        const items = buttons();
        const last = items[items.length - 1];

        last.focus();
        last.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(last);
        expect(last.getAttribute('tabindex')).toBe('0');
    });

    it('ArrowLeft does NOT wrap when loop=false — stays on the first item', async () => {
        mountToolbar({ loop: false });
        const items = buttons();

        items[0].focus();
        items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(items[0]);
        expect(items[0].getAttribute('tabindex')).toBe('0');
    });
});

describe('OriToolbar — Home/End', () => {
    it('Home jumps to the first item from anywhere in the toolbar', async () => {
        mountToolbar({}, 4);
        const items = buttons();

        items[2].focus();
        items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(items[0]);
        expect(items[0].getAttribute('tabindex')).toBe('0');
    });

    it('End jumps to the last item from anywhere in the toolbar', async () => {
        mountToolbar({}, 4);
        const items = buttons();

        items[1].focus();
        items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        await nextTick();

        const last = items[items.length - 1];
        expect(document.activeElement).toBe(last);
        expect(last.getAttribute('tabindex')).toBe('0');
    });

    it('Home/End ignore loop=false — they always jump to the ends', async () => {
        mountToolbar({ loop: false }, 3);
        const items = buttons();

        items[1].focus();
        items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        await nextTick();
        expect(document.activeElement).toBe(items[2]);

        items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
        await nextTick();
        expect(document.activeElement).toBe(items[0]);
    });
});

describe('OriToolbar — vertical orientation', () => {
    it('ArrowDown moves the roving tab stop + DOM focus to the next item', async () => {
        mountToolbar({ orientation: 'vertical' });
        const [a, b] = buttons();

        a.focus();
        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(b);
        expect(b.getAttribute('tabindex')).toBe('0');
    });

    it('ArrowUp moves the roving tab stop + DOM focus to the previous item', async () => {
        mountToolbar({ orientation: 'vertical' });
        const [a, b] = buttons();

        b.focus();
        b.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(a);
        expect(a.getAttribute('tabindex')).toBe('0');
    });

    it('ArrowRight/ArrowLeft are not navigation keys on a vertical toolbar', async () => {
        mountToolbar({ orientation: 'vertical' });
        const [a] = buttons();

        a.focus();
        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await nextTick();
        expect(document.activeElement).toBe(a);

        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await nextTick();
        expect(document.activeElement).toBe(a);
    });
});

describe('OriToolbar — RTL (dir="rtl") swaps the horizontal arrow keys', () => {
    it('ArrowLeft moves forward (to the next item)', async () => {
        mountToolbar({ dir: 'rtl' });
        const [a, b] = buttons();

        a.focus();
        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(b);
    });

    it('ArrowRight moves backward (to the previous item)', async () => {
        mountToolbar({ dir: 'rtl' });
        const items = buttons();

        items[1].focus();
        items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(items[0]);
    });
});

describe('OriToolbarButton', () => {
    it('pressed=true sets aria-pressed="true"', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { label: 'Bold', icon: 'x', pressed: true }) },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-button').attributes('aria-pressed')).toBe('true');
    });

    it('pressed=false sets aria-pressed="false"', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { label: 'Bold', icon: 'x', pressed: false }) },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-button').attributes('aria-pressed')).toBe('false');
    });

    // A plain (non-toggle) button renders NO aria-pressed. This only holds because the SFC defaults
    // `pressed = undefined` to opt out of Vue's absent-Boolean-prop coercion (which would otherwise make
    // an omitted `pressed` render aria-pressed="false") — the same footgun documented for OriDialog `open`.
    it('omitting pressed renders no aria-pressed (plain action button)', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { label: 'Bold', icon: 'x' }) },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-button').attributes('aria-pressed')).toBeUndefined();
    });

    it('disabled sets aria-disabled, is NOT native-disabled, and stays focusable', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { label: 'Disabled', icon: 'x', disabled: true }) },
            attachTo: document.body
        });
        const btn = wrapper.find('.ori-button');

        expect(btn.attributes('aria-disabled')).toBe('true');
        expect((btn.element as HTMLButtonElement).disabled).toBe(false);
        expect(btn.attributes('tabindex')).toBe('0'); // sole item -> still the roving tab stop
    });

    it('disabled blocks click activation', async () => {
        let clicks = 0;
        const Host = defineComponent({
            components: { OriToolbar, OriToolbarButton },
            setup: () => ({ onHit: () => (clicks += 1) }),
            template: `
                <OriToolbar label="Bar">
                    <OriToolbarButton label="Disabled" icon="x" :disabled="true" @click="onHit" />
                </OriToolbar>
            `
        });
        mount(Host, { attachTo: document.body });
        await nextTick();

        click(buttons()[0]);
        await nextTick();
        expect(clicks).toBe(0);
    });

    it('a disabled item mid-toolbar is still reachable by roving navigation (not skipped)', async () => {
        mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: {
                default: () => [
                    h(OriToolbarButton, { label: 'A', icon: 'x' }),
                    h(OriToolbarButton, { label: 'B', icon: 'x', disabled: true }),
                    h(OriToolbarButton, { label: 'C', icon: 'x' })
                ]
            },
            attachTo: document.body
        });
        const [a, b] = buttons();

        a.focus();
        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(b);
        expect(b.getAttribute('tabindex')).toBe('0');
        expect(b.getAttribute('aria-disabled')).toBe('true');
    });

    it('tooltip wires aria-describedby onto the button, pointing at the tooltip bubble id', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { label: 'Bold', icon: 'x', tooltip: 'Bold (Ctrl+B)' }) },
            attachTo: document.body
        });
        const bubble = wrapper.find('.ori-tooltip__bubble');
        const button = wrapper.find('.ori-button');

        expect(bubble.exists()).toBe(true);
        expect(bubble.attributes('id')).toBeTruthy();
        expect(button.attributes('aria-describedby')).toBe(bubble.attributes('id'));
    });

    it('an icon-only button with an explicit label uses it as the accessible name', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { label: 'Redo', icon: 'x' }) },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-button').attributes('aria-label')).toBe('Redo');
    });

    it('an icon-only button with no label falls back to the tooltip text as its accessible name', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { icon: 'x', tooltip: 'Undo' }) },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-button').attributes('aria-label')).toBe('Undo');
    });

    it('omits aria-describedby when the tooltip IS the name (no label) — avoids name == description', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { icon: 'x', tooltip: 'Undo' }) },
            attachTo: document.body
        });

        const button = wrapper.find('.ori-button');
        // The name already comes from the tooltip text; describing with the same text would double-announce.
        expect(button.attributes('aria-label')).toBe('Undo');
        expect(button.attributes('aria-describedby')).toBeUndefined();
    });

    it('forwards color / size / variant / radius / text to the rendered OriButton', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: {
                default: () =>
                    h(OriToolbarButton, {
                        text: 'Save',
                        color: 'danger',
                        size: 'lg',
                        variant: 'outline',
                        radius: 'sm'
                    })
            },
            attachTo: document.body
        });
        const btn = wrapper.find('.ori-button');

        expect(btn.classes()).toContain('ori-color_danger');
        expect(btn.classes()).toContain('ori-button_lg');
        expect(btn.classes()).toContain('ori-variant_outline');
        expect(btn.classes()).toContain('ori-size-radius_sm');
        expect(btn.text()).toBe('Save');
    });

    it('participates in roving: carries data-ori-toolbar-item and a roving tabindex', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { label: 'A', icon: 'x' }) },
            attachTo: document.body
        });
        const btn = wrapper.find('.ori-button');

        expect(btn.attributes('data-ori-toolbar-item')).toBe('');
        expect(btn.attributes('tabindex')).toBe('0');
    });
});

describe('OriToolbarSeparator', () => {
    it('has role=separator', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => [h(OriToolbarButton, { label: 'A', icon: 'x' }), h(OriToolbarSeparator)] },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-toolbar__separator').attributes('role')).toBe('separator');
    });

    it('is perpendicular (vertical) inside a horizontal toolbar', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar', orientation: 'horizontal' },
            slots: { default: () => [h(OriToolbarButton, { label: 'A', icon: 'x' }), h(OriToolbarSeparator)] },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-toolbar__separator').attributes('aria-orientation')).toBe('vertical');
    });

    it('omits aria-orientation (perpendicular = horizontal, the implicit default) inside a vertical toolbar', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar', orientation: 'vertical' },
            slots: { default: () => [h(OriToolbarButton, { label: 'A', icon: 'x' }), h(OriToolbarSeparator)] },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-toolbar__separator').attributes('aria-orientation')).toBeUndefined();
    });

    it('is not a roving stop: no data-ori-toolbar-item marker and no tabindex', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => [h(OriToolbarButton, { label: 'A', icon: 'x' }), h(OriToolbarSeparator)] },
            attachTo: document.body
        });
        const sep = wrapper.find('.ori-toolbar__separator');

        expect(sep.attributes('data-ori-toolbar-item')).toBeUndefined();
        expect(sep.attributes('tabindex')).toBeUndefined();
    });

    it('is skipped by arrow-key roving navigation', async () => {
        mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: {
                default: () => [
                    h(OriToolbarButton, { label: 'A', icon: 'x' }),
                    h(OriToolbarSeparator),
                    h(OriToolbarButton, { label: 'B', icon: 'x' })
                ]
            },
            attachTo: document.body
        });
        const [a, b] = buttons();

        a.focus();
        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await nextTick();

        // Lands directly on B — the separator between them is not a roving stop.
        expect(document.activeElement).toBe(b);
    });
});

describe('OriToolbarToggleGroup + OriToolbarToggleItem', () => {
    it('single type: click sets aria-pressed and updates v-model (deselectable)', async () => {
        const value = ref<string | undefined>(undefined);
        const Host = defineComponent({
            components: { OriToolbar, OriToolbarToggleGroup, OriToolbarToggleItem },
            setup: () => ({ value }),
            template: `
                <OriToolbar label="Align">
                    <OriToolbarToggleGroup v-model="value" type="single" label="Align">
                        <OriToolbarToggleItem value="left" label="Left" icon="x" />
                        <OriToolbarToggleItem value="right" label="Right" icon="x" />
                    </OriToolbarToggleGroup>
                </OriToolbar>
            `
        });
        mount(Host, { attachTo: document.body });
        await nextTick();

        const [left, right] = buttons();
        expect(left.getAttribute('aria-pressed')).toBe('false');
        expect(right.getAttribute('aria-pressed')).toBe('false');

        click(left);
        await nextTick();
        expect(value.value).toBe('left');
        expect(left.getAttribute('aria-pressed')).toBe('true');
        expect(right.getAttribute('aria-pressed')).toBe('false');

        // single is deselectable — clicking the pressed item clears it
        click(left);
        await nextTick();
        expect(value.value).toBeUndefined();
        expect(left.getAttribute('aria-pressed')).toBe('false');
    });

    it('a disabled toggle item is aria-disabled, focusable, and does not toggle v-model', async () => {
        const value = ref<string | undefined>(undefined);
        const Host = defineComponent({
            components: { OriToolbar, OriToolbarToggleGroup, OriToolbarToggleItem },
            setup: () => ({ value }),
            template: `
                <OriToolbar label="Align">
                    <OriToolbarToggleGroup v-model="value" type="single" label="Align">
                        <OriToolbarToggleItem value="left" label="Left" icon="x" :disabled="true" />
                        <OriToolbarToggleItem value="right" label="Right" icon="x" />
                    </OriToolbarToggleGroup>
                </OriToolbar>
            `
        });
        mount(Host, { attachTo: document.body });
        await nextTick();

        const [left] = buttons();
        expect(left.getAttribute('aria-disabled')).toBe('true');
        expect(left.hasAttribute('disabled')).toBe(false); // aria-disabled + focusable, not native-disabled
        click(left);
        await nextTick();
        expect(value.value).toBeUndefined(); // activation blocked → no toggle
        expect(left.getAttribute('aria-pressed')).toBe('false');
    });

    it('single type: selecting a new value deselects the previous one', async () => {
        const value = ref<string | undefined>('left');
        const Host = defineComponent({
            components: { OriToolbar, OriToolbarToggleGroup, OriToolbarToggleItem },
            setup: () => ({ value }),
            template: `
                <OriToolbar label="Align">
                    <OriToolbarToggleGroup v-model="value" type="single" label="Align">
                        <OriToolbarToggleItem value="left" label="Left" icon="x" />
                        <OriToolbarToggleItem value="right" label="Right" icon="x" />
                    </OriToolbarToggleGroup>
                </OriToolbar>
            `
        });
        mount(Host, { attachTo: document.body });
        await nextTick();

        const [left, right] = buttons();
        expect(left.getAttribute('aria-pressed')).toBe('true');

        click(right);
        await nextTick();
        expect(value.value).toBe('right');
        expect(left.getAttribute('aria-pressed')).toBe('false');
        expect(right.getAttribute('aria-pressed')).toBe('true');
    });

    it('multiple type: v-model accumulates a set across clicks (awaiting a tick between each)', async () => {
        const value = ref<string[]>([]);
        const Host = defineComponent({
            components: { OriToolbar, OriToolbarToggleGroup, OriToolbarToggleItem },
            setup: () => ({ value }),
            template: `
                <OriToolbar label="Style">
                    <OriToolbarToggleGroup v-model="value" type="multiple" label="Style">
                        <OriToolbarToggleItem value="bold" label="Bold" icon="x" />
                        <OriToolbarToggleItem value="italic" label="Italic" icon="x" />
                    </OriToolbarToggleGroup>
                </OriToolbar>
            `
        });
        mount(Host, { attachTo: document.body });
        await nextTick();

        const [bold, italic] = buttons();

        // A tick between clicks: v-model round-trips through the parent, so the group sees the
        // committed value before the next toggle (the realistic per-interaction cadence).
        click(bold);
        await nextTick();
        click(italic);
        await nextTick();
        expect(value.value).toEqual(['bold', 'italic']);
        expect(bold.getAttribute('aria-pressed')).toBe('true');
        expect(italic.getAttribute('aria-pressed')).toBe('true');

        click(bold);
        await nextTick();
        expect(value.value).toEqual(['italic']);
        expect(bold.getAttribute('aria-pressed')).toBe('false');
        expect(italic.getAttribute('aria-pressed')).toBe('true');
    });

    it('group root has role=group and the accessible name from `label`', async () => {
        const value = ref<string | undefined>(undefined);
        const Host = defineComponent({
            components: { OriToolbar, OriToolbarToggleGroup, OriToolbarToggleItem },
            setup: () => ({ value }),
            template: `
                <OriToolbar label="Align">
                    <OriToolbarToggleGroup v-model="value" type="single" label="Text alignment">
                        <OriToolbarToggleItem value="left" label="Left" icon="x" />
                    </OriToolbarToggleGroup>
                </OriToolbar>
            `
        });
        const wrapper = mount(Host, { attachTo: document.body });
        await nextTick();

        const group = wrapper.find('.ori-toolbar__group');
        expect(group.attributes('role')).toBe('group');
        expect(group.attributes('aria-label')).toBe('Text alignment');
    });

    it('toggle items still participate in the flat toolbar roving order', async () => {
        const value = ref<string | undefined>(undefined);
        const Host = defineComponent({
            components: { OriToolbar, OriToolbarButton, OriToolbarToggleGroup, OriToolbarToggleItem },
            setup: () => ({ value }),
            template: `
                <OriToolbar label="Bar">
                    <OriToolbarButton label="A" icon="x" />
                    <OriToolbarToggleGroup v-model="value" type="single" label="Align">
                        <OriToolbarToggleItem value="left" label="Left" icon="x" />
                    </OriToolbarToggleGroup>
                </OriToolbar>
            `
        });
        mount(Host, { attachTo: document.body });
        await nextTick();

        const [a, left] = buttons();
        a.focus();
        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await nextTick();

        expect(document.activeElement).toBe(left);
    });
});

describe('OriToolbarButton — slot (custom icon content)', () => {
    it('renders slotted children in place of the icon prop (slot beats icon)', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: {
                default: () =>
                    h(
                        OriToolbarButton,
                        { label: 'Bold', icon: 'x' },
                        { default: () => h('svg', { class: 'custom-icon' }) }
                    )
            },
            attachTo: document.body
        });
        const btn = wrapper.find('.ori-button');

        // The slotted SVG renders...
        expect(btn.find('svg.custom-icon').exists()).toBe(true);
        // ...and the `icon` prop's fallback OriIcon does NOT (a provided slot replaces OriButton's default).
        expect(btn.find('.ori-button__icon').exists()).toBe(false);
    });

    it('falls back to the icon prop when no slot is provided (the conditional forward keeps the fallback)', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: { default: () => h(OriToolbarButton, { label: 'Bold', icon: 'x' }) },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-button .ori-button__icon').exists()).toBe(true);
    });

    it('forwards the slot through the tooltip branch too', () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Bar' },
            slots: {
                default: () =>
                    h(
                        OriToolbarButton,
                        { label: 'Bold', tooltip: 'Bold (Ctrl+B)' },
                        { default: () => h('svg', { class: 'custom-icon' }) }
                    )
            },
            attachTo: document.body
        });

        expect(wrapper.find('.ori-tooltip__bubble').exists()).toBe(true);
        expect(wrapper.find('.ori-button svg.custom-icon').exists()).toBe(true);
    });
});

describe('OriToolbarToggleItem — slot (custom icon content)', () => {
    it('renders slotted children and still toggles v-model', async () => {
        const value = ref<string | undefined>(undefined);
        const Host = defineComponent({
            components: { OriToolbar, OriToolbarToggleGroup, OriToolbarToggleItem },
            setup: () => ({ value }),
            template: `
                <OriToolbar label="Style">
                    <OriToolbarToggleGroup v-model="value" type="single" label="Style">
                        <OriToolbarToggleItem value="bold" label="Bold">
                            <svg class="custom-icon" />
                        </OriToolbarToggleItem>
                    </OriToolbarToggleGroup>
                </OriToolbar>
            `
        });
        mount(Host, { attachTo: document.body });
        await nextTick();

        const [bold] = buttons();
        expect(bold.querySelector('svg.custom-icon')).not.toBeNull();
        expect(bold.querySelector('.ori-button__icon')).toBeNull();

        click(bold);
        await nextTick();
        expect(value.value).toBe('bold');
        expect(bold.getAttribute('aria-pressed')).toBe('true');
    });
});

describe('OriToolbar — axe', () => {
    it('has no axe violations for a labelled toolbar of buttons + a separator', async () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Formatting' },
            slots: {
                default: () => [
                    h(OriToolbarButton, { label: 'Bold', icon: 'x' }),
                    h(OriToolbarButton, { label: 'Italic', icon: 'x', pressed: true }),
                    h(OriToolbarSeparator)
                ]
            },
            attachTo: document.body
        });

        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations for a labelled vertical toolbar', async () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Formatting', orientation: 'vertical' },
            slots: {
                default: () => [
                    h(OriToolbarButton, { label: 'Bold', icon: 'x' }),
                    h(OriToolbarButton, { label: 'Italic', icon: 'x' })
                ]
            },
            attachTo: document.body
        });

        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations for a toolbar with a disabled button', async () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Formatting' },
            slots: {
                default: () => [
                    h(OriToolbarButton, { label: 'Bold', icon: 'x' }),
                    h(OriToolbarButton, { label: 'Disabled', icon: 'x', disabled: true })
                ]
            },
            attachTo: document.body
        });

        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations for a tooltip on an icon-only button', async () => {
        const wrapper = mount(OriToolbar, {
            props: { label: 'Formatting' },
            slots: { default: () => h(OriToolbarButton, { icon: 'x', tooltip: 'Undo' }) },
            attachTo: document.body
        });

        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations for a labelled toolbar including a toggle group', async () => {
        const value = ref<string | undefined>('left');
        const Host = defineComponent({
            components: {
                OriToolbar,
                OriToolbarButton,
                OriToolbarSeparator,
                OriToolbarToggleGroup,
                OriToolbarToggleItem
            },
            setup: () => ({ value }),
            template: `
                <OriToolbar label="Formatting">
                    <OriToolbarButton label="Undo" icon="x" />
                    <OriToolbarSeparator />
                    <OriToolbarToggleGroup v-model="value" type="single" label="Text alignment">
                        <OriToolbarToggleItem value="left" label="Left" icon="x" />
                        <OriToolbarToggleItem value="right" label="Right" icon="x" />
                    </OriToolbarToggleGroup>
                </OriToolbar>
            `
        });
        const wrapper = mount(Host, { attachTo: document.body });
        await nextTick();

        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
