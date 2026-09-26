/**
 * Framework-agnostic toast queue — a tiny hand-rolled store (like the core machines), so `@oriui/headless`
 * keeps its no-runtime-dependency story. Deliberately reachable ONLY from the `./vue` and `./svelte` entries
 * (their `use-toast` adapters import it directly); it is NOT re-exported from the core `.` barrel, so it
 * never lands in the 1 kB core budget (the same trick as `core/color-picker`).
 *
 * The engine owns a plain array + a `Set` of no-arg listeners + a `Map` of auto-dismiss countdowns. Each adapter
 * subscribes and PROJECTS the snapshot into its framework's reactivity (Vue: a `reactive` mirror; Svelte: a
 * `readable`). Toasts are only ever pushed from client interaction (`<OriToaster>` renders client-only), so
 * the server never populates the queue — see NOTES.md.
 */

/** The palette roles a toast can carry. Mirrors `@oriui/vue`'s `ThemeColor`; the core can't import up the
 *  dependency graph (vue → headless), so this small, stable union is duplicated here. */
export type ToastColor = 'primary' | 'secondary' | 'surface' | 'background' | 'success' | 'warning' | 'danger' | 'info'

/** A button on the toast. Pressing it runs `onClick` and dismisses the toast. */
export interface ToastAction {
    label: string
    onClick: () => void
}

export interface ToastOptions {
    /** One action button, such as Undo. */
    action?: ToastAction
    /** Show a dismiss button on the toast. */
    closable?: boolean
    /** Semantic color role — drives the accent and the live-region assertiveness. */
    color?: ToastColor
    /** Auto-dismiss delay in ms; `0` keeps the toast until it is dismissed. */
    duration?: number
    /** SVG path for a leading icon. */
    icon?: string
    /** Body message. */
    text?: string
    /** Optional bold heading above the text. */
    title?: string
}

export interface ToastItem extends ToastOptions {
    id: number
}

export interface ToastQueue {
    /** A fresh snapshot of the current toasts (immutable — adapters mirror it into their reactivity). */
    getToasts(): readonly ToastItem[]
    /** Push a toast (string = its text). `fallbackColor` is the default color a severity shortcut supplies. */
    push(options: ToastOptions | string, fallbackColor?: ToastColor): number
    /** Remove a toast by id (and cancel its timer); a no-op for an unknown id. */
    dismiss(id: number): void
    /** Empty the queue and cancel every timer. */
    clear(): void
    /** Stop every auto-dismiss countdown, e.g. while the pointer or focus is on the toasts. */
    pause(): void
    /** Restart the countdowns with the time each one had left. */
    resume(): void
    /** Subscribe to any change (no-arg listener); returns an unsubscribe. */
    subscribe(listener: () => void): () => void
}

export function createToastQueue(): ToastQueue {
    const items: ToastItem[] = []
    // An auto-dismissing toast's countdown: `left` is the time it has, `due` when a running one expires.
    const countdowns = new Map<number, { left: number; due: number; timer?: ReturnType<typeof setTimeout> }>()
    const listeners = new Set<() => void>()
    let seq = 0
    let paused = false

    const notify = (): void => listeners.forEach((listener) => listener())

    function start(id: number): void {
        const countdown = countdowns.get(id)
        if (!countdown) return
        countdown.due = Date.now() + countdown.left
        countdown.timer = setTimeout(() => dismiss(id), countdown.left)
    }

    function pause(): void {
        if (paused) return
        paused = true
        countdowns.forEach((countdown) => {
            clearTimeout(countdown.timer)
            countdown.left = Math.max(0, countdown.due - Date.now())
        })
    }

    function resume(): void {
        if (!paused) return
        paused = false
        countdowns.forEach((_, id) => start(id))
    }

    function dismiss(id: number): void {
        clearTimeout(countdowns.get(id)?.timer)
        countdowns.delete(id)
        const index = items.findIndex((t) => t.id === id)
        if (index !== -1) {
            items.splice(index, 1)
            notify()
        }
    }

    function clear(): void {
        countdowns.forEach((countdown) => clearTimeout(countdown.timer))
        countdowns.clear()
        if (items.length > 0) {
            items.splice(0)
            notify()
        }
    }

    function push(options: ToastOptions | string, fallbackColor?: ToastColor): number {
        const base: ToastOptions = typeof options === 'string' ? { text: options } : { ...options }
        const id = ++seq
        // `base` overrides the defaults; `color` falls back to the shortcut's color, overridable by `base`.
        // `closable` is deliberately NOT stamped: the queue used to force `true` onto every toast, which
        // made OriToast's own `closable = false` default unreachable — a caller who said nothing got a
        // dismiss button anyway, and the two defaults disagreed with the queue silently winning. The one
        // case that DOES need a default is a toast that never auto-dismisses: without a close button it
        // cannot be got rid of at all, so a persistent toast opts itself in.
        const duration = base.duration ?? 4000
        const item: ToastItem = {
            id,
            duration,
            color: fallbackColor,
            ...(duration > 0 ? {} : { closable: true }),
            ...base
        }

        items.push(item)
        if (item.duration && item.duration > 0) {
            countdowns.set(id, { left: item.duration, due: 0 })
            if (!paused) start(id)
        }
        notify()
        return id
    }

    return {
        getToasts: () => [...items],
        push,
        dismiss,
        clear,
        pause,
        resume,
        subscribe(listener) {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        }
    }
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
        warning: (options: ToastOptions | string) => queue.push(options, 'warning'),
        info: (options: ToastOptions | string) => queue.push(options, 'info'),
        dismiss: (id: number) => queue.dismiss(id),
        clear: () => queue.clear(),
        pause: () => queue.pause(),
        resume: () => queue.resume()
    }
}
