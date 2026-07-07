import { test, expect } from '@playwright/test';

// Interaction e2e for OriCombobox — real keyboard + focus flows against the mounted Vue component
// (harness at /#combobox). Asserts the REAL WAI-ARIA listbox mechanism the component emits:
//   • input carries role=combobox + aria-autocomplete=list + aria-expanded, aria-controls -> the
//     listbox id, and aria-activedescendant -> the highlighted option's id. DOM focus STAYS on the
//     input — the active option is tracked via aria-activedescendant, NOT roving focus (contrast: menu).
//   • each option carries role=option + aria-selected; the active one carries data-highlighted="".
//   • the listbox opens on typing / ArrowDown / the trigger button — NOT on focus alone.
test.describe('OriCombobox — keyboard + focus (real Chromium)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#combobox');
        await expect(page.getByRole('combobox')).toBeVisible();
    });

    test('roles + aria wiring; the trigger button opens the listbox (focus alone does not)', async ({ page }) => {
        const input = page.getByRole('combobox');
        await expect(input).toHaveAttribute('aria-autocomplete', 'list');
        await expect(input).toHaveAttribute('aria-expanded', 'false');

        // aria-controls references the listbox id even while closed.
        const listbox = page.locator('[role="listbox"]');
        expect(await input.getAttribute('aria-controls')).toBe(await listbox.getAttribute('id'));
        await expect(listbox).toBeHidden();

        // Focus alone must NOT open the listbox.
        await input.focus();
        await expect(input).toHaveAttribute('aria-expanded', 'false');

        // The chevron trigger toggles it open (aria-label flips Open/Close suggestions).
        await page.getByRole('button', { name: 'Open suggestions' }).click();
        await expect(input).toHaveAttribute('aria-expanded', 'true');
        await expect(listbox).toBeVisible();
        await expect(page.getByRole('option')).toHaveCount(5);
    });

    test('ArrowDown/ArrowUp move the active option; the disabled option is skipped', async ({ page }) => {
        const input = page.getByRole('combobox');
        await input.focus();

        // The first ArrowDown opens AND highlights the first option.
        await page.keyboard.press('ArrowDown');
        await expect(input).toHaveAttribute('aria-expanded', 'true');
        const active = page.locator('[role="option"][data-highlighted]');
        await expect(active).toHaveText('Apple');
        // aria-activedescendant points at exactly the highlighted option's id.
        expect(await input.getAttribute('aria-activedescendant')).toBe(await active.getAttribute('id'));

        await page.keyboard.press('ArrowDown');
        await expect(active).toHaveText('Banana');
        await page.keyboard.press('ArrowUp');
        await expect(active).toHaveText('Apple');

        // Walk down to Cherry, then one more ArrowDown must skip the disabled "Date" and land on Elderberry.
        await page.keyboard.press('ArrowDown'); // Banana
        await page.keyboard.press('ArrowDown'); // Cherry
        await expect(active).toHaveText('Cherry');
        await page.keyboard.press('ArrowDown'); // skips Date -> Elderberry
        await expect(active).toHaveText('Elderberry');

        // The combobox never moved DOM focus off the input (aria-activedescendant pattern).
        await expect(input).toBeFocused();
    });

    test('typeahead filters the list; Enter commits the selection and closes', async ({ page }) => {
        const input = page.getByRole('combobox');
        await input.focus();
        await input.pressSequentially('cher');

        // Typing filters (case-insensitive substring on the label) and opens the listbox.
        await expect(input).toHaveAttribute('aria-expanded', 'true');
        const options = page.locator('[role="option"]');
        await expect(options).toHaveCount(1);
        await expect(options).toHaveText('Cherry');

        await page.keyboard.press('ArrowDown'); // highlight the sole match
        await page.keyboard.press('Enter'); // commit

        await expect(input).toHaveValue('Cherry');
        await expect(input).toHaveAttribute('aria-expanded', 'false');
        await expect(page.locator('[role="listbox"]')).toBeHidden();
        await expect(page.getByTestId('cb-model')).toHaveText('cherry');
    });

    test('Escape closes without selecting and keeps focus on the input', async ({ page }) => {
        const input = page.getByRole('combobox');
        await input.focus();
        await page.keyboard.press('ArrowDown'); // open + highlight
        await expect(page.locator('[role="listbox"]')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(input).toHaveAttribute('aria-expanded', 'false');
        await expect(page.locator('[role="listbox"]')).toBeHidden();
        await expect(input).toBeFocused();
        await expect(input).toHaveValue(''); // nothing committed
        await expect(page.getByTestId('cb-model')).toHaveText('');
    });

    test('no matches shows the empty message and stays open', async ({ page }) => {
        const input = page.getByRole('combobox');
        await input.focus();
        await input.pressSequentially('zzz');

        await expect(input).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('[role="option"]')).toHaveCount(0);
        await expect(page.getByText('No results')).toBeVisible();
    });
});
