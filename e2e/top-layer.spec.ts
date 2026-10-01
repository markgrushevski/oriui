import { test, expect, type Locator, type Page } from '@playwright/test'

// The menu and combobox panels open in the top layer (`popover="manual"`). Each sits in a box with a
// transform and overflow:hidden, which would otherwise become the panel's containing block and clip it.
// Proof that a panel escaped: it reports `:popover-open`, it opens right under its trigger, and the
// browser hit-tests its last row (a clipped row would hit the page behind it).

async function hitsItself(page: Page, row: Locator): Promise<boolean> {
    const box = await row.boundingBox()
    if (!box) return false
    return page.evaluate(
        ({ x, y, html }) =>
            document.elementFromPoint(x, y)?.closest('[role="menuitem"],[role="option"]')?.outerHTML === html,
        { x: box.x + box.width / 2, y: box.y + box.height / 2, html: await row.evaluate((el) => el.outerHTML) }
    )
}

test.describe('Anchored panels in the top layer (real Chromium)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#top-layer')
        await expect(page.getByTestId('menu-trigger')).toBeVisible()
    })

    test('a menu inside a transformed, clipping box opens under its trigger, unclipped', async ({ page }) => {
        const trigger = page.getByTestId('menu-trigger')
        await trigger.click()

        const menu = page.locator('.ori-menu')
        await expect(menu).toBeVisible()
        expect(await menu.evaluate((el) => el.matches(':popover-open'))).toBe(true)

        const t = (await trigger.boundingBox())!
        const m = (await menu.boundingBox())!
        expect(Math.abs(m.y - (t.y + t.height))).toBeLessThan(8)
        expect(Math.abs(m.x - t.x)).toBeLessThan(2)

        const box = (await page.getByTestId('menu-box').boundingBox())!
        expect(m.y + m.height).toBeGreaterThan(box.y + box.height) // it does extend past the clipping box
        expect(await hitsItself(page, page.getByRole('menuitem', { name: 'Delete' }))).toBe(true)

        await page.keyboard.press('Escape')
        await expect(menu).toBeHidden()
        expect(await menu.evaluate((el) => el.matches(':popover-open'))).toBe(false)
        await expect(trigger).toBeFocused()
    })

    test('a combobox listbox inside a transformed, clipping box opens under its control, unclipped', async ({
        page
    }) => {
        const input = page.getByRole('combobox')
        await input.focus()
        await page.keyboard.press('ArrowDown')

        const listbox = page.getByRole('listbox')
        await expect(listbox).toBeVisible()
        expect(await listbox.evaluate((el) => el.matches(':popover-open'))).toBe(true)

        const control = (await page.locator('.ori-combobox__control').boundingBox())!
        const l = (await listbox.boundingBox())!
        expect(Math.abs(l.y - (control.y + control.height))).toBeLessThan(8)
        expect(l.width).toBeGreaterThanOrEqual(control.width - 1) // min-width still tracks the control

        const box = (await page.getByTestId('combobox-box').boundingBox())!
        expect(l.y + l.height).toBeGreaterThan(box.y + box.height)
        expect(await hitsItself(page, page.getByRole('option', { name: 'Elderberry' }))).toBe(true)

        // Focus never left the input (aria-activedescendant model), and a click on an option still selects.
        await expect(input).toBeFocused()
        await page.getByRole('option', { name: 'Elderberry' }).click()
        await expect(listbox).toBeHidden()
        await expect(input).toHaveValue('Elderberry')
    })
})
