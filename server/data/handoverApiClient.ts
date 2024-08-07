import RestClient from './restClient'
import config from '../config'
import { HandoverContextData } from '../@types/Handover'

export default class HandoverApiClient {
  private static restClient(token?: string): RestClient {
    return new RestClient('HMPPS Handover Api Client', config.apis.arnsHandover, token)
  }

  getContextData(token: string) {
    return HandoverApiClient.restClient(token).get<HandoverContextData>({ path: `/context` })
  }
}
