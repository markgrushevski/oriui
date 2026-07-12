/**
 * Framework-agnostic toast queue — a tiny hand-rolled store (like the core machines), so `@oriui/headless`
 * keeps its no-runtime-dependency story. Deliberately reachable ONLY from the `./vue` and `./svelte` entries
 * (their `use-toast` adapters import it directly); it is NOT re-exported from the core `.` barrel, so it
 * never lands in the 1 kB core budget (the same trick as `core/color-picker`).
 *
 * The engine owns a plain array + a `Set` of no-arg listeners + a `Map` of auto-dismiss timers. Each adapter
 * subscribes and PROJECTS the snapshot into its framework's reactivity (Vue: a `reactive` mirror; Svelte: a
 * `readable`). Toasts are only ever pushed from client interaction (`<OriToaster>` renders client-only), so
 * the server never populates the queue — see NOTES.md.
 */

/** The palette roles a toast can carry. Mirrors `@oriui/vue`'s `ThemeColor`; the core can't import up the
 *  dependency graph (vue → headless), so this small, stable union is duplicated here. */
export type ToastColor = 'primary' | 'secondary' | 'surface' | 'background' | 'success' | 'warn' | 'danger' | 'info';

export interface ToastOptions {
    /** Show a dismiss button on the toast. */
    closable?: boolean;
    /** Semantic color role — drives the accent and the live-region assertiveness. */
    color?: ToastColor;
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

export interface ToastQueue {
    /** A fresh snapshot of the current toasts (immutable — adapters mirror it into their reactivity). */
    getToasts(): readonly ToastItem[];
    /** Push a toast (string = its text). `fallbackColor` is the default color a severity shortcut supplies. */
    push(options: ToastOptions | string, fallbackColor?: ToastColor): number;
    /** Remove a toast by id (and cancel its timer); a no-op for an unknown id. */
    dismiss(id: number): void;
    /** Empty the queue and cancel every timer. */
    clear(): void;
    /** Subscribe to any change (no-arg listener); returns an unsubscribe. */
    subscribe(listener: () => void): () => void;
}

export function createToastQueue(): ToastQueue {
    const items: ToastItem[] = [];
    const timers = new Map<number, ReturnType<typeof setTimeout>>();
    const listeners = new Set<() => void>();
    let seq = 0;

    const notify = (): void => listeners.forEach((listener) => listener());

    function dismiss(id: number): void {
        const timer = timers.get(id);
        if (timer !== undefined) {
            clearTimeout(timer);
            timers.delete(id);
        }
        const index = items.findIndex((t) => t.id === id);
        if (index !== -1) {
            items.splice(index, 1);
            notify();
        }
    }

    function clear(): void {
        timers.forEach((timer) => clearTimeout(timer));
        timers.clear();
        if (items.length > 0) {
            items.splice(0);
            notify();
        }
    }

    function push(options: ToastOptions | string, fallbackColor?: ToastColor): number {
        const base: ToastOptions = typeof options === 'string' ? { text: options } : { ...options };
        const id = ++seq;
        // `base` overrides the defaults; `color` falls back to the shortcut's color, overridable by `base`.
        const item: ToastItem = { id, duration: 4000, closable: true, color: fallbackColor, ...base };

        items.push(item);
        if (item.duration && item.duration > 0) {
            timers.set(
                id,
                setTimeout(() => dismiss(id), item.duration)
            );
        }
        notify();
        return id;
    }

    return {
        getToasts: () => [...items],
        push,
        dismiss,
        clear,
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        }
    };
}

/**
 * The imperative action surface shared by BOTH adapters — `toast()` + the severity shortcuts +
 * `dismiss`/`clear`. Only the reactive `toasts` projection differs per framework, so keep the actions
 * (and the severity → color mapping) in one place: each adapter spreads this and adds its own `toasts`.
 */
export function createToastActions(queue: ToastQueue) {
    return {
        toast: (options: ToastOptions | string) => queue.push(options),
        success: (options: ToastOptions | string) => queue.push(options, 'success'),
        error: (options: ToastOptions | string) => queue.push(options, 'danger'),
        warn: (options: ToastOptions | string) => queue.push(options, 'warn'),
        info: (options: ToastOptions | string) => queue.push(options, 'info'),
        dismiss: (id: number) => queue.dismiss(id),
        clear: () => queue.clear()
    };
}
