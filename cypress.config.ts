import { defineConfig } from 'cypress'
import cypressSplit from 'cypress-split'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 10000,
  defaultCommandTimeout: 10000,
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        reset: resetStubs,
        ...auth,
        table(message) {
          // eslint-disable-next-line no-console
          console.table(message)
          return null
        },
      })
      cypressSplit(on, config)
      return config
    },
    baseUrl: 'http://localhost:6789',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
    experimentalRunAllSpecs: true,
    env: {
      CLIENT_ID: 'hmpps-assess-risks-and-needs-oastub-ui',
      CLIENT_SECRET: 'clientsecret',
      HMPPS_AUTH_URL: 'http://localhost:9091',
      ARNS_HANDOVER_URL: 'http://localhost:7070',
      ARNS_HANDOVER_CLIENT_ID: 'sentence-plan',
      SP_API_URL: 'http://localhost:8080',
      COORDINATOR_API_URL: 'http://localhost:6060',
      OASTUB_URL: 'http://localhost:7072',
      FEEDBACK_URL: 'http://localhost:9092',
    },
  },
})
