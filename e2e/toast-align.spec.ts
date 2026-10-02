import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

/**
 * Toast alignment geometry. `align="center"` makes a claim that only a real engine can check: the body
 * is centered on the CARD. The obvious implementation — `text-align: center` on a flex child — centers it
 * on the space the dismiss button leaves behind instead, which lands visibly off-center and is exactly
 * the defect a consumer reported against a `top-center` stack. So this measures the rendered centers
 * rather than asserting a class, and it does it in both writing directions, because the compensation is
 * written with logical properties.
 */
const STYLES = path.resolve('packages/css/dist/styles.css')

type Box = { x: number; y: number; width: number; height: number }
const centerX = (b: Box) => b.x + b.width / 2

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
    test(`align="center" centers the text on the card even with a dismiss button (${dir})`, async ({ page }) => {
        await render(page, dir, toast({ align: 'center', close: true }))
        const { card, text } = await boxes(page)

        // The text box spans the padded content area; its center is what the eye reads as "centered".
        // Tolerance is 2px because the card carries a deliberate 4px accent stripe on the start edge
        // against a 1px border on the end edge, so the content box sits 1.5px off the border box. That
        // is the accent, not the button: an uncompensated dismiss button drifts by an order of magnitude
        // more, which the counter-example test below pins.
        expect(Math.abs(centerX(text) - centerX(card))).toBeLessThanOrEqual(2)
    })

    test(`align="center" without a dismiss button is centered too (${dir})`, async ({ page }) => {
        await render(page, dir, toast({ align: 'center' }))
        const { card, text } = await boxes(page)

        expect(Math.abs(centerX(text) - centerX(card))).toBeLessThanOrEqual(2)
    })
}

test('the naive implementation would fail this test — a flow-positioned close button pulls the center', async ({
    page
}) => {
    // The counter-example, so the guard above cannot quietly stop meaning anything: same markup, but the
    // button is forced back into the flex flow and the compensation removed. If this ever stops being
    // off-center, the measurement is no longer sensitive to the thing it exists to catch.
    await render(page, 'ltr', toast({ align: 'center', close: true }))
    await page.addStyleTag({
        content: `.ori-toast_align-center:has(.ori-toast__close) { padding-inline: calc(var(--ori-size-gap) * 2) }
                  .ori-toast_align-center .ori-toast__close { position: static }`
    })
    const { card, text } = await boxes(page)

    expect(Math.abs(centerX(text) - centerX(card))).toBeGreaterThan(4)
})

// Vertical geometry: every part sits on the message's first line, whatever its own height.
const centerY = (b: Box) => b.y + b.height / 2
const firstLine = `
    <div class="ori-toast ori-color_success" role="status" style="width: 26rem">
        <i class="ori-icon ori-toast__icon" aria-hidden="true" id="icon">
            <svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z" /></svg>
        </i>
        <div class="ori-toast__body">
            <div class="ori-toast__text" id="text">Message archived.</div>
        </div>
        <button class="ori-button ori-button_sm ori-font-size_sm ori-variant_soft ori-toast__action" id="action">
            Undo
        </button>
        <button class="ori-toast__close" type="button" aria-label="Dismiss" id="close">×</button>
    </div>`

const lineCenter = (page: Page) =>
    page.locator('#text').evaluate((el) => {
        // The first rendered line of glyphs: `line-height` may be `normal`, which has no number to read.
        const range = document.createRange()
        range.selectNodeContents(el)
        const r = range.getClientRects()[0]!
        return r.top + r.height / 2
    })

test('the action, the icon and the dismiss button line up with the first line of the message', async ({ page }) => {
    await render(page, 'ltr', firstLine)
    const line = await lineCenter(page)

    // Baseline alignment centers a label on its own line box, so a pixel of font metrics remains; the ×
    // glyph is 1.25 times the text, so its box sits a little further off. Unaligned, the action is 5px+ off.
    for (const [id, tolerance] of [
        ['#action', 1.5],
        ['#icon', 1.5],
        ['#close', 2.5]
    ] as const) {
        const box = (await page.locator(id).boundingBox()) as Box
        expect(Math.abs(centerY(box) - line), id).toBeLessThanOrEqual(tolerance)
    }
})

test('centering only the action leaves a one-line message above it', async ({ page }) => {
    // The counter-example: the body at the top of the card and the action centered on it, the shape that
    // put the text visibly above the Undo button.
    await render(page, 'ltr', firstLine)
    await page.addStyleTag({
        content: `.ori-toast .ori-toast__body { align-self: flex-start }
                  .ori-toast .ori-toast__action { align-self: center }`
    })
    const line = await lineCenter(page)
    const action = (await page.locator('#action').boundingBox()) as Box

    expect(Math.abs(centerY(action) - line)).toBeGreaterThan(3)
})

test('the default alignment is unchanged — the body still starts at the content edge', async ({ page }) => {
    await render(page, 'ltr', toast({ close: true }))
    const { card, text } = await boxes(page)

    // Start-aligned: the text's own box begins where the card's padding ends, well left of center.
    expect(text.x).toBeLessThan(centerX(card))
    expect(text.x - card.x).toBeLessThan(40)
})
