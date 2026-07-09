import { describe, it, expect, afterEach } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { OriHeadless } from '@oriui/headless/vue';
import { OriDialog } from '../packages/vue/src';
import { fakeDialog } from './helpers/fake-dialog';
import { expectNoA11yViolations } from './helpers/axe';

type Props = Record<string, unknown>;
type Slots = Record<string, unknown>;

function mountDialog(props: Props = {}, slots: Slots = {}, plugins: unknown[] = []) {
    return mount(OriDialog, {
        props,
        slots: {
            trigger: (scope: { props: Record<string, unknown> }) =>
                h('button', { ...scope.props, 'data-testid': 'trigger' }, 'Open'),
            ...slots
        },
        global: { plugins: plugins as never },
        attachTo: document.body
    });
}

// OriDialog renders a real <dialog>; clear the body between tests to keep them isolated.
afterEach(() => {
    document.body.innerHTML = '';
});

const dialogEl = () => document.querySelector('dialog.ori-dialog') as HTMLDialogElement | null;

describe('OriDialog (native <dialog> engine)', () => {
    it('renders the trigger and a closed <dialog> by default', async () => {
        const wrapper = mountDialog({ title: 'Confirm' });
        await nextTick();

        expect(wrapper.find('[data-testid="trigger"]').exists()).toBe(true);
        expect(dialogEl()).not.toBeNull();
        expect(dialogEl()?.open).toBe(false);
    });

    it('opens on trigger click with accessible dialog markup', async () => {
        const wrapper = mountDialog({ title: 'Confirm' });
        await nextTick();
        await wrapper.find('[data-testid="trigger"]').trigger('click');
        await nextTick();

        const dialog = dialogEl();
        expect(dialog?.open).toBe(true);
        expect(dialog?.getAttribute('role')).toBe('dialog');
        expect(dialog?.getAttribute('aria-modal')).toBe('true');

        // The title is wired as the dialog's accessible name via aria-labelledby.
        const title = document.querySelector('.ori-dialog__title');
        expect(title?.id).toBe(dialog?.getAttribute('aria-labelledby'));
        expect(title?.textContent).toContain('Confirm');
    });

    it('projects the default slot as the dialog body', async () => {
        mountDialog({ title: 'Confirm', defaultOpen: true }, { default: () => 'Delete this item?' });
        await nextTick();

        expect(dialogEl()?.open).toBe(true);
        expect(document.querySelector('.ori-dialog__body')?.textContent).toContain('Delete this item?');
    });

    it('closes via the close trigger', async () => {
        mountDialog({ title: 'Confirm', defaultOpen: true });
        await nextTick();
        expect(dialogEl()?.open).toBe(true);

        (document.querySelector('.ori-dialog__close') as HTMLButtonElement).click();
        await nextTick();

        expect(dialogEl()?.open).toBe(false);
    });

    it('opens and closes from a controlled `open` prop', async () => {
        const wrapper = mountDialog({ title: 'Confirm', open: false });
        await nextTick();
        expect(dialogEl()?.open).toBe(false);

        await wrapper.setProps({ open: true });
        await nextTick();
        expect(dialogEl()?.open).toBe(true);

        await wrapper.setProps({ open: false });
        await nextTick();
        expect(dialogEl()?.open).toBe(false);
    });

    it('emits update:open and close when closed internally', async () => {
        const wrapper = mountDialog({ title: 'Confirm', open: true });
        await nextTick();
        expect(dialogEl()?.open).toBe(true);

        (document.querySelector('.ori-dialog__close') as HTMLButtonElement).click();
        await nextTick();

        // The host is told about the close (v-model + a one-shot `close`); the prop is left as the
        // host's to update — the dialog does NOT re-open itself from the still-truthy `open` prop.
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
        expect(wrapper.emitted('close')).toHaveLength(1);
        expect(dialogEl()?.open).toBe(false);
    });

    it('emits update:open on trigger-driven open/close (uncontrolled)', async () => {
        const wrapper = mountDialog({ title: 'Confirm' });
        await nextTick();

        await wrapper.find('[data-testid="trigger"]').trigger('click');
        await nextTick();
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true]);
        expect(dialogEl()?.open).toBe(true);

        (document.querySelector('.ori-dialog__close') as HTMLButtonElement).click();
        await nextTick();
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('supports v-model:open round-trip with a host ref', async () => {
        const open = ref(false);
        const Host = defineComponent({
            components: { OriDialog },
            setup: () => ({ open }),
            template: `<OriDialog v-model:open="open" title="Confirm" />`
        });
        mount(Host, { attachTo: document.body });
        await nextTick();
        expect(dialogEl()?.open).toBe(false);

        // Host → dialog: flipping the ref opens the platform <dialog>.
        open.value = true;
        await nextTick();
        await nextTick();
        expect(dialogEl()?.open).toBe(true);

        // Dialog → host: an internal close writes back through v-model, with no feedback loop.
        (document.querySelector('.ori-dialog__close') as HTMLButtonElement).click();
        await nextTick();
        expect(open.value).toBe(false);
        expect(dialogEl()?.open).toBe(false);
    });

    it('drives a controlled `open` prop through a swapped adapter', async () => {
        // The controllable contract is composed from setOpen + onOpenChange, which any adapter
        // implements — so v-model:open must work on a swapped engine, not just the native default.
        const wrapper = mountDialog({ open: false }, {}, [[OriHeadless, { dialog: fakeDialog }]]);
        await nextTick();
        // Fixed-id prop bag proves the fake (not native) adapter produced these props.
        expect(dialogEl()?.getAttribute('aria-labelledby')).toBe('test-dialog-title');
        expect(dialogEl()?.open).toBe(false);

        // Host → dialog through the fake adapter's setOpen.
        await wrapper.setProps({ open: true });
        await nextTick();
        expect(dialogEl()?.open).toBe(true);

        // Internal close routes back out through the fake adapter's onOpenChange.
        (document.querySelector('.ori-dialog__close') as HTMLButtonElement).click();
        await nextTick();
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
        expect(dialogEl()?.open).toBe(false);
    });

    it('works with no adapter wired — native is the default engine', async () => {
        // The dialog no longer needs an injected adapter: useDialog() falls back to the native engine.
        mountDialog({ title: 'x', defaultOpen: true });
        await nextTick();

        expect(dialogEl()).not.toBeNull();
        expect(dialogEl()?.open).toBe(true);
    });

    it('honors a custom dialog adapter swapped in via OriHeadless', async () => {
        mountDialog({ defaultOpen: true }, {}, [[OriHeadless, { dialog: fakeDialog }]]);
        await nextTick();

        // The fake adapter uses a fixed base id, so this proves the swapped adapter (not the native
        // default, which uses useId()) produced the prop bags — the contract is still swappable.
        expect(dialogEl()?.getAttribute('aria-labelledby')).toBe('test-dialog-title');
        expect(dialogEl()?.open).toBe(true);
    });

    it('has no axe violations while open', async () => {
        mountDialog({ title: 'Confirm', defaultOpen: true }, { default: () => 'Body copy.' });
        await nextTick();

        const dialog = dialogEl() as HTMLElement;
        await expectNoA11yViolations(dialog);
    });
});
