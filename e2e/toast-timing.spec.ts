import { test, expect } from '@playwright/test'

// WCAG 2.2.1: a toast must not disappear while someone is reading or operating it. The harness pushes a
// 1.5 s toast with an Undo action.
test.describe('OriToaster — countdowns pause for the pointer and focus (real Chromium)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#toast')
        await page.getByTestId('push').click()
        await expect(page.locator('.ori-toast')).toBeVisible()
    })

    test('hovering a toast keeps it until the pointer leaves', async ({ page }) => {
        await page.locator('.ori-toast').hover()
        await page.waitForTimeout(2500)
        await expect(page.locator('.ori-toast')).toBeVisible()

        await page.mouse.move(0, 0)
        await expect(page.locator('.ori-toast')).toHaveCount(0, { timeout: 3000 })
    })

    test('the hotkey reaches the action, and focus keeps the toast until it is used', async ({ page }) => {
        await page.mouse.move(0, 0)
        await page.keyboard.press('F8')
        await expect(page.getByRole('region', { name: 'Notifications (F8)' })).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.getByRole('button', { name: 'Undo' })).toBeFocused()
        await page.waitForTimeout(2500)
        await expect(page.locator('.ori-toast')).toBeVisible()

        await page.keyboard.press('Enter')
        await expect(page.getByTestId('undone')).toHaveText('1')
        await expect(page.getByText('File deleted')).toHaveCount(0)
    })

    test('after a mouse click on the action, the next toast still leaves on time', async ({ page }) => {
        await page.getByRole('button', { name: 'Undo' }).click()
        await page.mouse.move(0, 0)
        await expect(page.getByText('Restored')).toBeVisible()
        await expect(page.locator('.ori-toast')).toHaveCount(0, { timeout: 3000 })
    })

    test('closing the last toast from the keyboard returns focus to where the hotkey was pressed', async ({ page }) => {
        await page.mouse.move(0, 0)
        await page.getByTestId('push').focus()
        await page.keyboard.press('F8')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Enter')

        await expect(page.getByTestId('push')).toBeFocused()
        await expect(page.locator('.ori-toast')).toHaveCount(0, { timeout: 3000 }) // Restored leaves on time
    })

    test('without the pointer or focus, the toast leaves on time', async ({ page }) => {
        await page.mouse.move(0, 0)
        await expect(page.locator('.ori-toast')).toHaveCount(0, { timeout: 3000 })
    })
})
