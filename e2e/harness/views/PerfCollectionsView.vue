<script lang="ts" setup>
import { nextTick, ref, shallowRef } from 'vue'
import { OriCombobox } from '@oriui/vue'
import { nativeCombobox, provideHeadless, type ComboboxItem } from '@oriui/headless/vue'

// Perf bench view: mounts the REAL OriCombobox over a collection of arbitrary size and exposes the
// measurement API on `window.__oriPerf`, so `e2e/perf-collections.spec.ts` times the work with
// `performance.now()` INSIDE the page (wall clock around a Playwright call would measure the CDP
// round-trip, not the render).
//
// `?variant=findindex` swaps in a combobox adapter that derives the option index with
// `collection.findIndex(...)` INSIDE getOptionProps — exactly the change ISSUES-INNER proposes
// (drop the `index` parameter). It produces identical DOM, so the only difference measured is the
// per-option scan: O(n) getter x n options = O(n^2). It exists to PROVE the guard trips, and it
// rides the library's own documented swap seam (provideHeadless) rather than patching core.

type Variant = 'current' | 'findindex'

const variant = (new URLSearchParams(location.search).get('variant') as Variant | null) ?? 'current'

// The quadratic variant: same props, same DOM, index derived instead of passed.
const findIndexCombobox: typeof nativeCombobox = (options) => {
    const control = nativeCombobox(options)
    return {
        ...control,
        getOptionProps: (item: ComboboxItem) =>
            control.getOptionProps(
                item,
                control.items.value.findIndex((candidate) => candidate.value === item.value)
            )
    }
}

if (variant === 'findindex') provideHeadless({ combobox: findIndexCombobox })

const mounted = ref(false)
const model = ref<string | null>(null)
// shallowRef: a 10k-item array must NOT be deeply reactive — proxying every option would measure Vue's
// reactivity conversion instead of the component. The component only ever reads it.
const options = shallowRef<ComboboxItem[]>([])

// Labels are `Option <i>`, so `String(n - 1)` is a query matching EXACTLY one item at any size
// (10000 items -> "9999" appears only in "Option 9999").
function build(n: number): ComboboxItem[] {
    const items: ComboboxItem[] = new Array(n)
    for (let i = 0; i < n; i++) items[i] = { label: `Option ${i}`, value: `opt-${i}` }
    return items
}

// One flush = Vue's queue drained (nextTick twice, in case a watcher cascades) + a forced style/layout
// pass. Paint is deliberately excluded: what is measured is the scripting + layout a keystroke costs.
async function flush(): Promise<void> {
    await nextTick()
    await nextTick()
    void document.body.offsetHeight
}

function input(): HTMLInputElement {
    const el = document.querySelector<HTMLInputElement>('.ori-combobox__input')
    if (!el) throw new Error('combobox input not mounted')
    return el
}

async function measureMount(n: number): Promise<number> {
    mounted.value = false
    await flush()
    // Building the array is setup, not render cost — do it before the clock starts.
    const built = build(n)
    options.value = built
    model.value = null
    await nextTick()

    const start = performance.now()
    mounted.value = true
    await flush()
    return performance.now() - start
}

async function measureOpen(): Promise<number> {
    const trigger = document.querySelector<HTMLButtonElement>('.ori-combobox__trigger')
    if (!trigger) throw new Error('combobox trigger not mounted')
    input().focus()

    const start = performance.now()
    trigger.click()
    await flush()
    return performance.now() - start
}

// One entry per ArrowDown: dispatching keydown directly is the same listener path a held key drives
// (the handler comes from the headless prop bag), minus the browser's autorepeat cadence — which makes
// the per-keystroke cost measurable without idle frame time in the number.
async function measureArrows(count: number): Promise<number[]> {
    const el = input()
    el.focus()
    const samples: number[] = []
    for (let i = 0; i < count; i++) {
        const start = performance.now()
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
        await flush()
        samples.push(performance.now() - start)
    }
    return samples
}

async function measureFilter(query: string): Promise<{ ms: number; matched: number }> {
    const el = input()
    el.focus()
    el.value = query

    const start = performance.now()
    el.dispatchEvent(new Event('input', { bubbles: true }))
    await flush()
    const ms = performance.now() - start
    return { ms, matched: document.querySelectorAll('[role="option"]').length }
}

// Shape declared once in ../perf-api.d.ts, shared with the spec.
window.__oriPerf = {
    variant,
    mount: measureMount,
    open: measureOpen,
    arrows: measureArrows,
    filter: measureFilter,
    options: () => document.querySelectorAll('[role="option"]').length,
    highlighted: () => document.querySelector('[role="option"][data-highlighted]')?.textContent?.trim() ?? null
}
</script>

<template>
    <div style="max-width: 320px; padding: 40px">
        <OriCombobox v-if="mounted" v-model="model" label="Option" :options="options" placeholder="Search" />
        <p data-testid="perf-variant">{{ variant }}</p>
    </div>
</template>
