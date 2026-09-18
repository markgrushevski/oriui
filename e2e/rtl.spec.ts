import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

/**
 * RTL geometry guard. The CSS layer claims to be direction-aware (badge.css carries an explicit
 * `:dir(rtl)` rule, anchored.css documents its alignment as "RTL- and writing-mode-aware"), but nothing
 * ever verified it. Logical properties only resolve against a real writing direction in a real engine —
 * happy-dom has no layout — so this runs the SAME markup under `dir=ltr` and `dir=rtl` in Chromium and
 * asserts REAL geometry (bounding boxes relative to their container), never class names.
 *
 * Three kinds of assertion live here, and the distinction is the point:
 *   - MIRRORS — logical layout that must flip with the direction (tabs rule, badge overhang, anchored
 *     placement, toolbar order, the field chevron, the switch thumb).
 *   - STAYS PHYSICAL — a deliberate non-mirror, pinned so a future "helpful" logical swap breaks a test
 *     (toast corners are named for screen corners; the color-picker SV area is a value plane whose
 *     pointer math is physical).
 *   - AGREES WITH THE ENGINE — the native `<input type=range>` reverses itself in RTL; the author-drawn
 *     fill has to follow whatever the engine actually does, which is measured here, not assumed.
 */
const STYLES = path.resolve('packages/css/dist/styles.css')

type Dir = 'ltr' | 'rtl'
const DIRS: Dir[] = ['ltr', 'rtl']

type Box = { x: number; y: number; width: number; height: number }

const NEAR = 2
const right = (b: Box) => b.x + b.width
const bottom = (b: Box) => b.y + b.height
const cx = (b: Box) => b.x + b.width / 2
const cy = (b: Box) => b.y + b.height / 2

async function render(page: Page, dir: Dir, body: string) {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.setContent(`<!doctype html><html dir="${dir}"><head></head><body>${body}</body></html>`)
    await page.addStyleTag({ path: STYLES })
    // Geometry reads must sample settled values, not a transition/animation frame.
    await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' })
    // Guard the harness itself: a `dir` that never landed would make every mirror assertion vacuous.
    expect(await page.evaluate(() => document.documentElement.dir)).toBe(dir)
}

async function box(page: Page, selector: string): Promise<Box> {
    const b = await page.locator(selector).boundingBox()
    if (!b) throw new Error(`no box for ${selector}`)
    return b
}

function styles(page: Page, selector: string, properties: string[], pseudo?: string) {
    return page.evaluate(
        ({ selector, properties, pseudo }) => {
            const el = document.querySelector(selector)
            if (!el) throw new Error(`no element for ${selector}`)
            const cs = getComputedStyle(el, pseudo ?? null)
            return Object.fromEntries(properties.map((p) => [p, cs.getPropertyValue(p)])) as Record<string, string>
        },
        { selector, properties, pseudo }
    )
}

// ---------------------------------------------------------------------------------------------
// MIRRORS — logical layout that must follow the writing direction.
// ---------------------------------------------------------------------------------------------

test.describe('vertical tabs mirror', () => {
    const MARKUP = `<div class="ori-tabs ori-tabs_vertical" id="tabs" style="width:400px">
        <div class="ori-tabs__list" role="tablist" id="list">
            <button class="ori-tabs__tab" role="tab" aria-selected="true" id="tab">One</button>
            <button class="ori-tabs__tab" role="tab">Two</button>
        </div>
        <div class="ori-tabs__panel" id="panel">Panel</div>
    </div>`

    for (const dir of DIRS) {
        test(`${dir}: the tab list sits on the inline-start side and its rule faces the panel`, async ({ page }) => {
            await render(page, dir, MARKUP)
            const list = await box(page, '#list')
            const panel = await box(page, '#panel')

            // The list leads in the inline direction (flex row is inline-axis aware).
            if (dir === 'ltr') expect(right(list)).toBeLessThanOrEqual(panel.x + 1)
            else expect(right(panel)).toBeLessThanOrEqual(list.x + 1)

            // The separator is the edge BETWEEN list and panel, so it must be the panel-facing one.
            const rule = await styles(page, '#list', ['border-left-width', 'border-right-width'])
            const facing = dir === 'ltr' ? 'border-right-width' : 'border-left-width'
            const away = dir === 'ltr' ? 'border-left-width' : 'border-right-width'
            expect(rule[facing], `the list rule must face the panel in ${dir}`).toBe('1px')
            expect(rule[away]).toBe('0px')

            // ...and the selected-tab indicator must land on that SAME edge (it already uses
            // inset-inline-end, so a physical rule would put the two on opposite sides in RTL).
            const tab = await box(page, '#tab')
            const indicator = await styles(page, '#tab', ['left', 'width'], '::after')
            const indicatorLeft = parseFloat(indicator.left)
            if (dir === 'ltr') expect(indicatorLeft + parseFloat(indicator.width)).toBeGreaterThan(tab.width - NEAR)
            else expect(indicatorLeft).toBeLessThan(NEAR)
        })
    }
})

