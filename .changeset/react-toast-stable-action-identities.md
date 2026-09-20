---
'@oriui/headless': patch
---

**React `useToast`** now returns stable action identities. `toast` / `success` / `error` / `warning` /
`info` / `dismiss` / `clear` were rebuilt by a `createToastActions(queue)` call inside the hook body, so
every render handed consumers brand-new function references — even though the queue they close over is a
module-level singleton that never changes. Anything that listed one in a dependency array
(`useEffect`, `useCallback`, `useMemo`, a memoised child's props) re-ran on every single render.

The actions are now built once at module scope, beside the queue: the identities are stable for the
process, so they are safe to depend on and need no memoisation on the consumer's side. The values are
unchanged — same functions, same behaviour, same shared queue — so this only removes spurious work.
Worth fixing before 1.0, since identity stability is part of a hook's frozen public contract.

A test pins it: after a bare re-render, after a real queue change, and across two separate `useToast()`
callers, every action passes `Object.is`. The `useSyncExternalStore` snapshot cache (which keeps
`toasts` referentially stable between queue changes) is untouched.

The Vue and Svelte twins share the same core actions but have no equivalent bug: their `useToast()`
runs once per component instance, not once per render, and neither framework re-runs work off a
dependency array of identities.
