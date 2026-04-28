import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config([
  eslint.configs.recommended,
  eslintConfigPrettier,
  tseslint.configs.recommended,
  globalIgnores(['**/dist*/', '**/.*']),
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'no-only-tests': noOnlyTests,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      'no-console': 'error',
      'no-return-assign': ['error', 'always'],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          caughtErrors: 'none',
        },
      ],

      'no-only-tests/no-only-tests': 'error',
    },
  },
  {
    files: ['**/*.demo.js'],

    rules: {
      'no-console': 'off',
    },
  },
]);
