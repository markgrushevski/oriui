---
'@oriui/headless': patch
---

**Svelte `useTheme` no longer dies when the last store subscriber leaves.** The controller's lifetime was
tied to the store's subscriber count, so an ordinary `{#if}` around markup that reads `$theme` took the
count to 0 and back to 1 — destroying the controller and then re-subscribing to a dead one, after which
`auto` silently stopped following `prefers-color-scheme` for the rest of the component's life.

The controller now lives as long as the component that created it (`safeOnDestroy`, the same lifecycle hook
the other Svelte composables use), and the store's start/stop only subscribes and unsubscribes. Because that
hook is a no-op when `useTheme` is called outside component init (module scope, a plain `.ts` module, a
test), the returned store gained an idempotent **`destroy()`** — the explicit handle such a caller disposes
the OS-scheme listener with. A new subscriber is also re-seeded with the controller's current state, so a
theme change that happened while the store was dormant is no longer delivered stale.

Additive: existing `$theme` / `setTheme` / `toggleTheme` / `cycleTheme` usage is unchanged.
