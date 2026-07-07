/// <reference types="vite/client" />

// Let TS resolve the harness's single-file components (Vite compiles them at runtime; this file is
// never part of a project type-check gate — see tsconfig.vitest.json / the per-package build configs).
declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
    export default component;
}
