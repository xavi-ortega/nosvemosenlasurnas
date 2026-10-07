import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    { ignores: ['vendor/**', 'node_modules/**', 'public/build/**', '.tools/**', 'outputs/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,ts}'],
        languageOptions: { globals: { ...globals.node, ...globals.browser } },
    },
);
