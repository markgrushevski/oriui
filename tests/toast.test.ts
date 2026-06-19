import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useToast, OriToast, OriToaster } from '../src';
import { expectNoA11yViolations } from './helpers/axe';

// The store is a module-level singleton — reset between every test so they don't bleed into
// each other (a failed/skipped test that pushed items would poison the next one).
afterEach(() => {
    useToast().clear();
});

// ---------------------------------------------------------------------------
// useToast() — store behaviour
// ---------------------------------------------------------------------------

describe('useToast() store', () => {
    it('toast(string) pushes one item with text, returns a numeric id, and sets defaults', () => {
        const { toast, toasts } = useToast();

        const id = toast('hello');

        expect(typeof id).toBe('number');
        expect(toasts).toHaveLength(1);
        expect(toasts[0].id).toBe(id);
        expect(toasts[0].text).toBe('hello');
        expect(toasts[0].duration).toBe(4000);
        expect(toasts[0].closable).toBe(true);
    });

    it('toast(object) merges over defaults', () => {
        const { toast, toasts } = useToast();

        toast({ text: 'custom', title: 'Title', closable: false, duration: 2000 });

        expect(toasts[0].text).toBe('custom');
        expect(toasts[0].title).toBe('Title');
        expect(toasts[0].closable).toBe(false);
        expect(toasts[0].duration).toBe(2000);
    });

    it('duration: 0 keeps the toast indefinitely — advancing timers a long way does not remove it', () => {
        vi.useFakeTimers();
        const { toast, toasts } = useToast();

        toast({ text: 'sticky', duration: 0 });

        vi.advanceTimersByTime(60_000);

        expect(toasts).toHaveLength(1);
        vi.useRealTimers();
    });

    it('success() sets color "success"', () => {
        const { success, toasts } = useToast();

        success('saved');

        expect(toasts[0].color).toBe('success');
        expect(toasts[0].text).toBe('saved');
    });

    it('success() with object arg — explicit color overrides the shortcut fallback', () => {
        const { success, toasts } = useToast();

        success({ text: 'saved', color: 'info' });

        expect(toasts[0].color).toBe('info');
    });

    it('error() sets color "danger"', () => {
        const { error, toasts } = useToast();

        error('failed');

        expect(toasts[0].color).toBe('danger');
    });

    it('warn() sets color "warn"', () => {
        const { warn, toasts } = useToast();

        warn({ text: 'warning' });

        expect(toasts[0].color).toBe('warn');
    });

    it('info() sets color "info"', () => {
        const { info, toasts } = useToast();

        info('note');

        expect(toasts[0].color).toBe('info');
    });

    it('severity shortcut with object — own color overrides the shortcut color', () => {
        const { error, toasts } = useToast();

        error({ text: 'oops', color: 'warn' });

        expect(toasts[0].color).toBe('warn');
    });

    it('auto-dismiss: toast is removed from queue after duration ms', () => {
        vi.useFakeTimers();
        const { toast, toasts } = useToast();

        toast({ text: 'brief', duration: 3000 });
        expect(toasts).toHaveLength(1);

        vi.advanceTimersByTime(3001);

        expect(toasts).toHaveLength(0);
        vi.useRealTimers();
    });

    it('auto-dismiss: toast is still in queue just before duration expires', () => {
        vi.useFakeTimers();
        const { toast, toasts } = useToast();

        toast({ text: 'brief', duration: 3000 });

        vi.advanceTimersByTime(2999);

        expect(toasts).toHaveLength(1);
        vi.useRealTimers();
    });

    it('default duration (4000 ms) is auto-dismissed after 4 seconds', () => {
        vi.useFakeTimers();
        const { toast, toasts } = useToast();

        toast('default-timer');

        vi.advanceTimersByTime(4001);

        expect(toasts).toHaveLength(0);
        vi.useRealTimers();
    });

    it('dismiss(id) removes the matching item immediately', () => {
        const { toast, dismiss, toasts } = useToast();

        const id = toast('removable');
        expect(toasts).toHaveLength(1);

        dismiss(id);

        expect(toasts).toHaveLength(0);
    });

    it('dismiss(id) before timer fires does not throw or double-remove', () => {
        vi.useFakeTimers();
        const { toast, dismiss, toasts } = useToast();

        const id = toast({ text: 'gone early', duration: 5000 });
        dismiss(id);

        expect(toasts).toHaveLength(0);

        // Advancing past the original timeout must not throw or re-remove
        expect(() => vi.advanceTimersByTime(6000)).not.toThrow();
        expect(toasts).toHaveLength(0);
        vi.useRealTimers();
    });

    it('dismiss(id) on an unknown id is a no-op and does not throw', () => {
        const { dismiss } = useToast();

        expect(() => dismiss(9999)).not.toThrow();
    });

    it('clear() empties the queue', () => {
        const { toast, clear, toasts } = useToast();

        toast('a');
        toast('b');
        toast('c');
        expect(toasts).toHaveLength(3);

        clear();

        expect(toasts).toHaveLength(0);
    });

    it('clear() cancels timers — advancing time after clear does not throw', () => {
        vi.useFakeTimers();
        const { toast, clear, toasts } = useToast();

        toast({ text: 'x', duration: 1000 });
        clear();

        expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
        expect(toasts).toHaveLength(0);
        vi.useRealTimers();
    });

    it('each push returns a distinct numeric id', () => {
        const { toast } = useToast();

        const ids = [toast('a'), toast('b'), toast('c')];

        expect(new Set(ids).size).toBe(3);
        ids.forEach((id) => expect(typeof id).toBe('number'));
    });
});

