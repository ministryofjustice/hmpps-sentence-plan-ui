const config = {
  FAILURE_THRESHOLD: 0.05, // 5% difference allowed
  JSON_REPORT: {
    FILENAME: 'cypress-image-diff',
    OVERWRITE: true,
  },
}

module.exports = config
