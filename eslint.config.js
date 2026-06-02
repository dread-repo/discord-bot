import eslint from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import { createNodeResolver } from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      'eslint.config.js',
      'vitest.config.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'import-x': importX,
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: ['./tsconfig.json'],
        }),
        createNodeResolver(),
      ],
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
      'eqeqeq': ['error', 'always'],
      'import-x/export': 'error',
      'import-x/first': 'error',
      'import-x/no-cycle': ['error', { maxDepth: 10 }],
      'import-x/no-duplicates': ['error', { 'prefer-inline': false }],
      'import-x/no-self-import': 'error',
      'import-x/no-unresolved': 'error',
      'import-x/no-useless-path-segments': ['error', { noUselessIndex: true }],
      'no-console': 'error',
      'no-implicit-coercion': 'error',
      'no-throw-literal': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-console': 'off',
    },
  },
);
