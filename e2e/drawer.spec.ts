import { test, expect, type Locator, type Page } from '@playwright/test'

// OriDrawer in real Chromium: where each side docks, the phone-width strip, RTL, the scroll lock that
// showModal() does not provide, and the non-modal drawer (a manual popover) living in the top layer
// while the page stays live. Geometry, top layer and scrolling are all beyond happy-dom.

const modal = (page: Page) => page.locator('dialog.ori-drawer:not([popover])')
const panel = (page: Page) => page.locator('dialog.ori-drawer[popover]')

// The slide-in is a 0.25s transition; geometry is read once the drawer has come to rest.
async function settledBox(drawer: Locator) {
    await expect
        .poll(() => drawer.evaluate((el) => el.getAnimations().filter((a) => a.playState === 'running').length))
        .toBe(0)
    return (await drawer.boundingBox())!
}

async function wheelOver(page: Page, x: number, y: number): Promise<number> {
    const before = await page.evaluate(() => scrollY)
    await page.mouse.move(x, y)
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(300)
    return (await page.evaluate(() => scrollY)) - before
}

test.describe('OriDrawer — modal (real Chromium)', () => {
    test('docks to the end edge, full height, 20rem wide; Escape closes and returns focus', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 })
        await page.goto('/#drawer')
        const trigger = page.getByTestId('open-modal')
        await trigger.click()

        const drawer = modal(page)
        await expect(drawer).toHaveAttribute('open', '')
        expect(await drawer.evaluate((el) => el.matches(':modal'))).toBe(true)
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')

        const box = await settledBox(drawer)
        expect(box.x + box.width).toBeCloseTo(1280, 0)
        expect(box.y).toBe(0)
        expect(box.height).toBeCloseTo(720, 0)
        expect(box.width).toBeCloseTo(320, 0)

        // Focus moved in (the close button is the first focusable).
        expect(await drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true)

        await page.keyboard.press('Escape')
        await expect(drawer).not.toHaveAttribute('open', '')
        await expect(trigger).toBeFocused()
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    test('the start, top and bottom sides dock where they say', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 })

        await page.goto('/?side=start#drawer')
        await page.getByTestId('open-modal').click()
        let box = await settledBox(modal(page))
        expect(box.x).toBe(0)
        expect(box.height).toBeCloseTo(720, 0)

        // Bottom: content height, at most 40rem wide and centered, flush with the bottom edge.
        await page.goto('/?side=bottom#drawer')
        await page.getByTestId('open-modal').click()
        box = await settledBox(modal(page))
        expect(box.width).toBeCloseTo(640, 0)
        expect(box.x).toBeCloseTo((1280 - 640) / 2, 0)
        expect(box.y + box.height).toBeCloseTo(720, 0)
        expect(box.height).toBeLessThan(720 * 0.85 + 1)

        await page.goto('/?side=top#drawer')
        await page.getByTestId('open-modal').click()
        box = await settledBox(modal(page))
        expect(box.y).toBe(0)
        expect(box.width).toBeCloseTo(640, 0)
    })

    test('in RTL, `end` docks to the left', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 })
        await page.goto('/#drawer')
        await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'))
        await page.getByTestId('open-modal').click()
        const box = await settledBox(modal(page))
        expect(box.x).toBe(0)
        expect(box.width).toBeCloseTo(320, 0)
    })

    test('on a phone, a side drawer leaves a strip of the page; a bottom drawer spans the width', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        await page.goto('/#drawer')
        await page.getByTestId('open-modal').click()
        let box = await settledBox(modal(page))
        expect(box.width).toBeCloseTo(360 - 48, 0) // min(20rem, 100% - 3rem)
        expect(box.x).toBeCloseTo(48, 0)

        // A tap on the strip is a tap on the backdrop: it closes the drawer.
        await page.mouse.click(20, 300)
        await expect(modal(page)).not.toHaveAttribute('open', '')

        await page.goto('/?side=bottom#drawer')
        await page.getByTestId('open-modal').click()
        box = await settledBox(modal(page))
        expect(box.width).toBeCloseTo(360, 0)
        expect(box.y + box.height).toBeCloseTo(640, 0)
    })

    test('long content scrolls in the body; the header and the footer stay in view', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 })
        await page.goto('/?side=bottom&long#drawer')
        await page.getByTestId('open-modal').click()
        const box = await settledBox(modal(page))
        expect(box.height).toBeCloseTo(720 * 0.85, 0)

        const body = modal(page).locator('.ori-drawer__body')
        expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
        await expect(page.getByTestId('apply')).toBeInViewport()
        await expect(modal(page).locator('.ori-drawer__close')).toBeInViewport()

        await body.evaluate((el) => el.scrollTo(0, el.scrollHeight))
        await expect(page.getByTestId('apply')).toBeInViewport()
        await expect(modal(page).locator('.ori-drawer__close')).toBeInViewport()
    })

    test('the page does not scroll under an open drawer, and scrolls again once it closes', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 })
        await page.goto('/#drawer')
        await page.getByTestId('open-modal').click()
        await settledBox(modal(page))

        expect(await wheelOver(page, 300, 400)).toBe(0)

        await page.keyboard.press('Escape')
        await expect(modal(page)).not.toHaveAttribute('open', '')
        expect(await wheelOver(page, 300, 400)).toBeGreaterThan(0)
    })
})

