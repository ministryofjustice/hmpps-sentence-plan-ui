import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets/**'],
  }),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
