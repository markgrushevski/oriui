import { test, expect, type Page } from '@playwright/test'

// Perf e2e for OriCombobox over REAL collections (1k / 10k options), in real Chromium. Two jobs:
//
//  1. Put numbers on a dimension nobody had measured. The component renders EVERY option — there is no
//     virtualization, and a closed listbox is `display:none` with all its <li> still in the DOM — so
//     cost is linear in the option count and the constant is what decides whether it janks.
//  2. Guard the `getOptionProps(item, index)` signature. Dropping the index and deriving it inside with
//     `collection.findIndex(...)` looks harmless, but that getter runs ONCE PER RENDERED OPTION, so an
//     O(n) body turns an O(n) render into O(n^2). `?variant=findindex` mounts exactly that variant
//     through the library's own swap seam (provideHeadless), and a counter-example proves the guard trips.
//
// All timing is `performance.now()` INSIDE the page (see harness/views/PerfCollectionsView.vue); wall
// clock around a Playwright call would measure the CDP round-trip instead of the work.
//
// The assertions are GROWTH RATIOS (10k vs 1k, same page load, seconds apart) rather than absolute
// millisecond counts, because a ratio moves far less with machine speed. Each size is measured twice and
// the BEST is kept, because contention only ever adds time.
test.describe.configure({ mode: 'serial' })

// Job 2 is timed on the getters alone, not on the component. A keystroke at 10k options also pays a
// linear Vue render, and on a CI runner that linear part is heavy enough to swamp the quadratic one:
// over 28 CI runs the component's keystroke grew x9.9-x17.1 with the shipped getter and only x18.4-x44.4
// with the findIndex one, so in a quarter of them the broken variant passed the component guard. One
// pass of the getters over every option, with no render around it, separates them by almost an order:
//
//   getter pass growth (1k -> 10k)   shipped x10.1-x10.8     findIndex x80-x96
//
// measured on a dev box plain, at a CDP CPU throttle of x4, and under four parallel workers (one outlier
// of x41.7 came from an unwarmed 1k pass, which the warm-up below removes). The guard sits between the
// two with room on both sides. If it ever flakes, re-measure before touching it.
const GETTER_GROWTH_MAX = 30

// The component ratios are a linearity alarm for a regression in the render itself, not a proof about
// the getter (above). Shipped on CI: keystroke x9.9-x17.1, mount x4.9-x11.6; dev box x12 and x7.
const ARROW_GROWTH_MAX = 24
const MOUNT_GROWTH_MAX = 14
// Absolute ceilings are machine-speed dependent in a way the ratios are not (10k keystroke: 37ms here,
// 588ms at x8 throttle; 10k filter: 17ms here, 256ms at x8), so they are catastrophe alarms only, set
// well above the x8-throttled number. They exist because a UNIFORM constant-factor regression — every
// size equally slower — is invisible to a ratio.
const ARROW_MEDIAN_MAX_MS = 1000
const FILTER_MAX_MS = 800

const SIZES = [1000, 10000]
const ROUNDS = 2

interface Run {
    size: number
    mount: number
    open: number
    arrows: number[]
    filter: number
    matched: number
    rendered: number
    highlighted: string | null
}

interface SizeSample {
    mount: number
    open: number
    arrowMedian: number
    filter: number
    matched: number
    rendered: number
    highlighted: string | null
}

const median = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)]
}

/**
 * One page load, both sizes, twice — so the growth ratio compares numbers taken on the same machine
 * within the same few seconds. A throwaway 200-option pass first pays the JIT warm-up, which would
 * otherwise land entirely on the 1k number, inflating the denominator and hiding a regression.
 */
async function measure(page: Page, variant: 'current' | 'findindex'): Promise<Run[]> {
    await page.goto(`/?variant=${variant}#perf`)
    await page.waitForFunction(() => Boolean(window.__oriPerf))
    expect(await page.evaluate(() => window.__oriPerf.variant)).toBe(variant)

    return page.evaluate(
        async ({ sizes, rounds }) => {
            const perf = window.__oriPerf

            // Warm-up — discarded.
            await perf.mount(200)
            await perf.open()
            await perf.arrows(5)

            const runs: Run[] = []
            for (let round = 0; round < rounds; round++) {
                for (const size of sizes) {
                    const mount = await perf.mount(size)
                    const rendered = perf.options()
                    const open = await perf.open()
                    // 20 keystrokes, the first 4 dropped: a fresh mount re-warms its own hot path, and
                    // that cost belongs to the mount, not to a keystroke.
                    const arrows = (await perf.arrows(20)).slice(4)
                    const highlighted = perf.highlighted()
                    // A query matching exactly one of `size` options: the expensive filter shape —
                    // scan everything, then unmount nearly everything.
                    const { ms: filter, matched } = await perf.filter(String(size - 1))
                    runs.push({ size, mount, open, arrows, filter, matched, rendered, highlighted })
                }
            }
            return runs
        },
        { sizes: SIZES, rounds: ROUNDS }
    )
}

