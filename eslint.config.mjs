import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from '@vue/eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['**/*.{js,mjs,cjs,vue}'],
        languageOptions: { globals: globals.browser },
    },
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/out/**', '**/.vite/**'],
    },
    pluginJs.configs.recommended,
    ...pluginVue.configs['flat/essential'],
    prettierConfig,
    {
        rules: {
            'vue/multi-word-component-names': 'off',
            'no-unused-vars': 'off',
            'no-undef': 'off',
            'prettier/prettier': ['error', { endOfLine: 'auto' }],
        },
    },
];
