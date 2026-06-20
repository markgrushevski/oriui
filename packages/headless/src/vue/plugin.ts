import { provide, type App } from 'vue';
import { ORI_HEADLESS, type HeadlessAdapters } from './contract';

/** Provide headless adapters to a component subtree (call inside `setup`). */
export function provideHeadless(adapters: HeadlessAdapters): void {
    provide(ORI_HEADLESS, adapters);
}

/**
 * App-level plugin to choose the headless engine for the whole app:
 * `app.use(OriHeadless, { disclosure: zagDisclosure })`. With no adapter the native one is used.
 */
export const OriHeadless = {
    install(app: App, adapters: HeadlessAdapters = {}): void {
        app.provide(ORI_HEADLESS, adapters);
    }
};
