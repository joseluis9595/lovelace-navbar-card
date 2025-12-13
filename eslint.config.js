// eslint.config.js

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import tsEslint from 'typescript-eslint';

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
    'docs/**/*',
  ]),
  {
    // Extends
    extends: [
      'js/recommended',
      tsEslint.configs.recommended,
      eslintConfigPrettier,
    ],
    // Language options
    languageOptions: {
      parser: tsParser,

      parserOptions: {
        ecmaVersion: 2021,
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },

    // Plugins
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      import: importPlugin,
      js,
    },

    // Rules
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '_',
        },
      ],
    },

    settings: {
      'import/resolver': {
        alias: {
          extensions: ['.ts', '.js'],
          map: [['@', './src']],
        },
      },
    },
  },
]);
