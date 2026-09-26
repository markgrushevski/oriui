import { test, expect } from '@playwright/test'

// Under an ancestor `dir="rtl"` the first item sits on the right, so ArrowLeft is "next". None of these
// widgets is given a `dir`: the mapping must come from the direction the engine resolved.
test.describe('Roving arrows follow an inherited RTL direction (real Chromium)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#rtl-keys')
        await expect(page.getByRole('toolbar')).toBeVisible()
    })

    test('Tabs: ArrowLeft selects the next tab, ArrowRight the previous one', async ({ page }) => {
        await page.getByRole('tab', { name: 'One' }).focus()

        await page.keyboard.press('ArrowLeft')
        await expect(page.getByRole('tab', { name: 'Two' })).toBeFocused()
        await expect(page.getByTestId('tab-value')).toHaveText('two')

        await page.keyboard.press('ArrowRight')
        await expect(page.getByRole('tab', { name: 'One' })).toBeFocused()
    })

    test('Toolbar: ArrowLeft moves to the next item, ArrowRight to the previous one', async ({ page }) => {
        await page.getByRole('button', { name: 'First' }).focus()

        await page.keyboard.press('ArrowLeft')
        await expect(page.getByRole('button', { name: 'Second' })).toBeFocused()

        await page.keyboard.press('ArrowRight')
        await expect(page.getByRole('button', { name: 'First' })).toBeFocused()
    })

    test('ColorPicker presets: ArrowLeft moves to the next swatch', async ({ page }) => {
        const swatches = page.locator('.ori-color-picker__preset')
        await swatches.nth(0).focus()

        await page.keyboard.press('ArrowLeft')
        await expect(swatches.nth(1)).toBeFocused()
    })

    test('the first item really is on the right', async ({ page }) => {
        const one = await page.getByRole('tab', { name: 'One' }).boundingBox()
        const two = await page.getByRole('tab', { name: 'Two' }).boundingBox()
        expect(one!.x).toBeGreaterThan(two!.x)
    })
})
