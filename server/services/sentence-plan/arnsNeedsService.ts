import ArnsApiClient from '../../data/arnsApiClient'
import { CriminogenicNeeds } from '../../@types/CriminogenicNeedsType'

export default class ArnsNeedsService {
  constructor(private readonly arnsApiClient: ArnsApiClient) {}

  async getCriminogenicNeeds(crn: string) {
    const restClient = await this.arnsApiClient.restClient('Getting Criminogenic Needs using crn')
    return restClient.get<CriminogenicNeeds>({ path: `/needs/crn/${crn}` })
  }
}