// ---------------------------------------------------------------------------
// OriToast component
// ---------------------------------------------------------------------------

describe('OriToast component', () => {
    it('renders .ori-toast root element', () => {
        const wrapper = mount(OriToast, { props: { text: 'Hi' } });

        expect(wrapper.classes()).toContain('ori-toast');
    });

    it('role="status" for non-danger colors (default color is surface)', () => {
        const wrapper = mount(OriToast, { props: { text: 'Info message' } });

        expect(wrapper.attributes('role')).toBe('status');
    });

    it('role="alert" when color is "danger"', () => {
        const wrapper = mount(OriToast, { props: { text: 'Error!', color: 'danger' } });

        expect(wrapper.attributes('role')).toBe('alert');
    });

    it('role="status" for success color', () => {
        const wrapper = mount(OriToast, { props: { text: 'Done', color: 'success' } });

        expect(wrapper.attributes('role')).toBe('status');
    });

    it('role="status" for warn color', () => {
        const wrapper = mount(OriToast, { props: { text: 'Careful', color: 'warn' } });

        expect(wrapper.attributes('role')).toBe('status');
    });

    it('applies ori-color_<color> class', () => {
        const wrapper = mount(OriToast, { props: { text: 'x', color: 'success' } });

        expect(wrapper.classes()).toContain('ori-color_success');
    });

    it('applies the correct color class for danger', () => {
        const wrapper = mount(OriToast, { props: { text: 'x', color: 'danger' } });

        expect(wrapper.classes()).toContain('ori-color_danger');
    });

    it('renders text inside .ori-toast__text', () => {
        const wrapper = mount(OriToast, { props: { text: 'Hello world' } });

        expect(wrapper.find('.ori-toast__text').text()).toBe('Hello world');
    });

    it('renders title inside .ori-toast__title when provided', () => {
        const wrapper = mount(OriToast, { props: { title: 'My Title', text: 'body' } });

        expect(wrapper.find('.ori-toast__title').text()).toBe('My Title');
    });

    it('does not render .ori-toast__title when title is omitted', () => {
        const wrapper = mount(OriToast, { props: { text: 'no title' } });

        expect(wrapper.find('.ori-toast__title').exists()).toBe(false);
    });

    it('renders icon slot (OriIcon) when icon prop is provided', () => {
        const wrapper = mount(OriToast, { props: { text: 'x', icon: 'M0 0h24v24H0z' } });

        expect(wrapper.find('.ori-toast__icon').exists()).toBe(true);
    });

    it('does not render icon when icon prop is omitted', () => {
        const wrapper = mount(OriToast, { props: { text: 'no icon' } });

        expect(wrapper.find('.ori-toast__icon').exists()).toBe(false);
    });

    it('close button appears when closable is true', () => {
        const wrapper = mount(OriToast, { props: { text: 'x', closable: true } });

        expect(wrapper.find('.ori-toast__close').exists()).toBe(true);
    });

    it('close button is absent when closable is false (or omitted)', () => {
        const wrapper = mount(OriToast, { props: { text: 'x', closable: false } });

        expect(wrapper.find('.ori-toast__close').exists()).toBe(false);
    });

    it('clicking the close button emits close', async () => {
        const wrapper = mount(OriToast, { props: { text: 'x', closable: true } });

        await wrapper.find('.ori-toast__close').trigger('click');

        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('close button has an accessible label', () => {
        const wrapper = mount(OriToast, { props: { text: 'x', closable: true } });
        const btn = wrapper.find('.ori-toast__close');

        expect(btn.attributes('aria-label')).toBeTruthy();
    });

    it('default slot overrides text prop', () => {
        const wrapper = mount(OriToast, {
            props: { text: 'prop text' },
            slots: { default: 'slot content' }
        });

        expect(wrapper.find('.ori-toast__text').text()).toBe('slot content');
    });

    it('has no axe violations (with text, closable)', async () => {
        const wrapper = mount(OriToast, {
            props: { text: 'Operation complete', closable: true },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations for danger (role=alert)', async () => {
        const wrapper = mount(OriToast, {
            props: { text: 'An error occurred', color: 'danger', closable: true },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations with title and icon', async () => {
        const wrapper = mount(OriToast, {
            props: { title: 'Success', text: 'Your changes were saved', color: 'success', icon: 'M5 13l4 4L19 7' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});

// ---------------------------------------------------------------------------
// OriToaster component
// ---------------------------------------------------------------------------

describe('OriToaster component', () => {
    // Clear the DOM between tests — the Toaster Teleports to body.
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('applies ori-toaster_<position> class for the default top-right position', async () => {
        const wrapper = mount(OriToaster, { attachTo: document.body });
        await nextTick();

        // After mount the Teleport activates; query the container on body.
        const container = document.body.querySelector('.ori-toaster');
        expect(container?.classList.contains('ori-toaster_top-right')).toBe(true);

        wrapper.unmount();
    });

    it('maps position prop to ori-toaster_<position> class', async () => {
        const wrapper = mount(OriToaster, {
            props: { position: 'bottom-left' },
            attachTo: document.body
        });
        await nextTick();

        const container = document.body.querySelector('.ori-toaster');
        expect(container?.classList.contains('ori-toaster_bottom-left')).toBe(true);

        wrapper.unmount();
    });

    it('renders pushed toasts inside the Teleport container', async () => {
        const wrapper = mount(OriToaster, { attachTo: document.body });
        await nextTick(); // let mounted() fire and Teleport render

        const { toast } = useToast();
        toast({ text: 'live toast' });
        await nextTick();

        const toastEl = document.body.querySelector('.ori-toast');
        expect(toastEl).not.toBeNull();

        wrapper.unmount();
    });

    it('removing a toast via dismiss() removes its element from the DOM', async () => {
        const wrapper = mount(OriToaster, { attachTo: document.body });
        await nextTick();

        const { toast, dismiss } = useToast();
        const id = toast({ text: 'will dismiss' });
        await nextTick();
        expect(document.body.querySelector('.ori-toast')).not.toBeNull();

        dismiss(id);
        await nextTick();
        expect(document.body.querySelector('.ori-toast')).toBeNull();

        wrapper.unmount();
    });

    it('position values map to their css class (all 6 positions)', async () => {
        const positions = [
            'top-left',
            'top-right',
            'top-center',
            'bottom-left',
            'bottom-right',
            'bottom-center'
        ] as const;

        for (const pos of positions) {
            const wrapper = mount(OriToaster, {
                props: { position: pos },
                attachTo: document.body
            });
            await nextTick();

            expect(document.body.querySelector(`.ori-toaster_${pos}`)).not.toBeNull();

            wrapper.unmount();
            document.body.innerHTML = '';
        }
    });
});
