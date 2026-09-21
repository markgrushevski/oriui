/* TEMPORARY measurement (poc/compound-tabs) — deleted once the numbers are recorded.
 * Server-renders the shipped array API and the compound prototype side by side and reports what each
 * one actually serializes. The plan's blocking claim is "with naive provide/inject registration the SSR
 * tablist serializes EMPTY (0 tab buttons)"; this either reproduces that or shows what it costs to avoid. */
import { describe, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { OriTabs, OriTabsC, OriTabList, OriTab, OriTabPanel } from '../packages/vue/src'

const TABS = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three', disabled: true }
]

const report = (name: string, html: string) => {
    const tabs = html.match(/role="tab"/g)?.length ?? 0
    const panels = html.match(/role="tabpanel"/g)?.length ?? 0
    const selected = [...html.matchAll(/id="([^"]*-tab-[^"]*)"[^>]*aria-selected="true"/g)].map((m) => m[1])
    const selectedAlt = [...html.matchAll(/aria-selected="true"[^>]*aria-controls="([^"]*)"/g)].map((m) => m[1])
    const visiblePanels = [...html.matchAll(/role="tabpanel"[^>]*>/g)].filter((m) => !m[0].includes('hidden')).length
    // eslint-disable-next-line no-console
    console.log(
        `\n[ssr] ${name}\n  role=tab: ${tabs}  role=tabpanel: ${panels}  visible panels: ${visiblePanels}\n` +
            `  selected tab id: ${selected.join(',') || '(none)'}  controls: ${selectedAlt.join(',') || '(none)'}\n` +
            `  bytes: ${html.length}`
    )
}

const arrayApp = (props: Record<string, unknown>) =>
    createSSRApp({
        render: () => h(OriTabs, { tabs: TABS, label: 'Sections', ...props }, { default: () => 'body' })
    })

const compoundApp = (props: Record<string, unknown>) =>
    createSSRApp({
        render: () =>
            h(OriTabsC, { label: 'Sections', ...props }, () => [
                h(OriTabList, null, () =>
                    TABS.map((t) => h(OriTab, { value: t.value, disabled: t.disabled }, () => t.label))
                ),
                ...TABS.map((t) => h(OriTabPanel, { value: t.value }, () => 'body'))
            ])
    })

describe('SSR — array vs compound', () => {
    it('no bound value (the "works without v-model" case)', async () => {
        report('array   / no value', await renderToString(arrayApp({})))
        report('compound/ no value', await renderToString(compoundApp({})))
    })

    it('bound value pointing at a LATER tab', async () => {
        report('array   / value=two', await renderToString(arrayApp({ modelValue: 'two' })))
        report('compound/ value=two', await renderToString(compoundApp({ modelValue: 'two' })))
    })

    it('bound value pointing at a DISABLED tab (the heal case)', async () => {
        report('array   / value=three(disabled)', await renderToString(arrayApp({ modelValue: 'three' })))
        report('compound/ value=three(disabled)', await renderToString(compoundApp({ modelValue: 'three' })))
    })

    it('bound value pointing at a MISSING tab', async () => {
        report('array   / value=ghost', await renderToString(arrayApp({ modelValue: 'ghost' })))
        report('compound/ value=ghost', await renderToString(compoundApp({ modelValue: 'ghost' })))
    })
})
