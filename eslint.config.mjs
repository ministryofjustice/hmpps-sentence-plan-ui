import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets/**', 'esbuild/**'],
  }),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
