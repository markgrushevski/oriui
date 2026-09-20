import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { colord, extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'

/**
 * Design-token contrast guard. oriUI promises that every colour role ships a contrast-checked
 * `--ori-color-on-*` pair, across light/dark and every preset skin. This test makes that promise
 * executable: it reads the token CSS, resolves `var(--ori-neutral-*)` references, and asserts the
 * WCAG contrast ratio of each role/on-role pairing meets AA for body text (>= 4.5:1). A failed
 * skin pairing names itself, so a regression points straight at the offending token.
 */

// The WCAG 2.x contrast math is colord's job (its a11y plugin), so the ratios track a maintained
// reference implementation instead of a hand-rolled one. colord parses hex, the legacy `hsl(h, s%, l%)`
// AND the modern space-separated `hsl(h s% l%)` used by some skins, so token values pass through as-is.
extend([a11yPlugin])

const contrast = (fg: string, bg: string): number => colord(fg).contrast(bg)

// ---- Load + parse the token CSS ----
const themesDir = resolve(process.cwd(), 'packages/css/src/themes')
const baseCss = readFileSync(resolve(themesDir, '_themes-color-tokens.css'), 'utf8')
const skinsCss = readFileSync(resolve(themesDir, '_themes-skins.css'), 'utf8')

// Neutral ramp — the single source for var(--ori-neutral-N) references used by some skins.
const neutrals: Record<string, string> = {}
for (const [, name, hex] of baseCss.matchAll(/(--ori-neutral-\d+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) {
    neutrals[name] = hex
}

// A colour value is usable if it's a literal hex, a literal hsl(), or a var() pointing at the neutral
// ramp; `var(--ori-color-*)` alias references resolve elsewhere and are skipped (not source colours).
function resolveValue(raw: string): string | null {
    const v = raw.trim().replace(/;$/, '')
    if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v
    if (/^hsla?\(/.test(v)) return colord(v).isValid() ? v : null
    const ref = v.match(/^var\(\s*(--ori-neutral-\d+)\s*\)$/)
    return ref ? (neutrals[ref[1]] ?? null) : null
}

// Strip comments + the single `@layer ori.tokens { ... }` wrapper so what's left is a flat list
// of `selector { decls }` blocks with no nesting (each file has exactly one such wrapper).
function flatBlocks(css: string): Array<{ selector: string; tokens: Record<string, string> }> {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
    const open = noComments.indexOf('{', noComments.indexOf('@layer'))
    const flat = noComments.slice(open + 1, noComments.lastIndexOf('}'))

    const blocks: Array<{ selector: string; tokens: Record<string, string> }> = []
    for (const m of flat.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
        const tokens: Record<string, string> = {}
        for (const [, name, val] of m[2].matchAll(/(--ori-color-[\w-]+)\s*:\s*([^;]+);/g)) {
            const resolved = resolveValue(val)
            if (resolved) tokens[name] = resolved
        }
        blocks.push({ selector: m[1].trim(), tokens })
    }
    return blocks
}

// ---- Build the list of (skin, role, mode) pairings to check ----
const ROLES = ['primary', 'secondary', 'surface', 'background'] as const
const STATUS = ['success', 'warning', 'danger', 'info'] as const
const MODES = ['light', 'dark'] as const
const AA = 4.5

// Recorded contrast debt — pairings known to sit below AA, kept visible instead of silently passing.
// An entry needs a DECISIONS.md rationale; remove it the moment the pairing is fixed (a stale entry
// fails the guard below). Key: the pair label; value: the accepted minimum ratio.
const KNOWN_BELOW_AA: Record<string, number> = {}

type Pair = { label: string; fg: string; bg: string }
const pairs: Pair[] = []

for (const css of [baseCss, skinsCss]) {
    for (const { selector, tokens } of flatBlocks(css)) {
        const skinMatch = selector.match(/data-ori-skin=['"]([\w-]+)['"]/)
        // The base "Ori" skin is the bare :root block that actually carries role source tokens
        // (the neutral-ramp :root block carries none, so it's skipped here).
        const isBaseOri = !skinMatch && selector === ':root' && '--ori-color-primary-light' in tokens
        const skin = skinMatch ? skinMatch[1] : isBaseOri ? 'ori' : null
        if (!skin) continue

        for (const role of ROLES) {
            for (const mode of MODES) {
                const bg = tokens[`--ori-color-${role}-${mode}`]
                const fg = tokens[`--ori-color-on-${role}-${mode}`]
                if (bg && fg) pairs.push({ label: `${skin} · ${role} (${mode})`, fg, bg })
            }
        }

        if (skin === 'ori') {
            for (const role of STATUS) {
                const bg = tokens[`--ori-color-${role}`]
                const fg = tokens[`--ori-color-on-${role}`]
                if (bg && fg) pairs.push({ label: `status · ${role}`, fg, bg })
            }
        }
    }
}

describe('Design-token contrast (WCAG AA for body text, >= 4.5:1)', () => {
    it('discovers every role/on-role pairing across all skins', () => {
        // base Ori: 4 roles x 2 modes (8) + 4 status (4); 7 preset skins x 4 roles x 2 modes (56).
        expect(pairs.length).toBeGreaterThanOrEqual(8 + 4 + 7 * 8)
    })

    it('the KNOWN_BELOW_AA exception list carries no stale entries', () => {
        const labels = new Set(pairs.map((p) => p.label))
        const stale = Object.keys(KNOWN_BELOW_AA).filter((label) => !labels.has(label))
        expect(stale, `exceptions for pairings that no longer exist: ${stale.join(', ')}`).toEqual([])
        for (const { label, fg, bg } of pairs) {
            if (label in KNOWN_BELOW_AA && contrast(fg, bg) >= AA) {
                expect.fail(`${label} now meets AA — remove its KNOWN_BELOW_AA entry`)
            }
        }
    })

    for (const { label, fg, bg } of pairs) {
        const floor = KNOWN_BELOW_AA[label] ?? AA
        const debt = label in KNOWN_BELOW_AA ? ' [recorded contrast debt — below AA]' : ''
        it(`${label}: ${fg} on ${bg}${debt}`, () => {
            const ratio = contrast(fg, bg)
            expect(ratio, `${label} -> ${ratio.toFixed(2)}:1 (need >= ${floor})`).toBeGreaterThanOrEqual(floor)
        })
    }
})

/**
 * Role-as-TEXT source guard — the axis the pairings above structurally cannot see. The list they walk is
 * role/on-role pairs, so a block that paints a role token straight onto the surface (`color:
 * var(--ori-color-danger)`) is simply not a pairing and never gets measured — that is how every form
 * block shipped its error / required marker at ~2.4:1 on the dark surface. This guard therefore derives
 * its subjects FROM the stylesheets instead of a hand-kept list: it reads every CSS source in the css
 * package and fails on any `color` (or downstream text custom property) fed a raw role token. The AA
 * arithmetic for the correct `--ori-color-<role>-text` tone stays in e2e/text-contrast.spec.ts — the tone
 * is relative colour (`oklch(from … )`), which only a real engine can resolve — so what belongs here is
 * the structural rule: a raw role is a fill BACKGROUND, never a foreground.
 */
const ROLE_TOKEN = String.raw`--ori-color-(?:primary|secondary|success|warning|danger|info)(?:-light|-dark)?`

// `(?<![-\w])` keeps the non-text axes out: `border-color` / `background-color` / `caret-color` /
// `outline-color`, and the `--ori-color*` custom-property declarations, all carry a `-` or word character
// straight before `color`. The boundary half of those axes has its own rule further down — this one is
// about foreground text only.
const AS_TEXT = String.raw`(?<![-\w])color\s*:\s*var\(\s*(${ROLE_TOKEN})\s*[,)]`
// The two custom properties that hand a foreground tone to a block downstream; a raw role in either is
// the same defect one hop away.
const AS_TEXT_TOKEN = String.raw`(?:--ori-color-text|--ori-variant-text-color)\s*:\s*var\(\s*(${ROLE_TOKEN})\s*[,)]`

// Blank out comments while keeping every newline, so reported line numbers match the file on disk.
const blankComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))

function findRoleAsText(file: string, css: string): string[] {
    const src = blankComments(css)
    const hits: string[] = []
    for (const pattern of [AS_TEXT, AS_TEXT_TOKEN]) {
        for (const m of src.matchAll(new RegExp(pattern, 'g'))) {
            const line = src.slice(0, m.index).split('\n').length
            hits.push(`${file}:${line} -> ${m[0].trim()}`)
        }
    }
    return hits
}

function cssSources(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = resolve(dir, entry.name)
        if (entry.isDirectory()) return cssSources(full)
        return entry.name.endsWith('.css') ? [full] : []
    })
}

const cssRoot = resolve(process.cwd(), 'packages/css/src')
const sources = cssSources(cssRoot).map((file) => ({
    file: file.slice(cssRoot.length + 1).replaceAll('\\', '/'),
    css: readFileSync(file, 'utf8')
}))

describe('Role tokens are never painted as foreground text', () => {
    it('sees the whole css package (a guard that scans nothing would pass silently)', () => {
        expect(sources.length).toBeGreaterThanOrEqual(30)
        expect(sources.map((s) => s.file)).toEqual(expect.arrayContaining(['components/field.css', 'styles.css']))
    })

    it('flags a raw role as text and leaves the non-text axes alone (self-check)', () => {
        expect(findRoleAsText('x.css', '.a { color: var(--ori-color-danger); }')).toHaveLength(1)
        expect(findRoleAsText('x.css', '.a { --ori-color-text: var(--ori-color-warning); }')).toHaveLength(1)
        // The AA-safe tone, and the axes that deliberately keep the raw role, must not trip it.
        expect(findRoleAsText('x.css', '.a { color: var(--ori-color-danger-text); }')).toEqual([])
        expect(findRoleAsText('x.css', '.a { border-color: var(--ori-color-danger); }')).toEqual([])
        expect(findRoleAsText('x.css', '.a { --ori-color: var(--ori-color-danger); }')).toEqual([])
        // A comment quoting the anti-pattern is prose, not a declaration.
        expect(findRoleAsText('x.css', '/* never color: var(--ori-color-danger) */')).toEqual([])
    })

    for (const { file, css } of sources) {
        it(`${file} paints no raw role as text`, () => {
            const hits = findRoleAsText(file, css)
            expect(
                hits,
                `raw role token used as foreground — use var(--ori-color-<role>-text):\n${hits.join('\n')}`
            ).toEqual([])
        })
    }
})

/**
 * Theme-shared STATUS roles are never painted as a BOUNDARY — the WCAG 1.4.11 sibling of the rule above.
 *
 * `success` / `warning` / `danger` / `info` are declared once and shared by both themes (they own their hue;
 * see the "Status — shared across both themes" block in _themes-color-tokens.css). They therefore have no
 * `-dark` source to switch to, and their single value is tuned as a FILL background on the light surface.
 * Used as a border, an outline or a focus ring on a dark surface the raw role has nothing to adapt with:
 * `--ori-color-danger` (#b91c1c) measured 2.08-2.85:1 against the eight dark skin surfaces, under the 3:1
 * minimum for a UI-component boundary. The `-text` tone is the same hue with its lightness clamped per
 * theme, which is what the outline variant already reads for its border.
 *
 * The four ROLE colours (primary / secondary / surface / background) are deliberately NOT in this rule:
 * each has a per-theme source pair, so a raw role on a boundary can be theme-correct — the colour picker's
 * `outline: 2px solid var(--ori-color-primary)` is legitimate and must stay passing.
 */
const STATUS_TOKEN = String.raw`--ori-color-(?:success|warning|danger|info)`
// Longhand or shorthand, plus the box-shadow focus ring (a boundary drawn with a shadow is still a
// boundary). `[^;{}]*` keeps the match inside one declaration so it cannot run past a `;` into the next.
const AS_BOUNDARY = String.raw`(?<![-\w])(border|outline|box-shadow)(-[\w-]+)?\s*:[^;{}]*var\(\s*(${STATUS_TOKEN})\s*[,)]`

function findStatusAsBoundary(file: string, css: string): string[] {
    const src = blankComments(css)
    const hits: string[] = []
    for (const m of src.matchAll(new RegExp(AS_BOUNDARY, 'g'))) {
        const line = src.slice(0, m.index).split('\n').length
        hits.push(`${file}:${line} -> ${m[0].trim()}`)
    }
    return hits
}

describe('Theme-shared status roles are never painted as a boundary', () => {
    it('flags the boundary axes and leaves the per-theme roles alone (self-check)', () => {
        expect(findStatusAsBoundary('x.css', '.a { border-color: var(--ori-color-danger); }')).toHaveLength(1)
        expect(findStatusAsBoundary('x.css', '.a { border: 1px solid var(--ori-color-warning); }')).toHaveLength(1)
        expect(findStatusAsBoundary('x.css', '.a { outline: 2px solid var(--ori-color-info); }')).toHaveLength(1)
        expect(
            findStatusAsBoundary(
                'x.css',
                '.a { box-shadow: 0 0 0 3px color-mix(in srgb, var(--ori-color-danger) 25%, transparent); }'
            )
        ).toHaveLength(1)
        // The clamped tone, the per-theme roles and the resolved alias are all correct on a boundary.
        expect(findStatusAsBoundary('x.css', '.a { border-color: var(--ori-color-danger-text); }')).toEqual([])
        expect(findStatusAsBoundary('x.css', '.a { outline: 2px solid var(--ori-color-primary); }')).toEqual([])
        expect(findStatusAsBoundary('x.css', '.a { border-color: var(--ori-color, currentcolor); }')).toEqual([])
        // A status role as a FILL is exactly what it is for.
        expect(findStatusAsBoundary('x.css', '.a { background: var(--ori-color-danger); }')).toEqual([])
        // One declaration's match must not leak into the next.
        expect(findStatusAsBoundary('x.css', '.a { border-color: red; background: var(--ori-color-danger); }')).toEqual(
            []
        )
    })

    for (const { file, css } of sources) {
        it(`${file} paints no shared status role as a boundary`, () => {
            const hits = findStatusAsBoundary(file, css)
            expect(
                hits,
                `theme-shared status role on a boundary — use var(--ori-color-<role>-text):\n${hits.join('\n')}`
            ).toEqual([])
        })
    }
})

/**
 * Derived tokens are THEME-SCOPED, so a theme class works on a non-root element.
 *
 * Custom-property substitution resolves where a property is DECLARED, not where it is used. A token
 * written once in the bare `:root` rule as `var(--ori-color-on-surface)` therefore freezes to the root
 * theme's value and merely INHERITS into a `.ori-theme_dark` subtree — the region's own theme class
 * repoints the surface but not the ink, so the text was measured at 1.03:1 inside a dark region on a
 * light page, and a light region on a dark page read 1.13:1 with the dark theme's shadows.
 *
 * Two clauses, because the defect had two shapes:
 *   parity — whatever the dark rule declares, the light rule declares too (the six `-text` clamps were
 *            dark-only; the elevation shadows had no light rule at all);
 *   derivation — a token whose value reads a theme-varying token must itself be theme-scoped (the
 *            neutral `--ori-color-text` default was in neither rule).
 * "Theme-varying" is DISCOVERED (tokens present in both theme rules), never hand-listed, so the guard
 * cannot rot into agreeing with whatever the file happens to say.
 */
const elevationCss = readFileSync(resolve(themesDir, '_themes-elevation.css'), 'utf8')

function declBlocks(css: string): Array<{ selector: string; decls: Record<string, string> }> {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
    const open = noComments.indexOf('{', noComments.indexOf('@layer'))
    const flat = noComments.slice(open + 1, noComments.lastIndexOf('}'))

    const blocks: Array<{ selector: string; decls: Record<string, string> }> = []
    for (const m of flat.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
        const decls: Record<string, string> = {}
        for (const [, name, val] of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) decls[name] = val.trim()
        blocks.push({ selector: m[1].trim().replace(/\s+/g, ' '), decls })
    }
    return blocks
}

function themeScopeReport(file: string, css: string): { missingLight: string[]; unscoped: string[] } {
    const blocks = declBlocks(css)
    const declaredUnder = (cls: string): Set<string> => {
        const set = new Set<string>()
        for (const b of blocks) {
            if (!b.selector.split(',').some((s) => s.trim().includes(cls))) continue
            for (const name of Object.keys(b.decls)) set.add(name)
        }
        return set
    }
    const light = declaredUnder('.ori-theme_light')
    const dark = declaredUnder('.ori-theme_dark')
    const varying = new Set([...dark].filter((t) => light.has(t)))

    const unscoped: string[] = []
    for (const b of blocks) {
        for (const [name, value] of Object.entries(b.decls)) {
            const refs = [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1])
            if (!refs.some((r) => varying.has(r))) continue
            if (light.has(name) && dark.has(name)) continue
            unscoped.push(`${file} \`${b.selector}\` { ${name}: ${value} }`)
        }
    }
    return { missingLight: [...dark].filter((t) => !light.has(t)).map((t) => `${file} ${t}`), unscoped }
}

describe('Derived theme tokens are re-declared per theme, not inherited', () => {
    it('catches both shapes of the defect (self-check)', () => {
        const broken = `@layer ori.tokens {
            :root { --ori-color-on-surface: #fff; --ori-color-text: var(--ori-color-on-surface); }
            :root.light, .ori-theme_light { --ori-color-on-surface: #000; }
            :root.dark, .ori-theme_dark { --ori-color-on-surface: #fff; --ori-color-primary-text: var(--ori-color-on-surface); }
        }`
        const brokenReport = themeScopeReport('x.css', broken)
        // The dark-only clamp trips parity; it is also unscoped, so both clauses name it. The root-only
        // derive trips derivation alone — which is the half parity structurally cannot see.
        expect(brokenReport.missingLight).toEqual(['x.css --ori-color-primary-text'])
        expect(brokenReport.unscoped.map((h) => h.split('{ ')[1])).toEqual([
            '--ori-color-text: var(--ori-color-on-surface) }',
            '--ori-color-primary-text: var(--ori-color-on-surface) }'
        ])

        const fixed = `@layer ori.tokens {
            :root { --ori-color-on-surface: #fff; }
            :root, :root.light, .ori-theme_light { --ori-color-text: var(--ori-color-on-surface); --ori-color-primary-text: var(--ori-color-on-surface); }
            :root.light, .ori-theme_light { --ori-color-on-surface: #000; }
            :root.dark, .ori-theme_dark { --ori-color-on-surface: #fff; --ori-color-text: var(--ori-color-on-surface); --ori-color-primary-text: var(--ori-color-on-surface); }
        }`
        expect(themeScopeReport('x.css', fixed)).toEqual({ missingLight: [], unscoped: [] })
    })

    for (const [file, css] of [
        ['themes/_themes-color-tokens.css', baseCss],
        ['themes/_themes-elevation.css', elevationCss]
    ] as const) {
        it(`${file} re-declares every theme-varying token in both themes`, () => {
            const { missingLight } = themeScopeReport(file, css)
            expect(
                missingLight,
                `declared for .ori-theme_dark but not for .ori-theme_light — a light subtree inside a dark page keeps the dark value:\n${missingLight.join('\n')}`
            ).toEqual([])
        })

        it(`${file} theme-scopes every token derived from a theme-varying one`, () => {
            const { unscoped } = themeScopeReport(file, css)
            expect(
                unscoped,
                `derived in a rule that carries no theme — it will substitute once at the root and inherit:\n${unscoped.join('\n')}`
            ).toEqual([])
        })
    }
})

/**
 * Structure has a name now. Borders, dividers and control edges derive from `--ori-color-outline` /
 * `--ori-color-outline-strong` instead of each block inventing its own `currentcolor` percentage — that
 * divergence is what left a consumer with nothing to repoint and no way to know our numbers.
 *
 * The guard is narrow on purpose: it polices the STRUCTURAL properties only. A background tint at 4-14%
 * is a different axis (hover, zebra, a progress track) and must stay a per-component mix, because a token
 * that covered both would be a name that lies about what it controls.
 */
describe('Structural borders read the outline token, never a hand-rolled mix', () => {
    const STRUCTURAL =
        /^\s*(?:border[a-z-]*|outline[a-z-]*|--ori-[a-z-]+-border)\s*:\s*[^;]*color-mix\(in srgb,\s*currentcolor/gm

    for (const { file: name, css } of sources) {
        // The token file itself is where the two mixes legitimately live.
        if (name.includes('_themes-color-tokens')) continue
        // Named exception, reviewable rather than silent: the checkbox and radio box edge is a THIRD
        // structural weight (40%) — the unfilled interactive target has to read as an affordance, and
        // dropping it to the 28% control edge visibly weakens it. Whether 40% is itself enough for the
        // 3:1 non-text bar is a separate, measured question (ISSUES-INNER), not a token question.
        if (name.endsWith('checkbox.css') || name.endsWith('radio.css')) continue

        it(`${name} has no hand-rolled structural mix`, () => {
            const offenders = [...blankComments(css).matchAll(STRUCTURAL)].map((m) => m[0].trim())

            expect(
                offenders,
                `use var(--ori-color-outline) / var(--ori-color-outline-strong):\n${offenders.join('\n')}`
            ).toEqual([])
        })
    }

    it('the matcher sees a hand-rolled border and ignores a background tint', () => {
        const bad = ['.x {', '    border: 1px solid color-mix(in srgb, currentcolor 12%, transparent);', '}'].join('\n')
        const fine = ['.x {', '    background-color: color-mix(in srgb, currentcolor 12%, transparent);', '}'].join(
            '\n'
        )

        expect([...blankComments(bad).matchAll(STRUCTURAL)]).toHaveLength(1)
        expect([...blankComments(fine).matchAll(STRUCTURAL)]).toHaveLength(0)
    })
})
