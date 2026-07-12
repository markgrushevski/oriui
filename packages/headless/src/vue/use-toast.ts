import { reactive } from 'vue';
import { createToastActions, createToastQueue, type ToastItem } from '../core/toast';

export type { ToastColor, ToastItem, ToastOptions } from '../core/toast';

// One module-level queue (the client-side singleton) projected into ONE Vue reactive array. Every
// useToast() caller shares this same `toasts` array — the module singleton the old Vue-only queue was —
// so a push from anywhere shows up in the single <OriToaster>. The mirror is synced in place (splice) on
// every queue change; the core owns the array + the auto-dismiss timers (see core/toast/queue.ts).
const queue = createToastQueue();
const toasts = reactive<ToastItem[]>([...queue.getToasts()]);
queue.subscribe(() => {
    toasts.splice(0, toasts.length, ...queue.getToasts());
});

/**
 * Imperative toast queue (Vue). Call `toast()` (or a severity shortcut) from anywhere to push a
 * notification, and render `<OriToaster />` once near the app root to display the reactive `toasts`.
 * Each push returns the toast id, which can be passed to `dismiss(id)`.
 */
export function useToast() {
    return {
        /** The reactive queue, rendered by `<OriToaster>`. */
        toasts,
        ...createToastActions(queue)
    };
}
