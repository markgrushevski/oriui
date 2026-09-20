import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'
import { colord, extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'

/**
 * Role-as-TEXT contrast guard (the P2 axis the token unit test can't reach). oriUI's role tokens are
 * tuned as fill BACKGROUNDS; the non-fill variants (text / outline / soft), the selected tab, alert +
 * tag paint the role as FOREGROUND text via --ori-color-<role>-text (an on-surface tone derived from the
 * role by color-mix, with explicit AA overrides where the derivation misses). color-mix(in oklch, …)
 * only resolves to a concrete colour in a real engine, so this must run in Chromium — happy-dom axe has
 * no layout engine and the Node token guard can't evaluate color-mix. Every role × surface-text kind is
 * measured across every skin and both themes; the effective background composites a tonal tint over the
 * opaque surface. Anything below WCAG AA (4.5:1 body text) is collected and reported at once.
 *
 * FORM CONTROLS are in the probe too (field / input / select / textarea / combobox: label, required
 * marker, hint, error, the control's own value text, and the combobox listbox options). They were
 * missing until a 2.43:1 error message shipped: the Node token guard only walks role/on-role PAIRS —
 * a role used as a foreground is not a pair — and this spec never rendered the element at all. The
 * second test is the negative control that keeps that honest.
 */
extend([a11yPlugin])

const STYLES = path.resolve('packages/css/dist/styles.css')

const SKINS = ['', 'sumi', 'indigo', 'tech', 'health', 'luxury', 'neutral', 'cyber'] as const
const THEMES = ['light', 'dark'] as const
const ROLES = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const
const FORM_BLOCKS = ['field', 'input', 'select', 'textarea', 'combobox'] as const
const AA = 4.5
// Guarded readings at or below this are printed in full: the tuning tail, not a failure.
const WATCH = 6

// Each measured element carries its own foreground `color` AND its own `background-color` (transparent for
// text/outline/tab/link, a soft tint for soft/alert/tag), so one read per element captures the pair. The
// `[data-active]` tonal probes exercise the raised hover/active tint (the worst-contrast state — WCAG 1.4.3
// has no hover exemption). The `bare-*` probes carry NO `.ori-color_*` utility, so they exercise each block's
// BAKED `--ori-color-text` (the :root default can't derive a block-baked role) — baked defaults are
// button/tag/tabs/combobox → primary, alert → info.
//
// `data-muted` marks the deliberately-muted probes (an `opacity` / 50%-currentcolor tone: placeholders,
// disabled controls, the combobox empty message). They are measured and REPORTED but never asserted — sub-AA is the point of them. Keeping them in the probe rather than out of
// it means the excluded set is visible with live numbers instead of being a closed list in a comment, which is
// how the form text went unmeasured in the first place.
function markup(): string {
    // Role-dependent cells: everything whose foreground is `--ori-color-text` (or sits on a role tint).
    const cell = (role: string) => `
        <button class="ori-button ori-color_${role} ori-variant_text" data-role="${role}" data-kind="button-text">Text</button>
        <button class="ori-button ori-color_${role} ori-variant_outline" data-role="${role}" data-kind="button-outline">Outline</button>
        <button class="ori-button ori-color_${role} ori-variant_soft" data-role="${role}" data-kind="button-tonal">Soft</button>
        <button class="ori-button ori-color_${role} ori-variant_soft" data-active data-role="${role}" data-kind="button-soft-active">Soft</button>
        <button class="ori-button ori-color_${role} ori-variant_quiet" data-role="${role}" data-kind="button-quiet">Quiet</button>
        <a class="ori-link ori-color_${role}" href="#" data-role="${role}" data-kind="link">Link</a>
        <span class="ori-tag ori-color_${role}" data-role="${role}" data-kind="tag"><span class="ori-tag__text">Tag</span></span>
        <div class="ori-alert ori-color_${role}" data-role="${role}" data-kind="alert"><div class="ori-alert__content"><div class="ori-alert__title">Alert</div></div></div>
        <div class="ori-tabs ori-color_${role}"><div class="ori-tabs__list" role="tablist"><button class="ori-tabs__tab" role="tab" aria-selected="true" data-role="${role}" data-kind="tab-selected">Selected</button></div></div>
        <div class="ori-combobox ori-color_${role}">${listbox(role)}</div>`
    const bare = `
        <button class="ori-button ori-variant_text" data-role="baked-primary" data-kind="bare-button-text">Bare</button>
        <button class="ori-button ori-variant_soft" data-active data-role="baked-primary" data-kind="bare-button-soft-active">Bare</button>
        <span class="ori-tag" data-role="baked-primary" data-kind="bare-tag"><span class="ori-tag__text">Bare</span></span>
        <div class="ori-alert" data-role="baked-info" data-kind="bare-alert"><div class="ori-alert__content"><div class="ori-alert__title">Bare</div></div></div>
        <div class="ori-tabs"><div class="ori-tabs__list" role="tablist"><button class="ori-tabs__tab" role="tab" aria-selected="true" data-role="baked-primary" data-kind="bare-tab-selected">Bare</button></div></div>
        <div class="ori-combobox"><ul class="ori-combobox__listbox"><li class="ori-combobox__option ori-combobox__option_selected" data-role="baked-primary" data-kind="bare-combobox-option-selected">Bare</li></ul></div>`
    return surface(`${ROLES.map(cell).join('\n')}${bare}${form()}`)
}

// The probe's backdrop. It declares the on-surface TEXT tone alongside the surface background, the way
// every real surface block does (card / dialog / menu / popover / the combobox listbox all pair the two).
// Without the `color`, inherited text falls back to the UA default — pure black, or pure white under the
// theme's `color-scheme: dark` — so every cell that does NOT set its own colour (all the form labels,
// hints and control values) would be measured against the most flattering foreground that exists rather
// than the one oriUI actually paints. The role cells set their own `color`, so they are unaffected.
function surface(body: string): string {
    return `<div id="surface" style="background-color: var(--ori-color-surface); color: var(--ori-color-on-surface); padding: 24px">${body}</div>`
}

// The open listbox — role-tinted highlight and the role-toned selected label, on the popup's own opaque
// surface (NOT the page surface: `.ori-combobox__listbox` repaints `--ori-color-surface` under itself).
// Rendered without `.ori-anchored`, so it lays out in flow; only its colours are read.
function listbox(role: string): string {
    return `<ul class="ori-combobox__listbox">
            <li class="ori-combobox__option" data-highlighted data-role="${role}" data-kind="combobox-option-highlighted">Option</li>
            <li class="ori-combobox__option ori-combobox__option_selected" data-role="${role}" data-kind="combobox-option-selected">Option</li>
            <li class="ori-combobox__option ori-combobox__option_selected" data-highlighted data-role="${role}" data-kind="combobox-option-selected-highlighted">Option</li>
        </ul>`
}

// The control each form block wraps, in the shape the SFC renders. `aria-invalid` on the error cell makes
// it the real invalid state rather than an error paragraph floating on its own.
function control(block: string, invalid: boolean): string {
    const flag = invalid ? 'aria-invalid="true"' : `data-role="form" data-kind="${block}-value"`
    switch (block) {
        case 'field':
            // The composite case: a field wraps a real control, which inherits the field's text colour.
            return `<div class="ori-input"><input class="ori-input__field" value="Typed value" ${flag}></div>`
        case 'select':
            return `<div class="ori-select__control-wrap"><select class="ori-select__control" ${flag}><option>Chosen</option></select><span class="ori-select__chevron" aria-hidden="true"></span></div>`
        case 'textarea':
            return `<textarea class="ori-textarea__field" ${flag}>Typed value</textarea>`
        case 'combobox':
            return `<div class="ori-combobox__control"><input class="ori-input__field ori-combobox__input" value="Typed value" ${flag}></div>`
        default:
            return `<input class="ori-input__field" value="Typed value" ${flag}>`
    }
}

// Form text does NOT vary by role — a `.ori-color_*` on a field block repoints the focus ring and the
// invalid border, never the label / hint / error, which are on-surface text and the danger TEXT tone. So
// these are measured once per skin × theme like the `bare` block instead of six near-identical times; the
// role-dependent form cells (the listbox options) live in the role loop above. Checkbox / radio / switch
// labels are deliberately absent: they declare no colour of their own, so they read identically to
// `field-label`. Both states a real form shows are rendered — resting (hint) and invalid (error).
function form(): string {
    const cells = FORM_BLOCKS.map(
        (b) => `
        <div class="ori-${b}">
            <label class="ori-${b}__label" data-role="form" data-kind="${b}-label">Label<span class="ori-${b}__required" aria-hidden="true" data-role="form" data-kind="${b}-required">*</span></label>
            ${control(b, false)}
            <p class="ori-${b}__hint" data-role="form" data-kind="${b}-hint">Hint text</p>
        </div>
        <div class="ori-${b}">
            <label class="ori-${b}__label">Label<span class="ori-${b}__required" aria-hidden="true">*</span></label>
            ${control(b, true)}
            <p class="ori-${b}__error" role="alert" data-role="form" data-kind="${b}-error">Error message</p>
        </div>`
    ).join('\n')
    return `${cells}
        <div class="ori-input ori-input_solid"><input class="ori-input__field" value="Typed value" data-role="form" data-kind="input-fill-value"></div>
        <div class="ori-combobox"><ul class="ori-combobox__listbox">
            <li class="ori-combobox__option" data-role="form" data-kind="combobox-option">Option</li>
            <li class="ori-combobox__option" aria-disabled="true" data-muted data-role="form" data-kind="combobox-option-disabled">Option</li>
            <li class="ori-combobox__empty" data-role="form" data-kind="combobox-empty">No results</li>
        </ul></div>
        <div class="ori-input"><input class="ori-input__field" placeholder="Placeholder" data-pseudo="::placeholder" data-muted data-role="form" data-kind="input-placeholder"></div>
        <div class="ori-textarea"><textarea class="ori-textarea__field" placeholder="Placeholder" data-pseudo="::placeholder" data-muted data-role="form" data-kind="textarea-placeholder"></textarea></div>
        <div class="ori-input"><input class="ori-input__field" value="Typed value" disabled data-muted data-role="form" data-kind="input-disabled-value"></div>`
}

type Reading = { role: string; kind: string; muted: boolean; fg: string; bg: string }
type Row = Reading & { ratio: number; label: string }

// getComputedStyle returns color-mix results in their mix space (oklch(…) / color(srgb … / .25)), which
// colord can't parse. Resolve authoritatively in the engine: stack the colours on a 1×1 canvas (the opaque
// backdrop first, then the element's own possibly-translucent bg, then its text) and read back the
// composited sRGB pixel. `opacity` (the `quiet` variant, the hint, a disabled control) is a group fade, so
// it is applied to the element's own bg and text alike — the probes never put an opacity group around a
// painted background, which would need the fade carried through the whole stack.
async function readState(page: Page, skin: string, theme: string): Promise<Reading[]> {
    return page.evaluate(
        ({ skin, theme }) => {
            const html = document.documentElement
            if (skin) html.setAttribute('data-ori-skin', skin)
            else html.removeAttribute('data-ori-skin')
            html.className = `ori-theme_${theme}`

            const cv = document.createElement('canvas')
            cv.width = cv.height = 1
            const ctx = cv.getContext('2d')!
            // A colour the canvas refuses to parse leaves fillStyle untouched, so reset to transparent
            // first: an unparseable value then reads as alpha 0 instead of reusing the previous colour.
            const fill = (c: string) => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0)'
                ctx.fillStyle = c
            }
            const paint = (stack: [string, number][]): string => {
                ctx.clearRect(0, 0, 1, 1)
                for (const [c, a] of stack) {
                    ctx.globalAlpha = a
                    fill(c)
                    ctx.fillRect(0, 0, 1, 1)
                }
                ctx.globalAlpha = 1
                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
                return `rgb(${r} ${g} ${b})`
            }
            // Authoritative alpha for any colour syntax (rgb / rgba / oklab / color(srgb …)): let the
            // engine rasterise it and read the alpha channel back.
            const alphaOf = (c: string): number => {
                ctx.clearRect(0, 0, 1, 1)
                ctx.globalAlpha = 1
                fill(c)
                ctx.fillRect(0, 0, 1, 1)
                return ctx.getImageData(0, 0, 1, 1).data[3] / 255
            }

            // What is actually behind this element: every painted ancestor background up to the first
            // OPAQUE one (the page surface for most cells, the listbox's own surface for an option), plus
            // the opacity it inherits from the groups it sits in.
            const backdrop = (el: HTMLElement): { stack: [string, number][]; alpha: number } => {
                const stack: [string, number][] = []
                let alpha = 1
                for (let p = el.parentElement; p; p = p.parentElement) {
                    const cs = getComputedStyle(p)
                    alpha *= parseFloat(cs.opacity)
                    const a = alphaOf(cs.backgroundColor)
                    if (a > 0) {
                        stack.unshift([cs.backgroundColor, 1])
                        if (a === 1) break
                    }
                }
                return { stack, alpha }
            }

            return [...document.querySelectorAll<HTMLElement>('[data-kind]')].map((el) => {
                const cs = getComputedStyle(el)
                const { stack, alpha } = backdrop(el)
                const a = alpha * parseFloat(cs.opacity)
                // `::placeholder` carries its own colour; everything else reads the element's own.
                const fg = getComputedStyle(el, el.dataset.pseudo ?? null).color
                const under: [string, number][] = [...stack, [cs.backgroundColor, a]]
                return {
                    role: el.dataset.role!,
                    kind: el.dataset.kind!,
                    muted: el.hasAttribute('data-muted'),
                    fg: paint([...under, [fg, a]]),
                    bg: paint(under)
                }
            })
        },
        { skin, theme }
    )
}

