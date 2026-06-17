import { OriHeadless, nativeDisclosure } from '@oriui/vue';
import { zagDialog } from '../headless/zag-dialog';
// import { zagDisclosure } from '../headless/zag-disclosure'; // swap-in: Zag's collapsible engine

// Pick the headless engine per primitive. Simple behavior (disclosure) uses our zero-dependency
// native engine; complex behavior (dialog — focus trap, Escape, scroll lock) uses Zag. Components
// stay identical regardless; this map is the only place the choice lives.
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(OriHeadless, {
        disclosure: nativeDisclosure,
        dialog: zagDialog
    });
});
