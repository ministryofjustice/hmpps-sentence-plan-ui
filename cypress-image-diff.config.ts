const config = {
  FAILURE_THRESHOLD: 0.05, // 5% difference allowed
  FAIL_ON_MISSING_BASELINE: true,
  JSON_REPORT: {
    FILENAME: 'cypress-image-diff-ci-failed',
    OVERWRITE: false,
  },
  CYPRESS_SCREENSHOT_OPTIONS: {
    onBeforeScreenshot: (doc: Document) => {
      const dateRegex =
        /([1-9]|[12]\d|3[01]) (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/g

      const walk = (node: Node) => {
        // Only process text nodes
        if (node.nodeType === Node.TEXT_NODE) {
          if (dateRegex.test(node.nodeValue)) {
            // eslint-disable-next-line no-param-reassign
            node.nodeValue = node.nodeValue.replace(dateRegex, 'DD MMMMM YYYY')
          }
        } else {
          node.childNodes.forEach(walk)
        }
      }
      walk(doc.body)
    },
  },
}

module.exports = config
