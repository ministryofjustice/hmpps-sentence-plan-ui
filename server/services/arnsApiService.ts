import ArnsApiClient from '../data/arnsApiClient'
import { CriminogenicNeeds, CriminogenicNeedScore } from '../@types/CriminogenicNeedsType'
import logger from '../../logger'

export default class ArnsApiService {
  constructor(private readonly arnsApiClient: ArnsApiClient) {}

  async getCriminogenicNeeds(crn: string): Promise<CriminogenicNeedScore[]> {
    const restClient = await this.arnsApiClient.restClient('Getting Criminogenic Needs using crn')
    const crimNeeds = await restClient.get<CriminogenicNeeds>({
      path: `/needs/${crn}?excludeIncomplete=false`,
      handle404: true,
    })

    // TODO: remove temporary debug
    logger.info(`Crim needs for CRN ${crn}: ${JSON.stringify(crimNeeds)}`)

    if (crimNeeds === null) {
      return []
    }

    return Array.of(...crimNeeds.identifiedNeeds, ...crimNeeds.notIdentifiedNeeds, ...crimNeeds.unansweredNeeds).reduce(
      (acc, need) => {
        return [
          ...acc,
          {
            section: need.section,
            score: need.score,
          } as CriminogenicNeedScore,
        ]
      },
      [],
    )
  }
}
