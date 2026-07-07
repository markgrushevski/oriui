import { test, expect } from '@playwright/test';

// Interaction e2e for OriMenu — a WAI-ARIA menu button with ROVING TABINDEX. Unlike the combobox, real
// DOM focus MOVES onto the highlighted item (the SFC focuses `[data-highlighted]` on every change).
// Asserts the real mechanism:
//   • trigger carries aria-haspopup=menu, aria-controls -> the content id, aria-expanded.
//   • content carries role=menu; items carry role=menuitem; the disabled item carries aria-disabled
//     and is skipped by arrow navigation.
//   • ArrowUp/Down + Home/End move focus; Enter/Space activate (emit `select`) + close + restore focus
//     to the trigger; Escape closes + restores focus without selecting.
test.describe('OriMenu — keyboard + roving focus (real Chromium)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#menu');
        await expect(page.getByTestId('menu-trigger')).toBeVisible();
    });

    test('roles + ArrowDown opens and roves focus to the first item', async ({ page }) => {
        const trigger = page.getByTestId('menu-trigger');
        await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(await trigger.getAttribute('aria-controls')).toBe(
            await page.locator('[role="menu"]').getAttribute('id')
        );

        await trigger.focus();
        await page.keyboard.press('ArrowDown');

        await expect(page.getByRole('menu')).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(page.getByRole('menuitem')).toHaveCount(4);
        await expect(page.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute('aria-disabled', 'true');
        // Roving tabindex: real DOM focus is on the first item.
        await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    });

    test('Arrow navigation skips the disabled item; Home/End jump to the ends', async ({ page }) => {
        const trigger = page.getByTestId('menu-trigger');
        await trigger.focus();
        await page.keyboard.press('ArrowDown'); // open -> Edit
        await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();

        await page.keyboard.press('ArrowDown'); // Duplicate
        await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
        await page.keyboard.press('ArrowDown'); // skips disabled Archive -> Delete
        await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeFocused();

        await page.keyboard.press('Home');
        await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
        await page.keyboard.press('End');
        await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeFocused();

        // ArrowUp from Delete also skips Archive, back to Duplicate.
        await page.keyboard.press('ArrowUp');
        await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
    });

    test('Enter activates the highlighted item, closes, and restores focus to the trigger', async ({ page }) => {
        const trigger = page.getByTestId('menu-trigger');
        await trigger.focus();
        await page.keyboard.press('ArrowUp'); // open -> last enabled (Delete)
        await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeFocused();

        await page.keyboard.press('Enter');
        await expect(page.getByTestId('selected')).toHaveText('delete');
        await expect(page.getByRole('menu')).toBeHidden();
        await expect(trigger).toBeFocused();
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('Space activates the highlighted item', async ({ page }) => {
        const trigger = page.getByTestId('menu-trigger');
        await trigger.focus();
        await page.keyboard.press('ArrowDown'); // open -> Edit
        await page.keyboard.press('ArrowDown'); // Duplicate
        await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();

        await page.keyboard.press('Space');
        await expect(page.getByTestId('selected')).toHaveText('duplicate');
        await expect(page.getByRole('menu')).toBeHidden();
    });

    test('Escape closes without selecting and restores focus to the trigger', async ({ page }) => {
        const trigger = page.getByTestId('menu-trigger');
        await trigger.focus();
        await page.keyboard.press('ArrowDown'); // open -> Edit
        await expect(page.getByRole('menu')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.getByRole('menu')).toBeHidden();
        await expect(trigger).toBeFocused();
        await expect(page.getByTestId('selected')).toHaveText('');
    });
});
