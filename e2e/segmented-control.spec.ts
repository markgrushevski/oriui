import { test, expect } from '@playwright/test'

// OriSegmentedControl is a native radio group under its styles, so the browser owns the keyboard: one Tab
// stop on the checked segment, arrows move AND check, a disabled segment is skipped, RTL mirrors the
// arrows, and the value submits with the form. These assert the browser really does all of that here.
test.describe('OriSegmentedControl — native radio keyboard (real Chromium)', () => {
    test('one Tab stop; arrows check the next segment and skip the disabled one', async ({ page }) => {
        await page.goto('/#segmented')
        await page.getByTestId('before').focus()
        await page.keyboard.press('Tab')
        const light = page.getByRole('radio', { name: 'Light' })
        await expect(light).toBeFocused()
        await expect(light).toBeChecked()

        await page.keyboard.press('ArrowRight') // skips the disabled "Auto"
        await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked()
        await expect(page.getByTestId('model')).toHaveText('dark')

        // The focus ring is drawn on the visible segment, not the hidden input.
        const outline = await page
            .locator('.ori-segmented-control__item', { hasText: 'Dark' })
            .evaluate((el) => getComputedStyle(el).outlineStyle)
        expect(outline).toBe('solid')

        await page.keyboard.press('Tab')
        await expect(page.getByTestId('submit')).toBeFocused() // the group was a single stop
    })

    test('in RTL the arrows follow the reading direction', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', "WebKit's native radios keep physical arrows in RTL")
        await page.goto('/?rtl#segmented')
        await page.getByRole('radio', { name: 'Light' }).focus()
        await page.keyboard.press('ArrowLeft') // "next" in RTL
        await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked()
    })

    test('the checked value submits with the form', async ({ page }) => {
        await page.goto('/#segmented')
        await page.locator('.ori-segmented-control__item', { hasText: 'Sepia' }).click()
        await page.getByTestId('submit').click()
        await expect(page.getByTestId('submitted')).toHaveText('sepia')
    })
})
