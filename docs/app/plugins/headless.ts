import { OriHeadless, nativeDisclosure } from '@oriui/vue';
// import { zagDisclosure } from '../headless/zag-disclosure'; // swap-in: Zag's collapsible engine

// Pick the headless engine for the whole docs app — components stay identical either way.
// `nativeDisclosure` = our @oriui/core engine (instant, ideal for the sidebar). Swap to
// `zagDisclosure` to run on Zag; Zag's collapsible is animation/measurement-first, so pair it
// with a height transition on a component that wants animated collapse (Accordion / Dialog).
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(OriHeadless, { disclosure: nativeDisclosure });
});
