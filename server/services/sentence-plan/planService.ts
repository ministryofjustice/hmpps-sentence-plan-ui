import SentencePlanApiClient from '../../data/sentencePlanApiClient'

export default class PlanService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  getPlanByUuid = (uuid: string) => this.sentencePlanApiClient.getPlanByUuid(uuid)

  getPlanByOasysAssessmentPk = (oasysAssessmentPk: string) =>
    this.sentencePlanApiClient.getPlanByOasysAssessmentPk(oasysAssessmentPk)
}
