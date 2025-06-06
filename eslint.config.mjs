import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