test.describe('vertical divider mirror', () => {
    const MARKUP = `<div id="row" style="display:flex;align-items:center;width:400px">
        <div id="a" style="width:100px">A</div>
        <div class="ori-divider ori-divider_vertical" id="divider"></div>
        <div id="b" style="width:100px">B</div>
    </div>`

    for (const dir of DIRS) {
        test(`${dir}: the rule is drawn between the two siblings`, async ({ page }) => {
            await render(page, dir, MARKUP)
            const a = await box(page, '#a')
            const b = await box(page, '#b')
            const divider = await box(page, '#divider')

            // Inline order mirrors...
            if (dir === 'ltr') expect(a.x).toBeLessThan(b.x)
            else expect(a.x).toBeGreaterThan(b.x)

            // ...and the 1px rule lands strictly between them, whichever way round they are.
            const lo = Math.min(right(a), right(b))
            const hi = Math.max(a.x, b.x)
            expect(divider.x).toBeGreaterThanOrEqual(lo - 1)
            expect(right(divider)).toBeLessThanOrEqual(hi + 1)
            expect(divider.height).toBeGreaterThan(0)
        })
    }
})

test.describe('badge anchor mirror', () => {
    const MARKUP = `<span class="ori-badge-anchor" id="anchor" style="width:120px;height:40px;background:#eee">
        <span class="ori-badge ori-badge_floating" id="badge">7</span>
    </span>`

    for (const dir of DIRS) {
        test(`${dir}: the floating badge overhangs the inline-end top corner`, async ({ page }) => {
            await render(page, dir, MARKUP)
            const anchor = await box(page, '#anchor')
            const badge = await box(page, '#badge')

            // The badge centre sits ON the anchor's inline-end edge (half in, half out) at its top.
            const edge = dir === 'ltr' ? right(anchor) : anchor.x
            expect(Math.abs(cx(badge) - edge)).toBeLessThan(NEAR)
            expect(Math.abs(cy(badge) - anchor.y)).toBeLessThan(NEAR)
            // It must overhang OUTWARD, never fold back across the anchor.
            if (dir === 'ltr') expect(right(badge)).toBeGreaterThan(right(anchor))
            else expect(badge.x).toBeLessThan(anchor.x)
        })
    }
})

