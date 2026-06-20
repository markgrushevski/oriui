---
title: Core
---

# @oriui/headless

The framework-agnostic heart of the headless layer: a **behaviour contract** plus a zero-dependency
**native engine**, written in vanilla TypeScript. Every framework binding consumes the same contract,
so a primitive behaves identically wherever it runs — and the behaviour stays swappable per primitive,
without touching markup.

This is the **agnostic** layer. It has no Vue, no Svelte, no CSS — for the concrete composable API
see the binding pages ([useDisclosure](/headless/use-disclosure), [useDialog](/headless/use-dialog));
for the standalone styling layer see the [CSS guide](/guides/css).

## The layered idea

The headless layer is split along a framework axis. The behaviour lives once, in the core; each
binding is a thin adapter from the core contract to a framework's reactivity.

| Package               | What it is                                  | Framework    |
| --------------------- | ------------------------------------------- | ------------ |
| `@oriui/headless`     | Behaviour contract + native engine          | **agnostic** |
| `@oriui/headless/vue` | Vue bindings — `useDisclosure`, `useDialog` | Vue          |
| `@oriui/svelte`       | Svelte bindings (planned)                   | Svelte       |

## The contract

Each primitive exposes a **control shape**: reactive open state, ARIA-correct **prop bags**, and
imperative handlers. A component spreads the prop bags onto its markup — it never hand-rolls focus,
keyboard, or ARIA. For the native disclosure engine the shape is `DisclosureApi`:

```ts
import { disclosure, createNormalizer } from '@oriui/headless';

// `connect()` lives in core but the prop normalizer is per-framework. A binding
// imports its own (Vue's `normalizeProps` from @oriui/headless/vue); here we build a
// minimal pass-through to keep the example self-contained.
const normalizeProps = createNormalizer((props) => props);

const service = disclosure.machine({ id: 'demo', defaultOpen: false });
const api = disclosure.connect(service, normalizeProps);

api.open; // boolean
api.getRootProps(); // { data-scope, data-part, data-state }
api.getTriggerProps(); // { data-scope, data-part, id, type, aria-controls, aria-expanded, onClick, … }
api.getContentProps(); // { data-scope, data-part, id, role: 'region', aria-labelledby, hidden, data-state }
api.setOpen(true);
api.toggle();
```

Every part bag (root, trigger, content) carries the anatomy's `data-scope` / `data-part` attrs, and
the content bag is a landmark `region` (`role: 'region'`). The prop bags are framework-neutral **plain
objects**. `connect()` is a pure projection of machine state to prop-getters; the binding supplies a
`normalizeProps` transform (Vue keeps `onClick`, Svelte lowercases it to `onclick`) and re-invokes
`connect()` on every state change, wrapping the result in the framework's reactivity primitive — a Vue
`ComputedRef`, a Svelte store or rune. The same engine, the same ARIA, expressed once.

Three small building blocks back every primitive:

| Export          | Role                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------- |
| `createMachine` | A tiny reducer-based state container with a `subscribe` seam — the only place a binding taps  |
| `createScope`   | Deterministic, SSR-stable element ids derived from one base `id` (`getId('trigger')`)         |
| `createAnatomy` | Names a component's parts and emits the `data-scope` / `data-part` attrs + matching selectors |
| `mergeProps`    | Type-aware left-to-right merge so a consumer can layer a handler / `class` / `style` on a bag |

## Adapters

Behaviour is chosen per primitive — provided once at the app root, never threaded through markup.

- **Disclosure** — a native, zero-dependency engine ships from `@oriui/headless` as the default. Nothing
  to wire; it just works.
- **Dialog** — runs on the native `<dialog>` element (`showModal()`), so the focus trap, scroll lock,
  focus return, `::backdrop` and `aria-modal` come from the platform. It is the **default**, with no
  adapter or dependency required. See [useDialog](/headless/use-dialog).

Both default to a zero-dependency engine. The `OriHeadless` plugin (from `@oriui/headless/vue`) is the hedge for
swapping an engine per primitive — e.g. a custom or Zag-backed adapter for a genuinely hard widget —
without changing a component's template:

```ts
import { OriHeadless } from '@oriui/headless/vue';

// Both primitives default to native; register an adapter only to override one.
app.use(OriHeadless, { dialog: myDialog });
```

## Frameworks

The same core powers each binding, so a primitive behaves the same everywhere.

- **Vue** (today) — [useDisclosure](/headless/use-disclosure) and [useDialog](/headless/use-dialog).
- **Svelte** (planned) — will consume the identical contract; no behaviour is re-implemented.

## See also

- [useDisclosure](/headless/use-disclosure) — the Vue binding of the native disclosure engine.
- [useDialog](/headless/use-dialog) — the Vue binding for the native `<dialog>` primitive.
- [Dialog](/components/dialog) — the styled component that consumes the dialog contract.
- [CSS layer](/guides/css) — the other framework-agnostic layer: standalone `.ori-*` classes + tokens.
