import moment from 'moment'
import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { RoshData } from '../../@types/rosh'

const unComplitedRoSH = { hasBeenCompleted: false }

moment.locale('en-gb')

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
export function formatRoSHData(data: RoshData) {
  const { overallRisk, assessedOn, riskInCommunity } = data
  if ([overallRisk, assessedOn, riskInCommunity].includes(undefined)) {
    return unComplitedRoSH
  }
  return {
    hasBeenCompleted: true,
    riskInCommunity,
    lastUpdated: moment(assessedOn).format('LL'),
  }
}
