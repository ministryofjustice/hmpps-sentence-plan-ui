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

import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import SentencePlanApiClient from './sentencePlanApiClient'
import HandoverApiClient from './handoverApiClient'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => {
  const handoverApiClient = new HandoverApiClient()
  const hmppsAuditClient = new HmppsAuditClient(config.sqs.audit)

  return {
    applicationInfo,
    handoverApiClient,
    hmppsAuditClient,
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export { RestClientBuilder, HandoverApiClient, HmppsAuditClient }