// Form controls transition `background-color`, and the stylesheet lands AFTER the markup — without the
// transition killer every field reads mid-flight from the UA `field` colour (an opaque white, in BOTH
// themes) and the numbers are fiction. Any probe added here needs this.
async function prepare(page: Page, body: string): Promise<void> {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.setContent(`<!doctype html><html><head></head><body>${body}</body></html>`)
    await page.addStyleTag({ path: STYLES })
    await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' })
}

async function sweep(page: Page, themes: readonly string[] = THEMES): Promise<Row[]> {
    const rows: Row[] = []
    for (const skin of SKINS)
        for (const theme of themes)
            for (const r of await readState(page, skin, theme))
                rows.push({
                    ...r,
                    ratio: colord(r.fg).contrast(r.bg),
                    label: `${skin || 'ori'} · ${theme} · ${r.role} · ${r.kind}`
                })
    return rows
}

const line = (r: Row): string => `${r.ratio.toFixed(2).padStart(6)}  ${r.label}  (${r.fg} on ${r.bg})`

// Worst reading per kind — the whole matrix is ~1600 rows, and the per-kind floor is what tuning needs.
function worstPerKind(rows: Row[]): string {
    const worst = new Map<string, Row>()
    for (const r of rows) if (!worst.has(r.kind) || worst.get(r.kind)!.ratio > r.ratio) worst.set(r.kind, r)
    return [...worst.values()]
        .sort((a, b) => a.ratio - b.ratio)
        .map((r) => `${r.ratio.toFixed(2).padStart(6)}  ${r.kind.padEnd(34)} ${r.label}`)
        .join('\n')
}

