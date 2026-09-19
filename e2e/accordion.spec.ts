import { test, expect, type Page } from '@playwright/test'

/**
 * `OriAccordion` is native `<details>`/`<summary>`, and its single-open mode is the PLATFORM
 * exclusive-accordion feature: every `<details>` carries the same `name`, and the browser closes the
 * siblings. The unit suite can only assert that the attribute is present and shared — happy-dom does
 * not implement the behaviour that attribute asks for, so "opening one closes the others" has never
 * been exercised in an engine. Betting a documented mode on an untested platform feature is the gap
 * this file closes; the `multiple` half is the counter-example that keeps the first half honest.
 *
 * The disabled guard is here for the same reason: it is three `preventDefault` handlers on a
 * `<summary>`, and whether `preventDefault` on keydown actually suppresses the native toggle is a
 * question about Chromium, not about our component tree.
 */

const open = (page: Page, scope: string) =>
    page
        .locator(`[data-testid=${scope}] details`)
        .evaluateAll((els) => els.map((el) => (el as HTMLDetailsElement).open))

const summary = (page: Page, scope: string, index: number) =>
    page.locator(`[data-testid=${scope}] .ori-accordion__trigger`).nth(index)

test.describe('OriAccordion — the native disclosure contract in a real engine', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#accordion')
        await page.locator('[data-testid=single] details').first().waitFor()
    })

    test('single-open mode: the browser closes the previous item when another opens', async ({ page }) => {
        expect(await open(page, 'single'), 'nothing is open before the first click').toEqual([
            false,
            false,
            false,
            false
        ])

        await summary(page, 'single', 0).click()
        expect(await open(page, 'single')).toEqual([true, false, false, false])

        // The assertion the attribute test cannot make: opening Returns must CLOSE Shipping, and that
        // is done by the engine, not by us.
        await summary(page, 'single', 1).click()
        expect(await open(page, 'single'), 'exclusive accordion did not close the sibling').toEqual([
            false,
            true,
            false,
            false
        ])
    })

    test('multiple mode: the items are independent — the counter-example', async ({ page }) => {
        await summary(page, 'multiple', 0).click()
        await summary(page, 'multiple', 1).click()

        // If this ever matched the single-open result, the first test would be passing for the wrong
        // reason (e.g. only one item is clickable at all).
        expect(await open(page, 'multiple'), 'multiple mode closed a sibling it should have left open').toEqual([
            true,
            true,
            false,
            false
        ])
    })

    test('a disabled item is guarded in BOTH layers, not just by the stylesheet', async ({ page }) => {
        const disabled = summary(page, 'multiple', 2)
        await expect(disabled).toHaveAttribute('aria-disabled', 'true')

        // Layer 1 — the stylesheet: a real pointer never reaches the element. Asserted as the computed
        // value rather than by clicking, because a click here is not "blocked", it lands on the parent.
        await expect(disabled).toHaveCSS('pointer-events', 'none')

        // Layer 2 — the component: `@oriui/css` is a SEPARATE package a consumer may replace or fail to
        // load, so the guard has to hold without it. A synthetic dispatch goes straight to the element,
        // skipping hit-testing, which is exactly the case where layer 1 does not exist.
        await disabled.dispatchEvent('click')
        expect((await open(page, 'multiple'))[2], 'the component-level click guard is gone').toBe(false)

        // `tabindex=-1` keeps it out of tab order, so reach it directly and press the keys a real user
        // would: on a <summary> both Enter and Space toggle natively.
        await disabled.evaluate((el) => (el as HTMLElement).focus())
        await page.keyboard.press('Enter')
        expect((await open(page, 'multiple'))[2], 'Enter opened the disabled item').toBe(false)

        await page.keyboard.press('Space')
        expect((await open(page, 'multiple'))[2], 'Space opened the disabled item').toBe(false)
    })

    test('an enabled item still toggles with the keyboard — the guard is not a blanket kill', async ({ page }) => {
        const enabled = summary(page, 'multiple', 0)
        await enabled.evaluate((el) => (el as HTMLElement).focus())

        await page.keyboard.press('Enter')
        expect((await open(page, 'multiple'))[0], 'Enter no longer opens an enabled item').toBe(true)

        await page.keyboard.press('Enter')
        expect((await open(page, 'multiple'))[0], 'Enter no longer closes an open item').toBe(false)
    })
})
