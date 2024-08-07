import { defineConfig } from 'cypress'
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
  taskTimeout: 60000,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
      })
    },
    baseUrl: 'http://localhost:6789',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
    env: {
      CLIENT_ID: 'sentence-plan-api-client',
      CLIENT_SECRET: 'sentence-plan-api-client',
      HMPPS_AUTH_URL: 'http://localhost:9091',
      ARNS_HANDOVER_URL: 'http://localhost:7070',
      ARNS_HANDOVER_CLIENT_ID: 'sentence-plan',
      SP_API_URL: 'http://localhost:8080',
    },
  },
})
