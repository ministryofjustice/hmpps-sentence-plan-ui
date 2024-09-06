import config from '../config'
import RestClient from './restClient'
import HmppsAuthClient from './hmppsAuthClient'
import logger from '../../logger'

export default class SentencePlanApiClient {
  constructor(private readonly authClient: HmppsAuthClient) {}

  // todo would session be a better place for this?
  username: string

  async restClient(info?: string): Promise<RestClient> {
    if (info) logger.info(info)
    const token = await this.authClient.getSystemClientToken(this.username)
    this.username = token.username
    return new RestClient('Sentence Plan Api Client', config.apis.sentencePlanApi, token.accessToken)
  }
}
