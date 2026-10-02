import { onBeforeUpdate, reactive, useSlots } from 'vue'

// Which of the named slots the caller passes, as reactive state. `useSlots()` is not reactive: a computed
// that reads `slots.error` caches the slot's absence and never sees a `<template v-if #error>` appear. A
// change of slots re-renders the component, so the presence is re-read just before each render, where
// every computed that depends on it picks up the new value.
export function useSlotPresence<Name extends string>(...names: Name[]): Record<Name, boolean> {
    const slots = useSlots()
    const read = () => Object.fromEntries(names.map((name) => [name, Boolean(slots[name])])) as Record<Name, boolean>
    const presence = reactive(read()) as Record<Name, boolean>
    onBeforeUpdate(() => Object.assign(presence, read()))
    return presence
}
