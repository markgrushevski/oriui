import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import configPrettier from 'eslint-config-prettier';


export default /** @type {import('eslint').Linter.Config[]} */ [
    { ignores: ['dist', 'types', 'cache', 'node_modules', '.idea', '.vscode'] },
    {
        files: ['packages/*/src/**/*.{ts,vue}', 'docs/**/*.{ts,vue}'],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaVersion: 'latest' }
        }
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser
            }
        },
        rules: {
            'vue/require-default-prop': 'off',
            'vue/no-setup-props-reactivity-loss': 'error'
        }
    },
    configPrettier
];
