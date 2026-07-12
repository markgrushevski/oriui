// The framework-agnostic toast queue. Kept OUT of the core `.` barrel (`core/index.ts`) so it stays out
// of the 1 kB core budget — the `./vue` and `./svelte` adapters import from here directly.
export * from './queue';
