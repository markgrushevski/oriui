import { test, expect } from '@playwright/test';

// Interaction e2e for OriDialog — the default engine is the NATIVE <dialog> element driven by
// showModal(), so the focus trap, Escape-to-close and focus-return are BROWSER-NATIVE, not a JS trap
// (see NOTES.md "Dialog runs on the native <dialog> element"). These specs assert the observable native
// behavior: focus enters the dialog on open, Tab/Shift+Tab cycle WITHIN it (never reaching the outside
// control), Escape and the close button close it and return focus to the trigger. aria: role=dialog +
// aria-modal=true, aria-labelledby -> the title (id `${baseId}-title`, no `ori-` prefix).
test.describe('OriDialog — native <dialog> focus trap (real Chromium)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#dialog');
        await expect(page.getByTestId('open')).toBeVisible();
    });

    const focusIsInsideDialog = (page: import('@playwright/test').Page) =>
        page.evaluate(() => {
            const dlg = document.querySelector('dialog');
            return !!dlg && dlg.contains(document.activeElement);
        });

    // Classify the focused element by a stable label (data-testid where present, else the close button
    // by its aria-label, else `body` — which the native modal uses as its tab-cycle wrap boundary).
    const activeLabel = (page: import('@playwright/test').Page) =>
        page.evaluate(() => {
            const el = document.activeElement as HTMLElement | null;
            if (!el || el === document.body) return 'body';
            const testid = el.getAttribute('data-testid');
            if (testid) return testid; // outside | open | first | last
            if (el.getAttribute('aria-label') === 'Close') return 'close';
            return el.tagName.toLowerCase();
        });

    test('opening moves focus into the dialog; aria-modal + labelling are wired', async ({ page }) => {
        const trigger = page.getByTestId('open');
        await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');

        await trigger.click();

        const dialog = page.locator('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAttribute('aria-modal', 'true');
        await expect(dialog).toHaveAttribute('role', 'dialog');
        await expect(dialog).toHaveAccessibleName('Edit profile');
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');

        // showModal() moves focus INTO the dialog (Chromium focuses the first focusable descendant).
        expect(await focusIsInsideDialog(page)).toBe(true);
    });

    test('Tab is trapped inside the dialog and cannot reach the outside controls', async ({ page }) => {
        await page.getByTestId('open').click();
        await expect(page.locator('dialog')).toBeVisible();

        // Native <dialog> contains focus within its scope — the dialog's focusables plus `document.body`
        // as the wrap boundary (NOT a JS trap that jumps last->first directly). Walk a full forward cycle
        // from the first focusable and assert focus visits every inner control, wraps, and NEVER escapes
        // to the trigger or the outside button.
        await page.getByRole('button', { name: 'Close' }).focus();
        const forward: string[] = [];
        for (let i = 0; i < 6; i++) {
            await page.keyboard.press('Tab');
            forward.push(await activeLabel(page));
        }
        expect(forward).toContain('close');
        expect(forward).toContain('first');
        expect(forward).toContain('last');
        expect(forward).not.toContain('outside');
        expect(forward).not.toContain('open'); // the trigger, outside the dialog

        // Reverse (Shift+Tab) is likewise contained.
        const backward: string[] = [];
        for (let i = 0; i < 6; i++) {
            await page.keyboard.press('Shift+Tab');
            backward.push(await activeLabel(page));
        }
        expect(backward).not.toContain('outside');
        expect(backward).not.toContain('open');
        // After all that tabbing, focus is still contained (inside the dialog, or on the body boundary).
        const label = await activeLabel(page);
        expect(['close', 'first', 'last', 'body']).toContain(label);
        if (label !== 'body') expect(await focusIsInsideDialog(page)).toBe(true);
    });

    test('Escape closes and returns focus to the trigger', async ({ page }) => {
        const trigger = page.getByTestId('open');
        await trigger.click();
        await expect(page.locator('dialog')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator('dialog')).toBeHidden();
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger).toBeFocused();
    });

    test('the close button closes and returns focus to the trigger', async ({ page }) => {
        const trigger = page.getByTestId('open');
        await trigger.click();
        await expect(page.locator('dialog')).toBeVisible();

        await page.getByRole('button', { name: 'Close' }).click();
        await expect(page.locator('dialog')).toBeHidden();
        await expect(trigger).toBeFocused();
    });
});
