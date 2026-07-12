export { default as OriToast } from './ori-toast.vue';
export { default as OriToaster } from './ori-toaster.vue';
// The toast queue behaviour now lives in @oriui/headless (core queue + Vue/Svelte adapters); re-export
// the Vue binding so the @oriui/vue public path (`import { useToast } from '@oriui/vue'`) is unchanged.
export { useToast, type ToastItem, type ToastOptions } from '@oriui/headless/vue';
