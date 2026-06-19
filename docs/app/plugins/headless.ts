import { OriHeadless, nativeDisclosure } from '@oriui/headless/vue';

// Pick the headless engine per primitive. Both disclosure and dialog default to oriUI's
// zero-dependency native engines (the dialog runs on the platform <dialog> element), so this map is
// only needed to be explicit — or to swap in a custom adapter (e.g. Zag) for a genuinely hard widget.
// Components stay identical regardless; this is the only place the choice lives.
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(OriHeadless, {
        disclosure: nativeDisclosure
    });
});
