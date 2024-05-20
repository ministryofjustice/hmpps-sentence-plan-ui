import RestClient from './restClient'
import config from '../config'

export default class HandoverApiClient {
  private static restClient(token?: string): RestClient {
    return new RestClient('HMPPS Handover Api Client', config.apis.hmppsHandover, token)
  }

  getContextData(token: string) {
    return HandoverApiClient.restClient(token).get<object>({ path: `/context` })
  }
}
