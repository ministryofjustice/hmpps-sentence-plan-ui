import SentencePlanApiClient from '../../data/sentencePlanApiClient'

export default class ReferentialDataService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  getAllQuestionData() {
    return this.sentencePlanApiClient.getAllReferenceData()
  }
}
