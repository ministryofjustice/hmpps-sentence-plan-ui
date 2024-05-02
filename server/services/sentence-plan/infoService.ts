import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { RoshData } from '../../interfaces/Rosh'
import { formatRoSHData } from '../../utils/utils'

export default class InfoService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  getPopData(crn: string) {
    return this.sentencePlanApiClient.getPopData(crn)
  }

  getRoSHData(crn: string) {
    let rosh: Partial<RoshData> = { hasbeenCompleted: false }
    try {
      rosh = this.sentencePlanApiClient.getRoSHData(crn)
      return formatRoSHData(rosh as RoshData)
    } catch (e) {
      return rosh
    }
  }
}
