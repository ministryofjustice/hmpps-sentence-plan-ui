import config from '../config'
import RestClient from './restClient'
import HmppsAuthClient from './hmppsAuthClient'
import logger from '../../logger'

export default class SentencePlanAndDeliusApiClient {
  constructor(private readonly authClient: HmppsAuthClient) {}

  async restClient(info?: string): Promise<RestClient> {
    if (info) logger.info(info)
    const token = await this.authClient.getSystemClientToken()
    return new RestClient('Sentence Plan And Delius API Client', config.apis.sentencePlanAndDeliusApi, token)
  }
}
