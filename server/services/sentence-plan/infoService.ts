import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { RoshData } from '../../@types/Rosh'
import { formatPOPData, formatRoSHData } from '../../utils/utils'
import logger from '../../../logger'
import { Person } from '../../@types/Person'

export default class InfoService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  async getPopData(crn: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Getting POP data')
    try {
      const result = await restClient.post<Person>({ path: `/info/pop`, data: { crn } })
      return formatPOPData(result)
    } catch (e) {
      logger.error(e)
      throw new Error("Can't fetch personal data")
    }
  }

  async getRoSHData(crn: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Getting roSH data')
    let rosh: Partial<RoshData> = { hasbeenCompleted: false }
    try {
      rosh = await restClient.post<RoshData>({ path: `/info/pop/scores/risk`, data: { crn } })
      return formatRoSHData(rosh as RoshData)
    } catch (e) {
      return rosh
    }
  }
}
