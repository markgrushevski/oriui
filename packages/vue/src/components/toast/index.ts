export { default as OriToast } from './ori-toast.vue'
export { default as OriToaster } from './ori-toaster.vue'
// The toast queue lives in @oriui/headless; the Vue binding is re-exported so `import { useToast } from
// '@oriui/vue'` works without a second package import.
export { useToast, type ToastAction, type ToastItem, type ToastOptions } from '@oriui/headless/vue'
