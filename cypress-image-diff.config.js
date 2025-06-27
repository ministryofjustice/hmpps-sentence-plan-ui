const config = {
  FAILURE_THRESHOLD: 0.05, // 5% difference allowed
  FAIL_ON_MISSING_BASELINE: true,
  JSON_REPORT: {
    FILENAME: 'cypress-image-diff',
    OVERWRITE: true,
  },
}

module.exports = config
