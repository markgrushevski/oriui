import { createApp, type Component } from 'vue'
import AccordionView from './views/AccordionView.vue'
import ColorPickerView from './views/ColorPickerView.vue'
import ComboboxView from './views/ComboboxView.vue'
import DialogView from './views/DialogView.vue'
import MenuView from './views/MenuView.vue'
import PerfCollectionsView from './views/PerfCollectionsView.vue'
import RtlKeysView from './views/RtlKeysView.vue'
import TabsView from './views/TabsView.vue'
import ToolbarView from './views/ToolbarView.vue'
import '@oriui/css'

// The harness mounts exactly ONE interactive component, chosen by `location.hash` (#accordion /
// #colorpicker / #combobox / #dialog / #menu / #rtl-keys / #tabs / #toolbar), against the real @oriui/vue source + built @oriui/css. Each Playwright interaction
// spec does a fresh `page.goto('/#<view>')`, so this module re-runs per navigation and the mounted view
// always matches the hash. An in-place hash change reloads so the two never drift.
const views: Record<string, Component> = {
    accordion: AccordionView,
    colorpicker: ColorPickerView,
    combobox: ComboboxView,
    dialog: DialogView,
    menu: MenuView,
    perf: PerfCollectionsView,
    'rtl-keys': RtlKeysView,
    tabs: TabsView,
    toolbar: ToolbarView
}

function currentView(): Component {
    const key = location.hash.replace(/^#/, '')
    return views[key] ?? ComboboxView
}

window.addEventListener('hashchange', () => location.reload())

createApp(currentView()).mount('#app')
