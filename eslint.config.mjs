import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from '@vue/eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['**/*.{js,mjs,cjs,vue}'],
    },
    {
        languageOptions: { globals: globals.browser },
    },
    pluginJs.configs.recommended,
    ...pluginVue.configs['flat/essential'],
    prettierConfig,
    {
        rules: {
            // Migrate Vue and Prettier rules from the old config
            'vue/multi-word-component-names': 'off',
            'prettier/prettier': ['error', { endOfLine: 'auto' }],
        },
    },
];
