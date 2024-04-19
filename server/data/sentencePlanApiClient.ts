import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'

export default class SentencePlanApiClient {
  constructor() {}

  private static restClient(): RestClient {
    return new RestClient('Sentence Plan Api Client', config.apis.sentencePlanApi, null)
  }

  getHelloWorld(world: string): Promise<string> {
    logger.info('Calling hello world service')
    return SentencePlanApiClient.restClient().get<string>({ path: `/hello/${world}` })
  }

  getAllReferenceData(): Promise<string> {
    logger.info('Getting question reference data')
    return SentencePlanApiClient.restClient().get<string>({ path: `/referenceData` })
  }
}
