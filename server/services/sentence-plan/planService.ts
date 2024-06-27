import SentencePlanApiClient from '../../data/sentencePlanApiClient'

export default class PlanService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  getPlanByUuid = this.sentencePlanApiClient.getPlanByUuid

  getPlanByOasysAssessmentPk = this.sentencePlanApiClient.getPlanByOasysAssessmentPk
}
