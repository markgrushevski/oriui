import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { OriHeadless } from '@oriui/headless/vue';
import { OriCombobox } from '@oriui/vue';
import { zagCombobox } from './helpers/zag-combobox';

// PoC / seam proof: the SAME OriCombobox SFC, unmodified, driven by the REAL `@zag-js/combobox`
// machine instead of oriUI's native core — swapped in purely through the `OriHeadless` plugin
// (`{ combobox: zagCombobox }`). If these pass, the "swappable adapter" contract genuinely accepts a
// third-party engine with zero component changes. See tests/helpers/zag-combobox.ts for the adapter.
//
// A tiny settle helper: Zag's machine flushes some transitions on the microtask queue.
const settle = async () => {
    await nextTick();
    await Promise.resolve();
    await nextTick();
};

const OPTIONS = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry', disabled: true },
    { label: 'Grape', value: 'grape' }
];

const mountZag = (props = {}) =>
    mount(OriCombobox, {
        props: { options: OPTIONS, label: 'Fruit', ...props },
        attachTo: document.body, // Zag resolves elements by id via real DOM queries
        global: { plugins: [[OriHeadless, { combobox: zagCombobox }] as never] }
    });

describe('PoC — OriCombobox driven by the real @zag-js/combobox engine', () => {
    it('renders the WAI-ARIA shell from Zag (role=combobox + listbox + options)', async () => {
        const wrapper = mountZag();
        await settle();

        const input = wrapper.find('input[role="combobox"]');
        expect(input.exists()).toBe(true);
        expect(input.attributes('aria-expanded')).toBe('false');

        const listbox = wrapper.find('[role="listbox"]');
        expect(listbox.exists()).toBe(true);
        expect(input.attributes('aria-controls')).toBe(listbox.attributes('id'));

        // options come from the Zag-fed collection, and the disabled one is marked by Zag
        const opts = wrapper.findAll('[role="option"]');
        expect(opts.map((o) => o.text())).toEqual(['Apple', 'Banana', 'Cherry', 'Grape']);
        expect(opts[2].attributes('aria-disabled')).toBe('true');

        wrapper.unmount();
    });

    it('typing filters through Zag onInputValueChange', async () => {
        const wrapper = mountZag();
        await settle();

        // Zag (correctly, unlike our native core) gates interaction on focus — focus before typing.
        const input = wrapper.find('input');
        (input.element as HTMLInputElement).focus();
        await input.trigger('focus');
        await input.setValue('ap');
        await settle();

        expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');
        // "ap" matches Apple + grAPe (substring) — the filter runs inside the Zag adapter
        expect(wrapper.findAll('[role="option"]').map((o) => o.text())).toEqual(['Apple', 'Grape']);

        wrapper.unmount();
    });

    it('keyboard navigation + Enter selects via Zag and emits the highlighted value', async () => {
        const wrapper = mountZag();
        await settle();
        const input = wrapper.find('input');
        (input.element as HTMLInputElement).focus();
        await input.trigger('focus');

        // Open, then ensure an item is highlighted. Zag's auto-highlight-on-open differs from our
        // native core (native highlights the first item on the opening ArrowDown), so drive it until
        // `aria-activedescendant` (Zag-managed on the input) points at a real option.
        await input.trigger('keydown', { key: 'ArrowDown' });
        await settle();
        expect(input.attributes('aria-expanded')).toBe('true');
        if (!input.attributes('aria-activedescendant')) {
            await input.trigger('keydown', { key: 'ArrowDown' });
            await settle();
        }
        const activeId = input.attributes('aria-activedescendant');
        expect(activeId).toBeTruthy();
        // Zag ids contain `::`, which are invalid in a CSS `#id` selector — match by attribute in JS.
        const highlightedLabel = wrapper
            .findAll('[role="option"]')
            .find((o) => o.attributes('id') === activeId)
            ?.text();
        expect(highlightedLabel).toBeTruthy();

        await input.trigger('keydown', { key: 'Enter' });
        await settle();

        // Zag committed the highlighted item; the SFC's v-model watcher pushed out its VALUE
        const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0];
        expect(emitted).toBe(OPTIONS.find((o) => o.label === highlightedLabel)?.value);

        wrapper.unmount();
    });

    it('clicking an option selects it through Zag', async () => {
        const wrapper = mountZag();
        await settle();
        const input = wrapper.find('input');
        (input.element as HTMLInputElement).focus();
        await input.trigger('focus');

        await input.trigger('keydown', { key: 'ArrowDown' }); // open
        await settle();
        await wrapper.findAll('[role="option"]')[1].trigger('click'); // Banana
        await settle();

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['banana']);

        wrapper.unmount();
    });
});