test.describe('OriDialog — scroll lock (real Chromium)', () => {
    test('the page does not scroll under an open dialog', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 })
        await page.goto('/#drawer')
        await page.getByTestId('open-dialog').click()
        await expect(page.locator('dialog.ori-dialog')).toHaveAttribute('open', '')

        expect(await wheelOver(page, 100, 600)).toBe(0)

        await page.keyboard.press('Escape')
        expect(await wheelOver(page, 100, 600)).toBeGreaterThan(0)
    })
})

test.describe('OriDrawer — non-modal (real Chromium)', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 })
        await page.goto('/#drawer')
    })

    test('opens in the top layer, out of a transformed and clipping box, with focus inside', async ({ page }) => {
        await page.getByTestId('open-panel').click()
        const drawer = panel(page)
        expect(await drawer.evaluate((el) => el.matches(':popover-open'))).toBe(true)
        expect(await drawer.getAttribute('aria-modal')).toBeNull()

        const box = await settledBox(drawer)
        expect(box.x).toBe(0)
        expect(box.height).toBeCloseTo(720, 0) // not clipped to the 40px box it sits in
        expect(await drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true)

        // Nothing dims or blocks the page.
        expect(await drawer.evaluate((el) => getComputedStyle(el, '::backdrop').backgroundColor)).toBe(
            'rgba(0, 0, 0, 0)'
        )
    })

    test('the page stays live: a press outside closes it and still reaches its target', async ({ page }) => {
        await page.getByTestId('open-panel').click()
        await settledBox(panel(page))

        await page.getByTestId('outside').click()
        await expect(page.getByTestId('outside')).toHaveText('Outside 1')
        expect(await panel(page).evaluate((el) => el.matches(':popover-open'))).toBe(false)
    })

    test('Escape closes it and returns focus to the trigger; the trigger toggles it', async ({ page }) => {
        const trigger = page.getByTestId('open-panel')
        await trigger.click()
        await settledBox(panel(page))
        await page.getByTestId('panel-item').focus()

        await page.keyboard.press('Escape')
        expect(await panel(page).evaluate((el) => el.matches(':popover-open'))).toBe(false)
        await expect(trigger).toBeFocused()

        await trigger.click()
        expect(await panel(page).evaluate((el) => el.matches(':popover-open'))).toBe(true)
        await trigger.click()
        expect(await panel(page).evaluate((el) => el.matches(':popover-open'))).toBe(false)
    })

    test('Escape that dismisses a tooltip inside it leaves it open', async ({ page }) => {
        await page.getByTestId('open-panel').click()
        await settledBox(panel(page))
        await page.getByTestId('panel-tooltip-trigger').focus()

        await page.keyboard.press('Escape')
        expect(await panel(page).evaluate((el) => el.matches(':popover-open'))).toBe(true)
        // The tooltip took that one; the next Escape is the drawer's.
        await page.keyboard.press('Escape')
        expect(await panel(page).evaluate((el) => el.matches(':popover-open'))).toBe(false)
    })

    test('Escape that closes a popover inside it leaves it open', async ({ page }) => {
        await page.getByTestId('open-panel').click()
        await settledBox(panel(page))
        await page.getByTestId('panel-popover-trigger').click()
        const popover = page.getByTestId('panel-popover').locator('xpath=..')
        expect(await popover.evaluate((el) => el.matches(':popover-open'))).toBe(true)

        await page.keyboard.press('Escape')
        expect(await popover.evaluate((el) => el.matches(':popover-open'))).toBe(false)
        expect(await panel(page).evaluate((el) => el.matches(':popover-open'))).toBe(true)
    })

    test('the page scrolls while it is open', async ({ page }) => {
        await page.getByTestId('open-panel').click()
        await settledBox(panel(page))
        expect(await wheelOver(page, 800, 400)).toBeGreaterThan(0)
    })
})

test.describe('OriTooltip on a popover trigger', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#drawer')
    })

    // The popover the trigger opened sits above the tooltip, so one Escape closes it, whether the trigger
    // was clicked or reached by keyboard.
    test('one Escape closes the popover the trigger opened', async ({ page }) => {
        const trigger = page.getByTestId('tooltip-popover-trigger')
        const popover = page.getByTestId('tooltip-popover').locator('xpath=..')

        await trigger.click()
        expect(await popover.evaluate((el) => el.matches(':popover-open'))).toBe(true)
        await page.keyboard.press('Escape')
        expect(await popover.evaluate((el) => el.matches(':popover-open'))).toBe(false)

        await trigger.focus()
        await page.keyboard.press('Enter')
        expect(await popover.evaluate((el) => el.matches(':popover-open'))).toBe(true)
        await page.keyboard.press('Escape')
        expect(await popover.evaluate((el) => el.matches(':popover-open'))).toBe(false)
    })
})
