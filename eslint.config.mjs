import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';

const tseslintConfig = tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
  ignores: ['dist/**', '.yarn/**'],
});

export default defineConfig([
  ...tseslintConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
