import { describe, it, expect, afterEach } from 'vitest';
import { h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { OriHeadless } from '@oriui/vue';
import { OriDialog } from '../src';
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
