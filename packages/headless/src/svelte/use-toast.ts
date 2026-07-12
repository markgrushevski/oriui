import { readable, type Readable } from 'svelte/store';
import { createToastQueue, type ToastItem, type ToastOptions } from '../core/toast';

export type { ToastColor, ToastItem, ToastOptions } from '../core/toast';

// One module-level queue (the client-side singleton) projected into a single `readable` store. The store's
// start fn subscribes to the queue on the first component subscriber and unsubscribes when the last leaves,
// fanning one queue subscription out to every `$toasts` reader. The core owns the array + the auto-dismiss
// timers (see core/toast/queue.ts).
const queue = createToastQueue();
const toasts: Readable<readonly ToastItem[]> = readable(queue.getToasts(), (set) => {
    set(queue.getToasts());
    return queue.subscribe(() => set(queue.getToasts()));
});

/**
 * Imperative toast queue (Svelte). Call `toast()` (or a severity shortcut) from anywhere to push a
 * notification; subscribe to the `toasts` store (`$toasts`) to render them. Each push returns the toast id,
 * which can be passed to `dismiss(id)`.
 */
export function useToast() {
    return {
        /** A readable store of the queue — subscribe with `$toasts`. */
        toasts,
        toast: (options: ToastOptions | string) => queue.push(options),
        success: (options: ToastOptions | string) => queue.push(options, 'success'),
        error: (options: ToastOptions | string) => queue.push(options, 'danger'),
        warn: (options: ToastOptions | string) => queue.push(options, 'warn'),
        info: (options: ToastOptions | string) => queue.push(options, 'info'),
        dismiss: (id: number) => queue.dismiss(id),
        clear: () => queue.clear()
    };
}
