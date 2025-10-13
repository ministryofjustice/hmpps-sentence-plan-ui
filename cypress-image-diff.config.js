const config = {
  FAILURE_THRESHOLD: 0.0, // 5% difference allowed
  FAIL_ON_MISSING_BASELINE: true,
  JSON_REPORT: {
    FILENAME: 'cypress-image-diff-ci-failed',
    OVERWRITE: false,
  },
}

module.exports = config
