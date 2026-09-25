import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import configPrettier from 'eslint-config-prettier'

export default /** @type {import('eslint').Linter.Config[]} */ [
    { ignores: ['dist', 'types', 'cache', 'node_modules', '.idea', '.vscode'] },
    {
        files: ['packages/*/src/**/*.{ts,vue}', 'docs/**/*.{ts,vue}'],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaVersion: 'latest' }
        }
    },
    // Node-side tooling: the two scripts that MINT the published artifacts (packages/css/build.mjs
    // emits every shipped stylesheet, packages/vue/scripts/fix-dts.mjs rewrites every shipped .d.ts
    // specifier), the release smoke test, and the flat configs themselves. These are Node ESM, not
    // browser code — without `globals.node` the recommended config flags `console` as no-undef.
    {
        files: ['*.mjs', 'scripts/**/*.mjs', 'packages/*/*.mjs', 'packages/*/scripts/**/*.mjs'],
        languageOptions: {
            globals: globals.node,
            parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
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
            'vue/no-setup-props-reactivity-loss': 'error',
            // `onClickCapture` is a DOM prop, not a component prop: Vue only recognises the camelCase
            // spelling, so the hyphenated form the rule wants silently stops being a capture listener.
            // It is spelled out rather than disabled per-file because the next conditional capture
            // binding will hit the same wall.
            'vue/attribute-hyphenation': ['warn', 'always', { ignore: ['onClickCapture'] }]
        }
    },
    configPrettier
]
