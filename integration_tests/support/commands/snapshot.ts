import { compareSnapshotCommand } from 'cypress-image-diff-js'

compareSnapshotCommand({
  dumpReportJson: true,
  reportDir: 'cypress-image-diff-html-report',
})
