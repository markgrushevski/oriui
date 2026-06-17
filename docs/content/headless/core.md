---
title: Core
---

# @oriui/core

The framework-agnostic heart of the headless layer: the **behaviour contract** plus a
zero-dependency **native engine**, in vanilla TypeScript. Every framework binding consumes the same
contract, so behaviour is identical across frameworks and swappable per primitive.

## The layered idea

| Package         | What it is                                  | Framework    |
| --------------- | ------------------------------------------- | ------------ |
| `@oriui/core`   | Behaviour contract + native engine          | **agnostic** |
| `@oriui/vue`    | Vue bindings — `useDisclosure`, `useDialog` | Vue          |
| `@oriui/svelte` | Svelte bindings (planned)                   | Svelte       |

A binding is a thin adapter from the core contract to a framework's reactivity. The behaviour lives
once, in the core.

## The contract

Each primitive exposes a **control shape**: reactive state + ARIA-correct prop bags + handlers. A
component spreads the prop bags onto its markup — it never hand-rolls focus, keyboard, or ARIA. The
prop bags are framework-neutral plain objects; the binding wraps them in the framework's reactivity
(Vue `ComputedRef`, Svelte stores/runes, …).

## Adapters

Behaviour is swapped via `OriHeadless` without touching markup:

- **Disclosure** — a native, zero-dependency engine ships as the default.
- **Dialog** — there is **no** native default; the focus trap / scroll lock / focus return is
  delegated to an adapter (e.g. Zag) wired through `OriHeadless`. See [useDialog](/headless/use-dialog).

## Frameworks

The same core powers each binding. Today that is **Vue**
([useDisclosure](/headless/use-disclosure), [useDialog](/headless/use-dialog)); a Svelte binding will
consume the identical contract, so a primitive behaves the same wherever it runs.
