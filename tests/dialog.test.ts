import { describe, it, expect, afterEach } from 'vitest';
import { h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { OriHeadless } from '@oriui/vue';
import { OriDialog } from '../src';
import { fakeDialog } from './helpers/fake-dialog';
import { expectNoA11yViolations } from './helpers/axe';

type Props = Record<string, unknown>;
type Slots = Record<string, unknown>;

function mountDialog(props: Props = {}, slots: Slots = {}) {
    return mount(OriDialog, {
        props,
        slots: {
            trigger: (scope: { props: Record<string, unknown> }) =>
                h('button', { ...scope.props, 'data-testid': 'trigger' }, 'Open'),
            ...slots
        },
        global: { plugins: [[OriHeadless, { dialog: fakeDialog }]] },
        attachTo: document.body
    });
}

// OriDialog teleports its overlay to <body>; clear it between tests to keep them isolated.
afterEach(() => {
    document.body.innerHTML = '';
});

describe('OriDialog (headless contract)', () => {
    it('renders only the trigger while closed', async () => {
        const wrapper = mountDialog({ title: 'Confirm' });
        await nextTick();

        expect(wrapper.find('[data-testid="trigger"]').exists()).toBe(true);
        expect(document.querySelector('.ori-dialog__content')).toBeNull();
    });

    it('opens on trigger click with accessible dialog markup', async () => {
        const wrapper = mountDialog({ title: 'Confirm' });
        await nextTick();
        await wrapper.find('[data-testid="trigger"]').trigger('click');

        const content = document.querySelector('.ori-dialog__content');
        expect(content).not.toBeNull();
        expect(content?.getAttribute('role')).toBe('dialog');
        expect(content?.getAttribute('aria-modal')).toBe('true');

        // The title is wired as the dialog's accessible name via aria-labelledby.
        const title = document.querySelector('.ori-dialog__title');
        expect(title?.id).toBe(content?.getAttribute('aria-labelledby'));
        expect(title?.textContent).toContain('Confirm');
    });

    it('projects the default slot as the dialog body', async () => {
        mountDialog({ title: 'Confirm', defaultOpen: true }, { default: () => 'Delete this item?' });
        await nextTick();

        expect(document.querySelector('.ori-dialog__body')?.textContent).toContain('Delete this item?');
    });

    it('closes via the close trigger', async () => {
        mountDialog({ title: 'Confirm', defaultOpen: true });
        await nextTick();
        expect(document.querySelector('.ori-dialog__content')).not.toBeNull();

        (document.querySelector('.ori-dialog__close') as HTMLButtonElement).click();
        await nextTick();

        expect(document.querySelector('.ori-dialog__content')).toBeNull();
    });

    it('fails loud when no dialog adapter is provided', () => {
        // The contract ships no native default for dialogs — a missing adapter must throw with guidance.
        expect(() => mount(OriDialog, { props: { title: 'x' } })).toThrowError(/dialog headless adapter/i);
    });

    it('has no axe violations while open', async () => {
        mountDialog({ title: 'Confirm', defaultOpen: true }, { default: () => 'Body copy.' });
        await nextTick();

        const content = document.querySelector('.ori-dialog__content') as HTMLElement;
        await expectNoA11yViolations(content);
    });
});