test.describe('anchored placement mirrors', () => {
    // The panel is smaller than the trigger on both axes so start / centre / end are distinguishable.
    const MARKUP = (placement: string) => `
        <button id="t" popovertarget="p" style="anchor-name:--a;position:absolute;top:320px;left:560px;width:120px;height:40px;">T</button>
        <div id="p" popover class="ori-popover ori-anchored ori-anchored_${placement}" style="--ori-anchor:--a;min-width:0;width:80px;height:60px;" aria-label="P">P</div>`

    async function open(page: Page, dir: Dir, placement: string) {
        await render(page, dir, MARKUP(placement))
        await page.click('#t')
        await page.locator('#p').waitFor({ state: 'visible' })
        return { t: await box(page, '#t'), p: await box(page, '#p') }
    }

    // `position-area` is logical, so the whole grid mirrors: `_left` means inline-start, which is the
    // physical RIGHT in RTL. This pins that contract — the class NAMES stay physical-sounding while the
    // behaviour is direction-aware (see the report: naming vs behaviour).
    test('rtl: _left places the panel to the physical RIGHT of the trigger', async ({ page }) => {
        const { t, p } = await open(page, 'rtl', 'left')
        expect(p.x).toBeGreaterThanOrEqual(right(t) - 1)
        expect(Math.abs(cy(p) - cy(t))).toBeLessThan(NEAR)
    })

    test('rtl: _right places the panel to the physical LEFT of the trigger', async ({ page }) => {
        const { t, p } = await open(page, 'rtl', 'right')
        expect(right(p)).toBeLessThanOrEqual(t.x + 1)
        expect(Math.abs(cy(p) - cy(t))).toBeLessThan(NEAR)
    })

    test('rtl: bottom-start aligns to the trigger’s right edge, bottom-end to its left', async ({ page }) => {
        const start = await open(page, 'rtl', 'bottom-start')
        expect(start.p.y).toBeGreaterThanOrEqual(bottom(start.t) - 1)
        expect(Math.abs(right(start.p) - right(start.t))).toBeLessThan(NEAR)

        const end = await open(page, 'rtl', 'bottom-end')
        expect(end.p.y).toBeGreaterThanOrEqual(bottom(end.t) - 1)
        expect(Math.abs(end.p.x - end.t.x)).toBeLessThan(NEAR)
    })

    test('ltr: the same two classes align the other way round', async ({ page }) => {
        const start = await open(page, 'ltr', 'bottom-start')
        expect(Math.abs(start.p.x - start.t.x)).toBeLessThan(NEAR)

        const end = await open(page, 'ltr', 'bottom-end')
        expect(Math.abs(right(end.p) - right(end.t))).toBeLessThan(NEAR)
    })

    test('rtl: a bare side still centres on the trigger', async ({ page }) => {
        const { t, p } = await open(page, 'rtl', 'bottom')
        expect(p.y).toBeGreaterThanOrEqual(bottom(t) - 1)
        expect(Math.abs(cx(p) - cx(t))).toBeLessThan(NEAR)
    })
})

test.describe('toolbar mirror', () => {
    const MARKUP = `<div class="ori-toolbar" id="toolbar">
        <button class="ori-button" id="first">1</button>
        <span class="ori-toolbar__separator" id="sep"></span>
        <button class="ori-button" id="last">2</button>
    </div>`

    for (const dir of DIRS) {
        test(`${dir}: children run in the inline direction around a symmetric separator`, async ({ page }) => {
            await render(page, dir, MARKUP)
            const first = await box(page, '#first')
            const last = await box(page, '#last')
            const sep = await box(page, '#sep')

            if (dir === 'ltr') expect(first.x).toBeLessThan(last.x)
            else expect(first.x).toBeGreaterThan(last.x)

            // The separator sits between them either way, and its gap is symmetric (margin-inline).
            expect(cx(sep)).toBeGreaterThan(Math.min(right(first), right(last)) - 1)
            expect(cx(sep)).toBeLessThan(Math.max(first.x, last.x) + 1)
            const gaps = await styles(page, '#sep', ['margin-left', 'margin-right'])
            expect(gaps['margin-left']).toBe(gaps['margin-right'])
        })
    }
})

test.describe('field chevron mirror', () => {
    // The select/combobox chevron is absolutely placed with inset-inline-end and the control reserves
    // room with padding-inline-end: both must land on the SAME side, or the value text runs under it.
    const MARKUP = `<div class="ori-select">
        <span class="ori-select__control-wrap" id="field" style="width:240px">
            <select class="ori-select__control" id="control"><option>Value</option></select>
            <span class="ori-select__chevron" id="chevron" aria-hidden="true">v</span>
        </span>
    </div>`

    for (const dir of DIRS) {
        test(`${dir}: the chevron and the reserved padding are on the same inline-end side`, async ({ page }) => {
            await render(page, dir, MARKUP)
            const field = await box(page, '#field')
            const chevron = await box(page, '#chevron')
            const pad = await styles(page, '#control', ['padding-left', 'padding-right'])
            const left = parseFloat(pad['padding-left'])
            const rightPad = parseFloat(pad['padding-right'])

            if (dir === 'ltr') {
                expect(cx(chevron)).toBeGreaterThan(cx(field))
                expect(rightPad).toBeGreaterThan(left)
            } else {
                expect(cx(chevron)).toBeLessThan(cx(field))
                expect(left).toBeGreaterThan(rightPad)
            }
        })
    }
})

