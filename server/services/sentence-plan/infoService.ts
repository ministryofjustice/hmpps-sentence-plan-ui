import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { RoshData } from '../../interfaces/Rosh'
import { unComplitedRoSH } from '../../testutils/data/roshData'
import { formatRoSHData } from '../../utils/utils'

export default class InfoService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  getPopData(crn: string) {
    return this.sentencePlanApiClient.getPopData(crn)
  }

  getRoSHData(crn: string) {
    try {
      const result: RoshData = this.sentencePlanApiClient.getRoSHData(crn)
      const formatedRosh = formatRoSHData(result)
      return formatedRosh
    } catch (e) {
      return unComplitedRoSH
    }
  }
}
