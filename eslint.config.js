import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'scripts/**', 'seed.ts', 'migrateToFirestore.ts', 'src/data/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Existing debt: tracked as warnings until the typed data model replaces `any`
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Redundant escapes in credit-report regexes: harmless, cleaned up once the parsers have tests
      'no-useless-escape': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      // Allows `declare global { namespace Express { ... } }` request typing
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
    },
  },
);