test.describe('role-as-text contrast — WCAG AA (4.5:1) across every skin, theme, role and text kind', () => {
    test('every role-as-text pairing meets AA in both themes and all preset skins', async ({ page }) => {
        await prepare(page, markup())
        const rows = await sweep(page)
        const guarded = rows.filter((r) => !r.muted)

        // Surfaced for tuning: the per-kind floor, then every guarded reading in the tail.
        console.log(`— worst guarded reading per kind (${guarded.length} readings) —\n${worstPerKind(guarded)}`)
        console.log(`— deliberately muted, measured but NOT asserted —\n${worstPerKind(rows.filter((r) => r.muted))}`)
        const tail = guarded.filter((r) => r.ratio < WATCH).sort((a, b) => a.ratio - b.ratio)
        console.log(`— every guarded reading below ${WATCH}:1 (${tail.length}) —\n${tail.map(line).join('\n')}`)

        const failures = guarded.filter((r) => r.ratio < AA).map(line)
        expect(failures, `${failures.length} role-as-text pairings below AA:\n${failures.join('\n')}`).toEqual([])
    })

    // The negative control. Without it a broken reader (a canvas that stops compositing, a probe that
    // stops matching) would report 21:1 for everything and the suite would stay green through the exact
    // regression it exists to catch. The raw `--ori-color-danger` as body text IS that regression: it is
    // what `.ori-field__error` and its nine twins declared until the fix, and it measures ~2.1–2.9:1 on
    // every dark skin. Driven by an inline style so the stylesheet under test is never edited.
    test('the guard bites: the raw danger role as text is caught on every dark skin', async ({ page }) => {
        await prepare(
            page,
            surface(`
                <p class="ori-field__error" style="color: var(--ori-color-danger)" data-role="canary" data-kind="raw-role-as-text">Regression</p>
                <p class="ori-field__error" data-role="canary" data-kind="danger-text-tone">Error message</p>`)
        )
        const rows = await sweep(page, ['dark'])
        console.log(`— negative control —\n${rows.map(line).join('\n')}`)

        const missed = rows.filter((r) => r.kind === 'raw-role-as-text' && r.ratio >= AA).map(line)
        expect(
            missed,
            `the probe stopped catching the pre-fix error colour on ${missed.length} skins:\n${missed.join('\n')}`
        ).toEqual([])

        // …and the shipped tone, measured by the same pipeline on the same element, clears AA — so the
        // reading above is the colour, not a broken probe.
        const regressed = rows.filter((r) => r.kind === 'danger-text-tone' && r.ratio < AA).map(line)
        expect(
            regressed,
            `the danger TEXT tone fell below AA on ${regressed.length} dark skins:\n${regressed.join('\n')}`
        ).toEqual([])
    })

    /**
     * The axis the two tests above cannot reach: an ANCESTOR that fades a whole subtree. Every probe
     * elsewhere in this file carries its own opacity at most, and the comment above readState admits it —
     * "the probes never put an opacity group around a painted background". A container fade is a different
     * defect from a badly-toned token: the token pair stays honestly AA, and the contrast is lost on the
     * way to the screen, so neither the Node token guard (it reads pairs, never a render) nor an axe pass
     * (it reads declared colours) can see it. Only a composited reading can.
     *
     * The case that made this necessary: `.ori-dialog__body` carried `opacity: 0.85`, which applied to the
     * caller's whole slot — controls included — and multiplied with a field hint's own 0.7 into 0.595.
     * Reported from the justpaint session (JP-O-09 → ORI-I-85).
     */
    test('a dialog body does not fade the content it wraps below AA', async ({ page }) => {
        await prepare(
            page,
            `<div class="ori-dialog"><div class="ori-dialog__content">
                <h2 class="ori-dialog__title">Title</h2>
                <div class="ori-dialog__body">
                    <p data-role="dialog" data-kind="dialog-body-text">Body copy inside the dialog.</p>
                    <a class="ori-link" href="#" data-role="dialog" data-kind="dialog-link">Link</a>
                    <button class="ori-button ori-variant_solid" data-role="dialog" data-kind="dialog-button-fill">Confirm</button>
                    <button class="ori-button ori-color_danger ori-variant_solid" data-role="dialog" data-kind="dialog-button-danger">Delete</button>
                    <button class="ori-button ori-variant_outline" data-role="dialog" data-kind="dialog-button-outline">Cancel</button>
                    <div class="ori-field">
                        <label class="ori-field__label" data-role="dialog" data-kind="dialog-field-label">Label</label>
                        <div class="ori-input"><input class="ori-input__field" value="Typed value" data-role="dialog" data-kind="dialog-input-value"></div>
                        <p class="ori-field__hint" data-role="dialog" data-kind="dialog-field-hint">Hint text</p>
                    </div>
                </div>
            </div></div>`
        )
        const rows = await sweep(page)

        console.log(`— inside a dialog body (${rows.length} readings) —\n${worstPerKind(rows)}`)

        const failures = rows.filter((r) => r.ratio < AA).map(line)
        expect(
            failures,
            `${failures.length} readings inside a dialog body fall below AA — an ancestor fade is eating the contrast:\n${failures.join('\n')}`
        ).toEqual([])
    })
})
