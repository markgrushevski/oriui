import { test, expect, type Locator, type Page } from '@playwright/test'
import path from 'node:path'

/**
 * Forced colors (Windows contrast themes) repaint every background as the page color and drop shadows
 * and gradients. A state shown by fill alone disappears, and so does a surface lifted by its shadow alone.
 * Each pair below renders one part in two states and requires the two to LOOK different under forced
 * colors. Before the forced-colors rules, nine of these pairs were pixel-identical: every pressed button,
 * the progress fill, the highlighted menu item and combobox option, the current table row and the
 * unbordered surface. The switch, the radio dot, the selected segment and the slider track differed
 * only by a stray pixel or a thumb ring, which is why the screenshots were read, not just compared.
 */
const STYLES = path.resolve('packages/css/dist/styles.css')

async function render(page: Page, body: string, colorScheme: 'light' | 'dark' = 'light') {
    await page.emulateMedia({ forcedColors: 'active', colorScheme })
    await page.setContent(`<!doctype html><html><head></head><body style="margin:0;padding:16px">${body}</body></html>`)
    await page.addStyleTag({ path: STYLES })
    await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' })
}

const looksDifferent = async (a: Locator, b: Locator) => !(await a.screenshot()).equals(await b.screenshot())

/** The color of one pixel of an element's screenshot, at a fraction of its box. */
async function pixel(page: Page, el: Locator, fx: number, fy: number): Promise<number[]> {
    const png = (await el.screenshot()).toString('base64')
    return page.evaluate(
        async ({ png, fx, fy }) => {
            const img = new Image()
            img.src = `data:image/png;base64,${png}`
            await img.decode()
            const canvas = new OffscreenCanvas(img.width, img.height)
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0)
            const x = Math.min(img.width - 1, Math.floor(img.width * fx))
            const y = Math.min(img.height - 1, Math.floor(img.height * fy))
            return [...ctx.getImageData(x, y, 1, 1).data.slice(0, 3)]
        },
        { png, fx, fy }
    )
}

const sw = (on: boolean) =>
    `<label class="ori-switch"><input type="checkbox" role="switch" class="ori-switch__input" ${on ? 'checked' : ''} /><span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span><span class="ori-switch__label">Wi-Fi</span></label>`
const radio = (on: boolean, name: string) =>
    `<label class="ori-radio"><input class="ori-radio__input" type="radio" name="${name}" ${on ? 'checked' : ''} /><span class="ori-radio__circle" aria-hidden="true"></span><span class="ori-radio__label">Free</span></label>`
const segmented = (selected: number, name: string) =>
    `<div class="ori-segmented-control" role="radiogroup"><div class="ori-segmented-control__track">${['Light', 'Dark']
        .map(
            (text, i) =>
                `<label class="ori-segmented-control__item"><input class="ori-segmented-control__input" type="radio" name="${name}" ${i === selected ? 'checked' : ''} /><span class="ori-segmented-control__text">${text}</span></label>`
        )
        .join('')}</div></div>`
const button = (variant: string, pressed: boolean) =>
    `<button class="ori-button ori-variant_${variant}" aria-pressed="${pressed}">Pen</button>`
const slider = (pct: number) =>
    `<div class="ori-slider" style="--ori-slider-pct: ${pct}%; width: 240px"><input type="range" class="ori-slider__input" min="0" max="100" value="${pct}" /></div>`
const progress = (pct: number) =>
    `<div class="ori-progress" role="progressbar" style="width: 240px"><div class="ori-progress__track"><div class="ori-progress__indicator" style="width: ${pct}%"></div></div></div>`
const listRow = (current: boolean) =>
    `<ul class="ori-list" role="list" style="width: 240px"><li class="ori-list__item"><div class="ori-list__row" ${current ? 'aria-current="true"' : ''}><span class="ori-list__main"><span class="ori-list__label">Layer 1</span></span></div></li></ul>`
const menuItem = (highlighted: boolean) =>
    `<div class="ori-menu" role="menu" style="width: 200px"><div role="menuitem" class="ori-menu__item" ${highlighted ? 'data-highlighted' : ''}>Rename</div></div>`
const option = (highlighted: boolean) =>
    `<div class="ori-combobox__listbox" role="listbox" style="width: 200px"><div role="option" class="ori-combobox__option" ${highlighted ? 'data-highlighted' : ''}>Apple</div></div>`
const tableRow = (current: boolean) =>
    `<table class="ori-table" style="width: 240px"><tbody><tr ${current ? 'aria-current="true"' : ''}><td>Row</td></tr></tbody></table>`

const pairs: Record<string, [string, string]> = {
    'the switch, off and on': [sw(false), sw(true)],
    'the radio, unchecked and checked': [radio(false, 'a'), radio(true, 'b')],
    'the segmented control, first and second selected': [segmented(0, 'a'), segmented(1, 'b')],
    'a text button, unpressed and pressed': [button('text', false), button('text', true)],
    'a soft button, unpressed and pressed': [button('soft', false), button('soft', true)],
    'a solid button, unpressed and pressed': [button('solid', false), button('solid', true)],
    'an outline button, unpressed and pressed': [button('outline', false), button('outline', true)],
    'a quiet button, unpressed and pressed': [button('quiet', false), button('quiet', true)],
    'the slider at 20% and 80%': [slider(20), slider(80)],
    'the progress bar at 20% and 80%': [progress(20), progress(80)],
    'a list row, and the current one': [listRow(false), listRow(true)],
    'a menu item, and the highlighted one': [menuItem(false), menuItem(true)],
    'a combobox option, and the highlighted one': [option(false), option(true)],
    'a table row, and the current one': [tableRow(false), tableRow(true)]
}

