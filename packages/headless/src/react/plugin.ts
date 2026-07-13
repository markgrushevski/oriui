import { createContext, createElement, useContext, type ReactElement, type ReactNode } from 'react';
import type { HeadlessAdapters } from './contract';

const HeadlessContext = createContext<HeadlessAdapters | null>(null);

/**
 * Provide headless adapters to a React subtree — the React twin of the Vue `provideHeadless()` /
 * `OriHeadless` plugin and the Svelte `provideHeadless()`. Wrap the subtree (typically the app root):
 * `<OriHeadlessProvider adapters={{ disclosure: myAdapter }}>…</OriHeadlessProvider>`. With no provider
 * the native adapter is used.
 *
 * NOTE (rules of hooks): the resolved adapter runs hooks on every render, so it must be stable for a
 * component's lifetime — choose adapters once at the root, don't swap the adapter for a given widget
 * between renders. (Written with `createElement` so this file stays plain `.ts`, no JSX build step.)
 */
export function OriHeadlessProvider(props: { adapters: HeadlessAdapters; children: ReactNode }): ReactElement {
    return createElement(HeadlessContext.Provider, { value: props.adapters }, props.children);
}

/** Resolve the adapters set for the current subtree, or `null` when none were provided. */
export function useHeadless(): HeadlessAdapters | null {
    return useContext(HeadlessContext);
}
