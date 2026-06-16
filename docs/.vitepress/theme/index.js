import DefaultTheme from 'vitepress/theme';
import Layout from './DocsLayout.vue';
import { OriButton, OriCard, OriAvatar, OriIcon, OriSpinner } from '@lib';

import '@lib/styles/styles.css';

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.component('OriButton', OriButton);
        app.component('OriCard', OriCard);
        app.component('OriAvatar', OriAvatar);
        app.component('OriIcon', OriIcon);
        app.component('OriSpinner', OriSpinner);
    }
};
