import SentencePlanApiClient from '../../data/sentencePlanApiClient'

export default class InfoService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  getPopData(crn: string) {
    return this.sentencePlanApiClient.getPopData(crn)
  }
}
