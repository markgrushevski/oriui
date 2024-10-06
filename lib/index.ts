import type { App, Plugin } from 'vue';
import './styles/styles.css';

export * from './components';
export * from './customization';

export function createVueinjar(): Plugin<[]> {
    return {
        install: (app: App) => {
            init(app);
        }
    };
}

function init(app: App) {}
