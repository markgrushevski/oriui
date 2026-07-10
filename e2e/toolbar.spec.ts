import { test, expect, type Page } from '@playwright/test';

// Interaction e2e for OriToolbar — a WAI-ARIA toolbar is ONE tab stop with a ROVING TABINDEX; arrow keys
// move REAL DOM focus (not aria-activedescendant), the mechanism happy-dom can't faithfully exercise. The
// harness (/#toolbar) mounts a real OriToolbar (four buttons incl. one disabled, a separator, a
// single-select toggle group) bracketed by `before`/`after` buttons. Asserts the APG contract in real
// Chromium:
//   • roles + one tab stop: Tab ENTERS onto the first item; Tab/Shift+Tab LEAVE to after/before.
//   • Left/Right move real focus across the buttons and into the toggle group; the separator is skipped.
//   • Home/End jump to the ends; navigation WRAPS first<->last (loop) and never escapes via arrows.
//   • the disabled item is reachable by arrows (WAI-ARIA discoverability) but cannot be activated.
test.describe('OriToolbar — roving focus + keyboard (real Chromium)', () => {
    // Each toolbar control is a real <button> named by its aria-label; resolve them by role + name.
    const item = (page: Page, name: string) => page.getByRole('button', { name });

    test.beforeEach(async ({ page }) => {
        await page.goto('/#toolbar');
        await expect(page.getByRole('toolbar')).toBeVisible();
    });

    test('roles + a single tab stop: Tab enters onto the first item (roving tabindex)', async ({ page }) => {
        const toolbar = page.getByRole('toolbar');
        await expect(toolbar).toHaveAttribute('aria-label', 'Formatting');
        // 'horizontal' is the ARIA implicit default → aria-orientation is omitted.
        expect(await toolbar.getAttribute('aria-orientation')).toBeNull();

        // The separator is perpendicular (vertical) to the horizontal bar and non-focusable.
        await expect(page.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');

        // Roving tabindex: exactly the first item is tabbable (0), every other item is -1.
        await expect(item(page, 'Bold')).toHaveAttribute('tabindex', '0');
        await expect(item(page, 'Italic')).toHaveAttribute('tabindex', '-1');
        await expect(item(page, 'Align right')).toHaveAttribute('tabindex', '-1');

        // Tab from the control BEFORE the toolbar lands on the first item — the toolbar is one tab stop.
        await page.getByTestId('before').focus();
        await page.keyboard.press('Tab');
        await expect(item(page, 'Bold')).toBeFocused();
    });

    test('Left/Right move real focus across buttons, skip the separator, into the toggle group', async ({ page }) => {
        await item(page, 'Bold').focus();

        await page.keyboard.press('ArrowRight');
        await expect(item(page, 'Italic')).toBeFocused();
        // Roving tabindex follows the real focus.
        await expect(item(page, 'Italic')).toHaveAttribute('tabindex', '0');
        await expect(item(page, 'Bold')).toHaveAttribute('tabindex', '-1');

        await page.keyboard.press('ArrowRight');
        await expect(item(page, 'Underline')).toBeFocused(); // disabled, but roving still visits it
        await page.keyboard.press('ArrowRight');
        await expect(item(page, 'Strikethrough')).toBeFocused();
        await page.keyboard.press('ArrowRight'); // crosses the separator straight into the toggle group
        await expect(item(page, 'Align left')).toBeFocused();

        await page.keyboard.press('ArrowLeft'); // and back over the separator
        await expect(item(page, 'Strikethrough')).toBeFocused();
    });

    test('Home and End jump to the first and last items', async ({ page }) => {
        await item(page, 'Bold').focus();
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');
        await expect(item(page, 'Underline')).toBeFocused();

        await page.keyboard.press('End');
        await expect(item(page, 'Align right')).toBeFocused();
        await page.keyboard.press('Home');
        await expect(item(page, 'Bold')).toBeFocused();
    });

    test('arrow navigation wraps first<->last and never escapes the toolbar', async ({ page }) => {
        await item(page, 'Bold').focus();

        // Backward from the first item wraps to the last (loop is on by default).
        await page.keyboard.press('ArrowLeft');
        await expect(item(page, 'Align right')).toBeFocused();

        // Forward from the last item wraps back to the first — arrows stay INSIDE, never reaching `after`.
        await page.keyboard.press('ArrowRight');
        await expect(item(page, 'Bold')).toBeFocused();
        await expect(page.getByTestId('after')).not.toBeFocused();
    });

    test('Tab and Shift+Tab leave the toolbar to the surrounding tab stops', async ({ page }) => {
        // Move the roving tab stop onto a MIDDLE item, then Tab must still exit to `after` (one tab stop —
        // the other items are tabindex=-1, so Tab skips them).
        await item(page, 'Bold').focus();
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');
        await expect(item(page, 'Underline')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.getByTestId('after')).toBeFocused();

        // Shift+Tab from within the toolbar exits backward to `before`.
        await item(page, 'Strikethrough').focus();
        await page.keyboard.press('Shift+Tab');
        await expect(page.getByTestId('before')).toBeFocused();
    });

    test('the disabled item is reachable by arrows but cannot be activated', async ({ page }) => {
        // Baseline: an ENABLED item activates on Enter — the contrast the disabled no-op is measured against.
        await item(page, 'Bold').focus();
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('activated')).toHaveText('bold');

        // Arrow onto the disabled item: it is focusable + aria-disabled (WAI-ARIA discoverability).
        await page.keyboard.press('Home');
        await page.keyboard.press('ArrowRight'); // Italic
        await page.keyboard.press('ArrowRight'); // Underline (disabled)
        const underline = item(page, 'Underline');
        await expect(underline).toBeFocused();
        await expect(underline).toHaveAttribute('aria-disabled', 'true');

        // Enter/Space do NOT activate it — `activated` never gains `underline`.
        await page.keyboard.press('Enter');
        await page.keyboard.press('Space');
        await expect(page.getByTestId('activated')).toHaveText('bold');
    });
});
