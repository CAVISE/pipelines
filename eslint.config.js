import {defineConfig} from 'eslint/config'

import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'

import prettierConfig from 'eslint-config-prettier'

// Plugins.
import typescript from '@typescript-eslint/eslint-plugin'
import jest from 'eslint-plugin-jest'
import prettier from 'eslint-plugin-prettier'

export default defineConfig([
  {
    ignores: [
      'node_modules/',
      'actions/*/node_modules/',
      'actions/*/dist/',
      'actions/*/__tests__/_temp/',
      'actions/*/src/generated/'
    ]
  },
  js.configs.recommended,
  prettierConfig,
  {
    files: ['actions/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...jest.environments.globals.globals
      }
    },
    plugins: {
      typescript,
      jest,
      prettier
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  }
])
