import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from '@vue/eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
    pluginJs.configs.recommended,
    ...pluginVue.configs['flat/essential'],
    prettierConfig,
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/out/**', '.vite/**'],
        files: ['**/*.{js,mjs,cjs,vue}'],
        languageOptions: { globals: globals.browser },
        rules: {
            'vue/multi-word-component-names': 'off',
            'prettier/prettier': ['error', { endOfLine: 'auto' }],
        },
    },
];