test.describe('switch thumb mirror', () => {
    const MARKUP = (checked: boolean) => `<label class="ori-switch" id="switch">
        <input class="ori-switch__input" type="checkbox" id="input" ${checked ? 'checked' : ''} />
        <span class="ori-switch__track" id="track"><span class="ori-switch__thumb" id="thumb"></span></span>
        <span>Label</span>
    </label>`

    for (const dir of DIRS) {
        for (const checked of [false, true]) {
            test(`${dir}: the ${checked ? 'checked' : 'unchecked'} thumb stays inside its track`, async ({ page }) => {
                await render(page, dir, MARKUP(checked))
                const track = await box(page, '#track')
                const thumb = await box(page, '#thumb')

                expect(thumb.x, 'thumb escaped the track start').toBeGreaterThanOrEqual(track.x - 1)
                expect(right(thumb), 'thumb escaped the track end').toBeLessThanOrEqual(right(track) + 1)

                // Off rests at the inline-start end, on travels to the inline-end end.
                const atInlineEnd = dir === 'ltr' ? cx(thumb) > cx(track) : cx(thumb) < cx(track)
                expect(atInlineEnd).toBe(checked)
            })
        }
    }
})

// ---------------------------------------------------------------------------------------------
// STAYS PHYSICAL — deliberate non-mirrors, pinned so a future logical swap has to be deliberate too.
// ---------------------------------------------------------------------------------------------

test.describe('toast viewport stays in its named screen corner', () => {
    const CORNERS = [
        { position: 'top-left', vertical: 'top', horizontal: 'left' },
        { position: 'top-center', vertical: 'top', horizontal: 'center' },
        { position: 'top-right', vertical: 'top', horizontal: 'right' },
        { position: 'bottom-left', vertical: 'bottom', horizontal: 'left' },
        { position: 'bottom-center', vertical: 'bottom', horizontal: 'center' },
        { position: 'bottom-right', vertical: 'bottom', horizontal: 'right' }
    ] as const

    for (const dir of DIRS) {
        for (const corner of CORNERS) {
            test(`${dir}: ${corner.position} pins to the ${corner.vertical} ${corner.horizontal}`, async ({ page }) => {
                await render(
                    page,
                    dir,
                    `<div class="ori-toaster ori-toaster_${corner.position}" id="toaster">
                        <div class="ori-toast" id="toast"><div class="ori-toast__body">Saved</div></div>
                    </div>`
                )
                const toaster = await box(page, '#toaster')
                const viewport = page.viewportSize()!

                if (corner.vertical === 'top') expect(toaster.y).toBeLessThan(NEAR)
                else expect(bottom(toaster)).toBeGreaterThan(viewport.height - NEAR)

                // The class names the SCREEN corner, so it must not mirror with the direction.
                if (corner.horizontal === 'left') expect(toaster.x).toBeLessThan(NEAR)
                if (corner.horizontal === 'right') expect(right(toaster)).toBeGreaterThan(viewport.width - NEAR)
                if (corner.horizontal === 'center')
                    expect(Math.abs(cx(toaster) - viewport.width / 2)).toBeLessThan(NEAR)
            })
        }
    }

    for (const dir of DIRS) {
        test(`${dir}: the toast accent stripe follows the text direction`, async ({ page }) => {
            await render(
                page,
                dir,
                `<div class="ori-toaster ori-toaster_top-right"><div class="ori-toast" id="toast">
                    <div class="ori-toast__body">Saved</div>
                </div></div>`
            )
            const accent = await styles(page, '#toast', ['border-left-width', 'border-right-width'])
            const leading = dir === 'ltr' ? 'border-left-width' : 'border-right-width'
            const trailing = dir === 'ltr' ? 'border-right-width' : 'border-left-width'
            expect(accent[leading]).toBe('4px')
            expect(accent[trailing]).toBe('1px')
        })
    }
})

test.describe('color-picker value plane stays physical', () => {
    // The SV area is a value plane, not text: its saturation gradient runs `to right` and the thumb is
    // placed with a physical `left` percentage by useColorPicker, while the pointer handler measures
    // `clientX - rect.left`. All three are physical, and they must stay consistent with each other.
    for (const dir of DIRS) {
        test(`${dir}: full saturation puts the thumb at the physical right edge`, async ({ page }) => {
            await render(
                page,
                dir,
                `<div class="ori-color-picker" style="width:240px"><div class="ori-color-picker__area" id="area">
                    <span class="ori-color-picker__area-thumb" id="thumb" style="left:100%;top:0%"></span>
                </div></div>`
            )
            const area = await box(page, '#area')
            const thumb = await box(page, '#thumb')
            expect(Math.abs(cx(thumb) - right(area))).toBeLessThan(NEAR)
        })
    }
})

