import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import deliusIntegration from './integration_tests/mockApis/deliusIntegration'
import sentencePlanApi from './integration_tests/mockApis/sentencePlanApi'
import interventionApi from './integration_tests/mockApis/interventionApi'
import oasysIntegration from './integration_tests/mockApis/oasysIntegration'
import prisonApiIntegration from './integration_tests/mockApis/prisonApiIntegration'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 60000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,
        ...sentencePlanApi,
        ...deliusIntegration,
        ...interventionApi,
        ...oasysIntegration,
        ...prisonApiIntegration,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
