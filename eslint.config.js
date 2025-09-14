// eslint.config.js
import { defineConfig, globalIgnores } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';

import js from '@eslint/js';
import tsEslint from 'typescript-eslint';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

import importPlugin from 'eslint-plugin-import'
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Read ignored files from .gitignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default defineConfig([
  { files: ['src/**/*.{js,ts}'] },
  includeIgnoreFile(gitignorePath),
  globalIgnores([
    '**/node_modules',
    '**/dist',
    '**/.github',
    '.prettierrc.cjs',
    'eslint.config.js',
  ]),
  {
    // Language options
    languageOptions: {
      parser: tsParser,

      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },

    // Plugins
    plugins: {
      js,
      '@typescript-eslint': tsEslintPlugin,
      'import': importPlugin,
    },

    // Extends
    extends: [
      'js/recommended',
      tsEslint.configs.recommended,
      eslintConfigPrettier,
    ],

    // Rules
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },

    settings: {
      'import/resolver': {
        alias: {
          extensions: ['.ts', '.js'],
          map: [
            ['@', './src'],
            ['@errors', './src/errors'],
            ['@utils', './src/utils'],
          ],
        },
      },
    },
  },
]);
