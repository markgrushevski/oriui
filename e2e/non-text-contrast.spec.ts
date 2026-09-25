import { test, expect } from '@playwright/test'
import path from 'node:path'
import { colord, extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'

/**
 * NON-TEXT contrast guard — WCAG 1.4.11, which asks for **3:1** between a UI component's visual
 * boundary and its background. This is a different bar and a different set of elements from
 * `text-contrast.spec.ts` (4.5:1, foregrounds), which is why it is its own file rather than another
 * `data-kind` there.
 *
 * The edges are derived with `color-mix` from the ambient ink, so a skin or theme token can move them
 * without touching the component CSS — only a measurement in a real engine catches that.
 *
 * Adding a cell: give the element an id, push it into PARTS, and say what its boundary colour is. The
 * measurement composites the boundary over the opaque surface on a 1x1 canvas, exactly as the text
 * probe does — `color-mix` only resolves to a concrete colour in a real engine.
 */
extend([a11yPlugin])

const STYLES = path.resolve('packages/css/dist/styles.css')
const SKINS = ['', 'sumi', 'indigo', 'tech', 'health', 'luxury', 'neutral', 'cyber'] as const
const THEMES = ['light', 'dark'] as const
const NON_TEXT = 3

const PARTS = [
    { id: 'cb', label: 'checkbox unchecked edge' },
    { id: 'rb', label: 'radio unchecked edge' }
] as const

const MARKUP = `<div id="surface" style="background-color: var(--ori-color-surface); color: var(--ori-color-on-surface); padding: 24px">
    <label class="ori-checkbox"><input type="checkbox" class="ori-checkbox__input"><span class="ori-checkbox__box" id="cb"></span><span>Box</span></label>
    <label class="ori-radio"><input type="radio" class="ori-radio__input"><span class="ori-radio__box" id="rb"></span><span>Radio</span></label>
</div>`

test('every unchecked control boundary clears 3:1 in all skins and both themes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 })
    await page.setContent(`<!doctype html><html><head></head><body>${MARKUP}</body></html>`)
    await page.addStyleTag({ path: STYLES })
    await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' })

    const rows: { skin: string; theme: string; label: string; fg: string; bg: string }[] = []
    for (const skin of SKINS) {
        for (const theme of THEMES) {
            rows.push(
                ...(await page.evaluate(
                    ({ skin, theme, parts }) => {
                        const html = document.documentElement
                        if (skin) html.setAttribute('data-ori-skin', skin)
                        else html.removeAttribute('data-ori-skin')
                        html.className = `ori-theme_${theme}`

                        // The engine is the only authority on `color-mix` — stack the colours on a 1x1
                        // canvas and read the composited pixel back, the same technique the text probe uses.
                        const cv = document.createElement('canvas')
                        cv.width = cv.height = 1
                        const ctx = cv.getContext('2d')!
                        const paint = (stack: string[]) => {
                            ctx.clearRect(0, 0, 1, 1)
                            for (const c of stack) {
                                ctx.fillStyle = 'rgba(0,0,0,0)'
                                ctx.fillStyle = c
                                ctx.fillRect(0, 0, 1, 1)
                            }
                            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
                            return `rgb(${r} ${g} ${b})`
                        }
                        const surface = getComputedStyle(document.getElementById('surface')!).backgroundColor

                        return parts.map((part) => {
                            const cs = getComputedStyle(document.getElementById(part.id)!)
                            return {
                                skin,
                                theme,
                                label: part.label,
                                fg: paint([surface, cs.borderTopColor]),
                                bg: paint([surface])
                            }
                        })
                    },
                    { skin, theme, parts: PARTS.map((p) => ({ id: p.id, label: p.label })) }
                ))
            )
        }
    }

    const measured = rows.map((r) => ({ ...r, ratio: colord(r.fg).contrast(colord(r.bg)) }))
    const line = (r: (typeof measured)[number]) =>
        `${r.ratio.toFixed(2).padStart(5)}  ${r.label}  ${r.skin || 'ori'} · ${r.theme}  (${r.fg} on ${r.bg})`

    const worst = [...measured].sort((a, b) => a.ratio - b.ratio)[0]!
    // eslint-disable-next-line no-console
    console.log(`\n[non-text] ${measured.length} readings, floor ${worst.ratio.toFixed(2)} — ${line(worst)}`)

    const fails = measured.filter((r) => r.ratio < NON_TEXT)
    expect(fails.map(line).join('\n'), `${fails.length} boundary reading(s) below ${NON_TEXT}:1`).toBe('')
})
