import globals from 'globals';
import eslint from '@eslint/js';
import pluginTs from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import pluginPrettier from 'eslint-config-prettier';

export default /** @type { import('eslint').Linter.Config[] } */ ([
    {
        files: ['src/**/*.{ts,vue}'],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaVersion: 'latest' }
        },
        ignores: ['.idea/', '.vscode/', 'dist/', 'node_modules/', 'types/', 'old/']
    },
    eslint.configs.recommended,
    ...pluginTs.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    pluginPrettier
]);
