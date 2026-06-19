import { reactive } from 'vue';
import type { ThemeColor } from '../../types';

export interface ToastOptions {
    /** Show a dismiss button on the toast. */
    closable?: boolean;
    /** Semantic color role — drives the accent and the live-region assertiveness. */
    color?: ThemeColor;
    /** Auto-dismiss delay in ms; `0` keeps the toast until it is dismissed. */
    duration?: number;
    /** SVG path for a leading icon. */
    icon?: string;
    /** Body message. */
    text?: string;
    /** Optional bold heading above the text. */
    title?: string;
}

export interface ToastItem extends ToastOptions {
    id: number;
}

// Module-level queue — a client-side singleton. Toasts are only ever pushed from client
// interaction and <OriToaster> renders client-only (mounted gate), so the SSR server never
// populates this; see NOTES.md.
const queue = reactive<ToastItem[]>([]);
const timers = new Map<number, ReturnType<typeof setTimeout>>();
let seq = 0;

function dismiss(id: number): void {
    const index = queue.findIndex((t) => t.id === id);
    if (index !== -1) queue.splice(index, 1);

    const timer = timers.get(id);
    if (timer !== undefined) {
        clearTimeout(timer);
        timers.delete(id);
    }
}

function clear(): void {
    queue.splice(0);
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
}

function push(options: ToastOptions | string, fallbackColor?: ThemeColor): number {
    const base: ToastOptions = typeof options === 'string' ? { text: options } : { ...options };
    const id = ++seq;
    const item: ToastItem = { id, duration: 4000, closable: true, color: fallbackColor, ...base };

    queue.push(item);
    if (item.duration && item.duration > 0) {
        timers.set(
            id,
            setTimeout(() => dismiss(id), item.duration)
        );
    }

    return id;
}

/**
 * Imperative toast queue. Call `toast()` (or a severity shortcut) from anywhere to push a
 * notification, and render `<OriToaster />` once near the app root to display the queue. Each
 * push returns the toast id, which can be passed to `dismiss(id)`.
 */
export function useToast() {
    return {
        /** The reactive queue, rendered by `<OriToaster>`. */
        toasts: queue,
        toast: (options: ToastOptions | string) => push(options),
        success: (options: ToastOptions | string) => push(options, 'success'),
        error: (options: ToastOptions | string) => push(options, 'danger'),
        warn: (options: ToastOptions | string) => push(options, 'warn'),
        info: (options: ToastOptions | string) => push(options, 'info'),
        dismiss,
        clear
    };
}
