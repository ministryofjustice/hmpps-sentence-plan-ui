import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { RoshData } from '../../@types/Rosh'
import { formatPOPData, formatRoSHData } from '../../utils/utils'
import logger from '../../../logger'

export default class InfoService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  async getPopData(crn: string) {
    try {
      const result = await this.sentencePlanApiClient.getPopData(crn)
      return formatPOPData(result)
    } catch (e) {
      logger.error(e)
      throw new Error("Can't fetch personal data")
    }
  }

  async getRoSHData(crn: string) {
    let rosh: Partial<RoshData> = { hasbeenCompleted: false }
    try {
      rosh = await this.sentencePlanApiClient.getRoSHData(crn)
      return formatRoSHData(rosh as RoshData)
    } catch (e) {
      return rosh
    }
  }
}
