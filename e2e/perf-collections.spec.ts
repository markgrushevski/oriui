import { test, expect, type Page } from '@playwright/test'

// Perf e2e for OriCombobox over REAL collections (1k / 10k options), in real Chromium. Two jobs:
//
//  1. Put numbers on a dimension nobody had measured. The component renders EVERY option — there is no
//     virtualization, and a closed listbox is `display:none` with all its <li> still in the DOM — so
//     cost is linear in the option count and the constant is what decides whether it janks.
//  2. Guard the `getOptionProps(item, index)` signature. ISSUES-INNER proposes dropping the index and
//     deriving it inside with `collection.findIndex(...)`. That getter runs ONCE PER RENDERED OPTION,
//     so an O(n) body turns an O(n) render into O(n^2). `?variant=findindex` mounts exactly that
//     variant through the library's own swap seam (provideHeadless), and the second test proves it
//     trips this guard — a threshold nothing can fail is not a guard.
//
// All timing is `performance.now()` INSIDE the page (see harness/views/PerfCollectionsView.vue), around
// a dispatch + Vue flush + forced layout; wall clock around a Playwright call would measure the CDP
// round-trip instead of the render, and paint is deliberately out of scope — what is measured is the
// scripting + layout a keystroke costs.
//
// The primary assertion is a GROWTH RATIO (10k vs 1k, same page load, seconds apart) rather than an
// absolute millisecond count, because the ratio moves far less with machine speed: over an 8x CPU
// throttle the 10k keystroke cost moved 37ms -> 588ms (16x) while its growth ratio moved 11.7 -> 15.5
// (1.3x). It does NOT cancel out entirely — see the measured table below, which is why the threshold is
// placed off the throttled numbers and not off this box's. Each size is measured twice and the BEST
// round is kept, because contention only ever adds time.
test.describe.configure({ mode: 'serial' })

// Measured on a 2026 dev box, Chromium 149 — best of 2 rounds, median of 16 warm keystrokes:
//   shipped   1k: mount 11ms  open 28ms  arrow 3.2ms | 10k: mount 78ms  open 290ms  arrow 37ms
//   findIndex 1k: mount 14ms  open 30ms  arrow 7.1ms | 10k: mount 261ms open 473ms  arrow 246ms
//
// The thresholds below are NOT guesses off those numbers — a slow runner was simulated with CDP
// `Emulation.setCPUThrottlingRate` and measured, because the growth ratio does NOT hold constant as
// the box slows down (JS throttles, layout and memory traffic do not, so the 10k side stretches more):
//
//   arrow growth   shipped x1 11.7 | x4 16.2 | x8 15.5        findIndex x1 34.4 | x4 50.1
//   mount growth   shipped x1  6.6 | x4  8.0 | x8  8.3        findIndex x1 17.7 | x4 31.9
//   10k arrow ms   shipped x1   37 | x4  266 | x8  588        findIndex x1  246 | x4 1768
//
// So the shipped ratio plateaus near 16 however slow the box gets, while the broken one is never below
// 34: the guard goes between the WORST shipped number and the BEST broken one, at the geometric
// midpoint of 16.2 and 34.4. The broken variant was confirmed to fail this exact assertion
// ("per-keystroke cost grew x34.5 for 10x the options"). If it ever flakes, re-measure before touching
// it — `page.context().newCDPSession(page)` then `Emulation.setCPUThrottlingRate {rate: 4}` around the
// same `measure()` reproduces the table above. Do NOT delete it; the signal it separates is 3x wide.
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

// The proof that the guard above is not vacuous. `?variant=findindex` changes NOTHING about the output —
// same options, same highlight, same ids — it only derives the option index with a findIndex over the
// collection inside the getter, which is precisely the refactor ISSUES-INNER proposes. If this test ever
// goes green, the guard above has stopped guarding.
test('deriving the option index inside the getter is quadratic, and trips the guard', async ({ page }) => {
    test.setTimeout(180_000)
    const samples = await sample(page, 'findindex')
    report('findIndex-inside-getter', samples)

    // Same rendered output — so the only thing the numbers differ by is the per-option scan.
    expect(samples[10000].rendered).toBe(10000)
    expect(samples[10000].highlighted).toBe('Option 19')

    const arrowGrowth = samples[10000].arrowMedian / samples[1000].arrowMedian
    expect(
        arrowGrowth,
        `the quadratic variant must exceed the guard (grew x${arrowGrowth.toFixed(1)}), or the guard is vacuous`
    ).toBeGreaterThan(ARROW_GROWTH_MAX)
})