for (const scheme of ['light', 'dark'] as const) {
    test.describe(`forced colors, ${scheme} palette — state stays visible`, () => {
        for (const [name, [off, on]] of Object.entries(pairs)) {
            test(name, async ({ page }) => {
                await render(
                    page,
                    `<div id="off" style="display:inline-block">${off}</div> <div id="on" style="display:inline-block">${on}</div>`,
                    scheme
                )
                expect(await looksDifferent(page.locator('#off'), page.locator('#on'))).toBe(true)
            })
        }
    })
}

test.describe('forced colors — surfaces keep an edge', () => {
    // A surface lifted by its shadow alone looks exactly like plain text on the page once shadows go.
    const plain = (text: string) => `<div style="padding: 1rem; width: 200px">${text}</div>`
    const edges: Record<string, string> = {
        'an unbordered surface': `<div class="ori-surface ori-surface_elevation-md" style="padding: 1rem; width: 200px">Panel</div>`,
        'a dialog panel': `<dialog open class="ori-dialog" style="position: static; margin: 0; padding: 1rem; width: 200px">Panel</dialog>`,
        'a drawer panel': `<div class="ori-drawer" style="position: static; display: block; padding: 1rem; width: 200px; height: auto">Panel</div>`,
        'a tooltip bubble': `<span class="ori-tooltip__bubble" style="position: static; display: block; visibility: visible; opacity: 1; padding: 1rem; width: 200px; max-width: none; font: inherit">Panel</span>`
    }
    for (const [name, markup] of Object.entries(edges)) {
        test(name, async ({ page }) => {
            await render(
                page,
                `<div id="plain" style="display:inline-block">${plain('Panel')}</div> <div id="edge" style="display:inline-block">${markup}</div>`
            )
            expect(await looksDifferent(page.locator('#plain'), page.locator('#edge'))).toBe(true)
        })
    }
})

test('forced colors — the spinner keeps its gap, so the rotation shows', async ({ page }) => {
    await render(
        page,
        `<div class="ori-spinner" id="spinner" role="status" aria-label="Loading" style="font-size: 48px"></div>`
    )
    const spinner = page.locator('#spinner')
    // The gap is the bottom quarter of the ring: page color there, the ring's color at the top.
    expect(await pixel(page, spinner, 0.5, 0.98)).not.toEqual(await pixel(page, spinner, 0.5, 0.02))
})

test('forced colors — the color picker keeps the colors being chosen', async ({ page }) => {
    await render(
        page,
        `<div class="ori-color-picker" style="width: 240px">
            <div class="ori-color-picker__area" id="area" style="--ori-color-picker-hue: #ff0000"></div>
            <span class="ori-color-picker__swatch" id="swatch" style="--ori-color: #00ff00"></span>
            <button class="ori-color-picker__preset" id="preset" style="--ori-color: #0000ff" aria-label="Blue"></button>
        </div>`
    )
    const [r, g, b] = await pixel(page, page.locator('#area'), 0.98, 0.02)
    expect(r).toBeGreaterThan(200) // the top-end corner of the area is the pure hue
    expect(g + b).toBeLessThan(80)
    expect(await pixel(page, page.locator('#swatch'), 0.5, 0.5)).toEqual([0, 255, 0])
    expect(await pixel(page, page.locator('#preset'), 0.5, 0.5)).toEqual([0, 0, 255])
})

/**
 * The share of the label's text box painted in the part's own fill, read from a pixel of its padding: the
 * fill as rendered, whatever the platform's Highlight is.
 */
async function fillShareUnderText(page: Page, part: Locator): Promise<number> {
    const { fill, text } = await part.evaluate((el) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        const t = range.getBoundingClientRect()
        const box = el.getBoundingClientRect()
        return {
            fill: { x: box.left + 3, y: box.top + box.height / 2, width: 1, height: 1 },
            text: { x: t.x, y: t.y, width: t.width, height: t.height }
        }
    })
    const fillPng = (await page.screenshot({ clip: fill })).toString('base64')
    const textPng = (await page.screenshot({ clip: text })).toString('base64')
    return page.evaluate(
        async ({ fillPng, textPng }) => {
            const read = async (png: string) => {
                const img = new Image()
                img.src = `data:image/png;base64,${png}`
                await img.decode()
                const canvas = new OffscreenCanvas(img.width, img.height)
                const ctx = canvas.getContext('2d')!
                ctx.drawImage(img, 0, 0)
                return ctx.getImageData(0, 0, img.width, img.height).data
            }
            const f = await read(fillPng)
            const data = await read(textPng)
            const near = (i: number) =>
                Math.abs(data[i]! - f[0]!) + Math.abs(data[i + 1]! - f[1]!) + Math.abs(data[i + 2]! - f[2]!) < 24
            let hits = 0
            for (let i = 0; i < data.length; i += 4) if (near(i)) hits++
            return hits / (data.length / 4)
        },
        { fillPng, textPng }
    )
}

test('forced colors — a highlighted label is not hidden by the text backplate', async ({ page }) => {
    // The browser lays a page-colored backplate under text in forced colors. On a Highlight fill that turns
    // the HighlightText label into a blank box unless the part opts out of the forced repaint. Between the
    // glyphs the fill shows through: about two thirds of the text box measured, against none with a backplate.
    await render(page, menuItem(true))
    expect(await fillShareUnderText(page, page.locator('.ori-menu__item'))).toBeGreaterThan(0.4)
})

test('the backplate measurement would catch the blank box', async ({ page }) => {
    // The counter-example: the same item left to the forced repaint, so the backplate is drawn.
    await render(page, menuItem(true))
    await page.addStyleTag({ content: '.ori-menu__item { forced-color-adjust: auto !important }' })
    expect(await fillShareUnderText(page, page.locator('.ori-menu__item'))).toBeLessThan(0.05)
})
