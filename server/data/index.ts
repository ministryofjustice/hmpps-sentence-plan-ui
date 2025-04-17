/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import HandoverApiClient from './handoverApiClient'

export const dataAccess = () => {
  const handoverApiClient = new HandoverApiClient()

  return {
    applicationInfo,
    handoverApiClient,
  }
}

export { HandoverApiClient }