/** Best observed round per size — noise adds time, it never removes it. */
function best(runs: Run[], size: number): SizeSample {
    const forSize = runs.filter((run) => run.size === size)
    return {
        mount: Math.min(...forSize.map((run) => run.mount)),
        open: Math.min(...forSize.map((run) => run.open)),
        arrowMedian: Math.min(...forSize.map((run) => median(run.arrows))),
        filter: Math.min(...forSize.map((run) => run.filter)),
        matched: forSize[0].matched,
        rendered: forSize[0].rendered,
        highlighted: forSize[0].highlighted
    }
}

function report(variant: string, samples: Record<number, SizeSample>): void {
    const round = (value: number) => +value.toFixed(1)
    const per = SIZES.map((size) => {
        const sample = samples[size]
        return `${size}={mount ${round(sample.mount)}ms, open ${round(sample.open)}ms, arrow ${round(
            sample.arrowMedian
        )}ms, filter ${round(sample.filter)}ms}`
    }).join(' ')
    const arrowGrowth = round(samples[10000].arrowMedian / samples[1000].arrowMedian)
    const mountGrowth = round(samples[10000].mount / samples[1000].mount)
    console.log(`[perf-collections] ${variant}: ${per} | growth arrow x${arrowGrowth} mount x${mountGrowth}`)
}

async function sample(page: Page, variant: 'current' | 'findindex'): Promise<Record<number, SizeSample>> {
    const runs = await measure(page, variant)
    return Object.fromEntries(SIZES.map((size) => [size, best(runs, size)]))
}

test('OriCombobox cost stays linear in the option count (1k / 10k, real Chromium)', async ({ page }) => {
    test.setTimeout(180_000)
    const samples = await sample(page, 'current')
    report('shipped', samples)

    // Every option is in the DOM: this is what "linear" is linear IN, and it is the honest shape of the
    // component today — no virtualization, so 10k options means 10k <li>.
    expect(samples[1000].rendered).toBe(1000)
    expect(samples[10000].rendered).toBe(10000)
    // The keystrokes did real work at both sizes: 20 ArrowDowns land on the 20th option.
    expect(samples[1000].highlighted).toBe('Option 19')
    expect(samples[10000].highlighted).toBe('Option 19')
    // The filter really reduced 10k options to the single match, so the measured cost is the real shape.
    expect(samples[10000].matched).toBe(1)

    const arrowGrowth = samples[10000].arrowMedian / samples[1000].arrowMedian
    const mountGrowth = samples[10000].mount / samples[1000].mount
    expect(arrowGrowth, `per-keystroke cost grew x${arrowGrowth.toFixed(1)} for 10x the options`).toBeLessThan(
        ARROW_GROWTH_MAX
    )
    expect(mountGrowth, `mount cost grew x${mountGrowth.toFixed(1)} for 10x the options`).toBeLessThan(MOUNT_GROWTH_MAX)
    expect(samples[10000].arrowMedian).toBeLessThan(ARROW_MEDIAN_MAX_MS)
    expect(samples[10000].filter).toBeLessThan(FILTER_MAX_MS)
})

/** One page load: warm the getters up, then the best of two passes per size. */
async function getterGrowth(page: Page, variant: 'current' | 'findindex'): Promise<{ growth: number; ms: number[] }> {
    await page.goto(`/?variant=${variant}#perf`)
    await page.waitForFunction(() => Boolean(window.__oriPerf))
    expect(await page.evaluate(() => window.__oriPerf.variant)).toBe(variant)
    const ms = await page.evaluate((sizes) => {
        const perf = window.__oriPerf
        perf.getters(sizes[0]!)
        return sizes.map((size) => Math.min(perf.getters(size), perf.getters(size)))
    }, SIZES)
    console.log(`[perf-collections] ${variant} getters: ${ms.map((v) => v.toFixed(2)).join('ms / ')}ms`)
    return { growth: ms[1]! / ms[0]!, ms }
}

test('the option getter costs the same at any collection size (one pass, 1k / 10k)', async ({ page }) => {
    const { growth } = await getterGrowth(page, 'current')
    expect(growth, `a getter pass grew x${growth.toFixed(1)} for 10x the options`).toBeLessThan(GETTER_GROWTH_MAX)
})

// The proof that the getter guard is not vacuous. `?variant=findindex` changes NOTHING about the output —
// same props, same ids — it only derives the option index with a findIndex over the collection inside the
// getter. If this test ever goes green, the guard above has stopped guarding.
test('deriving the option index inside the getter is quadratic, and trips the guard', async ({ page }) => {
    const { growth } = await getterGrowth(page, 'findindex')
    expect(
        growth,
        `the quadratic variant must exceed the guard (grew x${growth.toFixed(1)}), or the guard is vacuous`
    ).toBeGreaterThan(GETTER_GROWTH_MAX)
})
