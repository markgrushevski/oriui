// The framework-agnostic toast queue. Kept OUT of the core `.` barrel (`core/index.ts`), so an app that
// does not use toasts never ships it; the adapters import from here directly.
export * from './queue'
