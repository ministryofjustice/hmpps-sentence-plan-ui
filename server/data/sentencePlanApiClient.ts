import config from '../config'
import RestClient from './restClient'
import HmppsAuthClient from './hmppsAuthClient'
import logger from '../../logger'

export default class SentencePlanApiClient {
  constructor(private readonly authClient: HmppsAuthClient) {}

  async restClient(info?: string, token?: string): Promise<RestClient> {
    if (info) logger.info(info)
    const realToken = token || (await this.authClient.getSystemClientToken())
    return new RestClient('Sentence Plan Api Client', config.apis.sentencePlanApi, realToken)
  }
}