// ---------------------------------------------------------------------------------------------
// AGREES WITH THE ENGINE — the native range reverses itself in RTL; the drawn fill must follow.
// ---------------------------------------------------------------------------------------------

test.describe('slider fill agrees with the native range direction', () => {
    // `--ori-slider-pct` is inline (the component sets it from the value), so the painted fill does not
    // move when a click changes the value — the paint is sampled before clicking all the same, to keep
    // the 16px thumb away from the sample columns.
    const MARKUP = `<div class="ori-slider" style="width:300px;--ori-slider-pct:25%">
        <input class="ori-slider__input" id="input" type="range" min="0" max="100" value="25" />
        <span id="accent" style="display:block;width:4px;height:4px;background-color:var(--ori-color-primary)"></span>
    </div>`

    // Which physical end does the ENGINE treat as the minimum? Click a quarter in from the physical
    // left and read back the value the native control resolved.
    async function engineMinimumSide(page: Page): Promise<'left' | 'right'> {
        const input = await box(page, '#input')
        await page.mouse.click(input.x + input.width * 0.25, cy(input))
        return Number(await page.locator('#input').inputValue()) < 50 ? 'left' : 'right'
    }

    // Which physical end is PAINTED as filled? A computed-style read of `::-webkit-slider-runnable-track`
    // returns `none` (Chrome does not expose author styles for that shadow pseudo), so this measures the
    // real pixels: screenshot the control, decode it back into a canvas inside the page, and compare how
    // close each end gets to the accent colour. A whole column is scanned at each end so the read does
    // not depend on where the UA lays the 6px track out inside the 20px control.
    async function paintedFillSide(page: Page): Promise<'left' | 'right'> {
        const accent = await page.evaluate(() => getComputedStyle(document.getElementById('accent')!).backgroundColor)
        const shot = await page.locator('#input').screenshot()
        const distance = await page.evaluate(
            async ({ data, accent }) => {
                const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob())
                const canvas = new OffscreenCanvas(img.width, img.height)
                const ctx = canvas.getContext('2d')!
                ctx.drawImage(img, 0, 0)
                const [ar, ag, ab] = accent.match(/\d+/g)!.map(Number)
                const nearestToAccent = (fraction: number) => {
                    const column = ctx.getImageData(Math.round((img.width - 1) * fraction), 0, 1, img.height).data
                    let best = Infinity
                    for (let y = 0; y < img.height; y++) {
                        const d = Math.hypot(column[y * 4] - ar, column[y * 4 + 1] - ag, column[y * 4 + 2] - ab)
                        if (d < best) best = d
                    }
                    return best
                }
                return { left: nearestToAccent(0.12), right: nearestToAccent(0.88) }
            },
            { data: shot.toString('base64'), accent }
        )
        return distance.left < distance.right ? 'left' : 'right'
    }

    for (const dir of DIRS) {
        test(`${dir}: the engine puts the range minimum on the ${dir === 'ltr' ? 'left' : 'right'}`, async ({
            page
        }) => {
            await render(page, dir, MARKUP)
            // Chromium reverses a native range under dir=rtl — the premise the fill has to live with.
            expect(await engineMinimumSide(page)).toBe(dir === 'ltr' ? 'left' : 'right')
        })

        test(`${dir}: the painted fill starts at the end the engine treats as the minimum`, async ({ page }) => {
            // KNOWN GAP in rtl: the native range reverses itself but the author-drawn fill (and the
            // color-picker hue / alpha tracks it shares a block with) still paints `to right`, so the
            // fill ends up opposite the thumb. Recorded rather than asserted away because the fix is a
            // decision about the whole slider family: mirror the gradients, or pin the color-picker's
            // controls to ltr alongside its deliberately-physical value plane. EITHER makes this pass.
            test.fail(dir === 'rtl', 'the slider fill does not follow the engine’s RTL reversal')

            await render(page, dir, MARKUP)
            const painted = await paintedFillSide(page)
            const minimum = await engineMinimumSide(page)
            expect(painted, `the fill paints from the ${painted}, the engine's minimum end is the ${minimum}`).toBe(
                minimum
            )
        })
    }
})
