import { createApp, type Component } from 'vue';
import ComboboxView from './views/ComboboxView.vue';
import DialogView from './views/DialogView.vue';
import MenuView from './views/MenuView.vue';
import '@oriui/css';

// The harness mounts exactly ONE interactive component, chosen by `location.hash` (#combobox / #dialog
// / #menu), against the real @oriui/vue source + built @oriui/css. Each Playwright interaction spec does
// a fresh `page.goto('/#<view>')`, so this module re-runs per navigation and the mounted view always
// matches the hash. An in-place hash change reloads so the two never drift.
const views: Record<string, Component> = {
    combobox: ComboboxView,
    dialog: DialogView,
    menu: MenuView
};

function currentView(): Component {
    const key = location.hash.replace(/^#/, '');
    return views[key] ?? ComboboxView;
}

window.addEventListener('hashchange', () => location.reload());

createApp(currentView()).mount('#app');
