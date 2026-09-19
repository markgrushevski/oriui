import { test, expect, type Page } from '@playwright/test'

/**
 * The roving tabindex, exercised instead of inspected. `tests/tabs.test.ts` drives
 * `trigger('keydown', { key: 'ArrowRight' })` on a wrapper and then asserts the `tabindex` attributes —
 * which proves the bookkeeping, not the thing the bookkeeping exists for. happy-dom has no real focus
 * model (NOTES.md records that it will happily focus a `<div>` with no tabindex), so in the unit suite
 * "focus moved to the next tab" is not a statement that can be made at all.
 *
 * What only an engine can answer: does Tab step into the group EXACTLY ONCE and then leave it, does
 * arrow focus actually land on the next tab, is the disabled tab skipped by focus as well as by
 * selection, and does the vertical orientation really swap the arrow axis.
 */

const tab = (page: Page, scope: string, index: number) =>
    page.locator(`[data-testid=${scope}] .ori-tabs__tab`).nth(index)

const focusedLabel = (page: Page) => page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
const focusedTestId = (page: Page) => page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? '')

test.describe('OriTabs — roving focus in a real engine', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#tabs')
        await page.locator('[data-testid=horizontal] .ori-tabs__tab').first().waitFor()
    })

    test('the whole tablist is ONE tab stop: Tab enters it once and the next Tab leaves it', async ({ page }) => {
        await page.locator('[data-testid=before]').focus()

        await page.keyboard.press('Tab')
        expect(await focusedLabel(page), 'Tab did not land on the selected tab').toBe('Overview')

        // The point of a roving tabindex: the other three tabs are NOT tab stops. One more Tab must be
        // past the whole group. (The panel is focusable by design — APG allows a tabindex=0 tabpanel —
        // so the next stop is the panel, not the button after it.)
        await page.keyboard.press('Tab')
        expect(await focusedLabel(page), 'Tab stopped on a second tab — the group is not one stop').not.toBe('Specs')
    })

    test('ArrowRight moves real focus and skips the disabled tab', async ({ page }) => {
        await tab(page, 'horizontal', 0).focus()

        await page.keyboard.press('ArrowRight')
        expect(await focusedLabel(page), 'focus did not follow ArrowRight').toBe('Specs')
        await expect(page.locator('[data-testid=horizontal-value]')).toHaveText('specs')

        // "Archive" is disabled and sits between Specs and Reviews: automatic activation must step over
        // it in the FOCUS order too, not merely refuse to select it.
        await page.keyboard.press('ArrowRight')
        expect(await focusedLabel(page), 'focus landed on the disabled tab').toBe('Reviews')
        await expect(page.locator('[data-testid=horizontal-value]')).toHaveText('reviews')
    })

    test('ArrowRight wraps from the last tab to the first', async ({ page }) => {
        await tab(page, 'horizontal', 3).focus()
        await page.keyboard.press('ArrowRight')
        expect(await focusedLabel(page)).toBe('Overview')
    })

    test('Home and End jump to the first and last enabled tab', async ({ page }) => {
        await tab(page, 'horizontal', 0).focus()

        await page.keyboard.press('End')
        expect(await focusedLabel(page), 'End did not reach the last enabled tab').toBe('Reviews')

        await page.keyboard.press('Home')
        expect(await focusedLabel(page), 'Home did not reach the first tab').toBe('Overview')
    })

    test('the vertical tablist swaps the arrow axis', async ({ page }) => {
        const list = page.locator('[data-testid=vertical] .ori-tabs__list')
        await expect(list).toHaveAttribute('aria-orientation', 'vertical')

        await tab(page, 'vertical', 0).focus()

        // Down moves; Right must NOT, or a vertical list would answer to both axes and the orientation
        // would be decoration.
        await page.keyboard.press('ArrowDown')
        expect(await focusedLabel(page), 'ArrowDown did not move in a vertical tablist').toBe('Specs')

        await page.keyboard.press('ArrowRight')
        expect(await focusedLabel(page), 'ArrowRight moved focus in a VERTICAL tablist').toBe('Specs')
    })

    test('a click selects, and focus lands where the pointer did', async ({ page }) => {
        await tab(page, 'horizontal', 1).click()
        await expect(page.locator('[data-testid=horizontal-value]')).toHaveText('specs')
        expect(await focusedLabel(page)).toBe('Specs')

        // And the roving bookkeeping followed the pointer, so the next Tab still enters at the selected
        // tab rather than at a stale one.
        await page.locator('[data-testid=before]').focus()
        await page.keyboard.press('Tab')
        expect(await focusedLabel(page), 'the tab stop did not follow the pointer selection').toBe('Specs')
    })

    test('the disabled tab is not reachable by pointer either', async ({ page }) => {
        const archive = tab(page, 'horizontal', 2)
        await expect(archive).toBeDisabled()

        await archive.dispatchEvent('click')
        await expect(page.locator('[data-testid=horizontal-value]'), 'a disabled tab was selected').not.toHaveText(
            'archive'
        )
        expect(await focusedTestId(page)).not.toBe('archive')
    })
})
