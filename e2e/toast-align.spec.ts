import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

/**
 * Toast alignment geometry. `align="center"` makes a claim that only a real engine can check: the body
 * is centred on the CARD. The obvious implementation — `text-align: center` on a flex child — centres it
 * on the space the dismiss button leaves behind instead, which lands visibly off-centre and is exactly
 * the defect a consumer reported against a `top-center` stack. So this measures the rendered centres
 * rather than asserting a class, and it does it in both writing directions, because the compensation is
 * written with logical properties.
 */
const STYLES = path.resolve('packages/css/dist/styles.css')

type Box = { x: number; y: number; width: number; height: number }
const centreX = (b: Box) => b.x + b.width / 2

// One-line status message — the shape the alignment exists for.
const toast = (opts: { align?: 'center'; close?: boolean }) => `
    <div class="ori-toast ori-color_surface${opts.align === 'center' ? ' ori-toast_align-center' : ''}"
         role="status" style="width: 22rem">
        <div class="ori-toast__body">
            <div class="ori-toast__text" id="text">Saved.</div>
        </div>
        ${opts.close ? '<button class="ori-toast__close" type="button" aria-label="Dismiss">×</button>' : ''}
    </div>`

async function render(page: Page, dir: 'ltr' | 'rtl', body: string) {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.setContent(`<!doctype html><html dir="${dir}"><head></head><body>${body}</body></html>`)
    await page.addStyleTag({ path: STYLES })
    await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' })
    expect(await page.evaluate(() => document.documentElement.dir)).toBe(dir)
}

const boxes = async (page: Page) => {
    const card = (await page.locator('.ori-toast').boundingBox()) as Box
    const text = (await page.locator('#text').boundingBox()) as Box
    return { card, text }
}

for (const dir of ['ltr', 'rtl'] as const) {
    test(`align="center" centres the text on the card even with a dismiss button (${dir})`, async ({ page }) => {
        await render(page, dir, toast({ align: 'center', close: true }))
        const { card, text } = await boxes(page)

        // The text box spans the padded content area; its centre is what the eye reads as "centred".
        // Tolerance is 2px because the card carries a deliberate 4px accent stripe on the start edge
        // against a 1px border on the end edge, so the content box sits 1.5px off the border box. That
        // is the accent, not the button: an uncompensated dismiss button drifts by an order of magnitude
        // more, which the counter-example test below pins.
        expect(Math.abs(centreX(text) - centreX(card))).toBeLessThanOrEqual(2)
    })

    test(`align="center" without a dismiss button is centred too (${dir})`, async ({ page }) => {
        await render(page, dir, toast({ align: 'center' }))
        const { card, text } = await boxes(page)

        expect(Math.abs(centreX(text) - centreX(card))).toBeLessThanOrEqual(2)
    })
}

test('the naive implementation would fail this test — a flow-positioned close button pulls the centre', async ({
    page
}) => {
    // The counter-example, so the guard above cannot quietly stop meaning anything: same markup, but the
    // button is forced back into the flex flow and the compensation removed. If this ever stops being
    // off-centre, the measurement is no longer sensitive to the thing it exists to catch.
    await render(page, 'ltr', toast({ align: 'center', close: true }))
    await page.addStyleTag({
        content: `.ori-toast_align-center:has(.ori-toast__close) { padding-inline: calc(var(--ori-size-gap) * 2) }
                  .ori-toast_align-center .ori-toast__close { position: static }`
    })
    const { card, text } = await boxes(page)

    expect(Math.abs(centreX(text) - centreX(card))).toBeGreaterThan(4)
})

test('the default alignment is unchanged — the body still starts at the content edge', async ({ page }) => {
    await render(page, 'ltr', toast({ close: true }))
    const { card, text } = await boxes(page)

    // Start-aligned: the text's own box begins where the card's padding ends, well left of centre.
    expect(text.x).toBeLessThan(centreX(card))
    expect(text.x - card.x).toBeLessThan(40)
})
