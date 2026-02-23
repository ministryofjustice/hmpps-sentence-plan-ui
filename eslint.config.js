/* eslint-disable import/no-dynamic-require, import/no-extraneous-dependencies */
const minimatchPath = require.resolve('minimatch')
const minimatch = require(minimatchPath)

// eslint-plugin-import expects minimatch to be directly callable.
// minimatch v10 exports an object, so we expose a compatible default export.
if (typeof minimatch !== 'function' && typeof minimatch.minimatch === 'function') {
  const compatExport = Object.assign(minimatch.minimatch, minimatch, { default: minimatch.minimatch })
  require.cache[minimatchPath].exports = compatExport
}

const hmppsConfig = require('@ministryofjustice/eslint-config-hmpps')

module.exports = [
  ...hmppsConfig(),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
