import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets/js/autocomplete/*'],
  }),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
