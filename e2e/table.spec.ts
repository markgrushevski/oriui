import { test, expect, type Page } from '@playwright/test'

// OriTable's scroll box is a named, focusable region only while the table overflows it — the axe rule
// scrollable-region-focusable — and adds no tab stop when the table fits. Overflow needs real layout, and
// the region must follow a resize. The sticky header must stay in view while rows scroll under it.
const box = (page: Page, id: string) => page.getByTestId(id).locator('xpath=..')

test.describe('OriTable — scroll box (real Chromium)', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.goto('/#table')
    })

    test('an overflowing table is a named region and one tab stop; a table that fits is neither', async ({ page }) => {
        const wide = box(page, 'wide')
        await expect(wide).toHaveAttribute('role', 'region')
        await expect(wide).toHaveAttribute('tabindex', '0')
        const captionId = await page.getByTestId('wide').locator('caption').getAttribute('id')
        await expect(wide).toHaveAttribute('aria-labelledby', captionId!)

        const fits = box(page, 'fits')
        expect(await fits.getAttribute('role')).toBeNull()
        expect(await fits.getAttribute('tabindex')).toBeNull()

        // Keyboard: the wide box is a stop and scrolls with the arrow keys; the fitting one is skipped.
        await page.getByTestId('before').focus()
        await page.keyboard.press('Tab')
        await expect(wide).toBeFocused()
        await page.keyboard.press('ArrowRight')
        await expect.poll(() => wide.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
        await page.keyboard.press('Tab')
        await expect(box(page, 'tall')).toBeFocused() // past "fits", straight to the scrolling tall box
    })

    test('the region and the tab stop follow a resize', async ({ page }) => {
        const wide = box(page, 'wide')
        await expect(wide).toHaveAttribute('tabindex', '0')
        await page.getByTestId('before').click() // widen the box: the table now fits
        await expect.poll(() => wide.getAttribute('tabindex')).toBeNull()
        expect(await wide.getAttribute('role')).toBeNull()
        await page.getByTestId('before').click()
        await expect(wide).toHaveAttribute('tabindex', '0')
    })

    test('the sticky header stays at the top of the box while the rows scroll', async ({ page }) => {
        const tall = box(page, 'tall')
        const top = (await tall.boundingBox())!.y
        await tall.evaluate((el) => el.scrollTo(0, 400))
        const header = (await page.getByTestId('tall').locator('thead th').first().boundingBox())!
        expect(Math.abs(header.y - top)).toBeLessThan(1)
    })

    test('numeric cells align to the end and use tabular figures', async ({ page }) => {
        const cell = page.getByTestId('wide').locator('tbody td.ori-table__num').first()
        const style = await cell.evaluate((el) => {
            const cs = getComputedStyle(el)
            return { align: cs.textAlign, nums: cs.fontVariantNumeric }
        })
        expect(style.align).toBe('end')
        expect(style.nums).toContain('tabular-nums')
    })
})
