import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // RESURGENCE serves many dynamic uploaded, R2, DB-backed, and embed media assets.
      // Keep raw <img> valid for those dynamic surfaces and avoid noisy production build logs.
      '@next/next/no-img-element': 'off',

      // Hooks in creator/feed modules intentionally use stable callback boundaries and external event lifecycles.
      // Keep production builds warning-free while preserving runtime behavior.
      'react-hooks/exhaustive-deps': 'off'
    }
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      'apps/mobile/**',
      'prisma/schema.generated.prisma'
    ]
  }
];

export default eslintConfig;
