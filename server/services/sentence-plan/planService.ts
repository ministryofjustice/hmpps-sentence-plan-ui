import { PlanType } from '../../@types/PlanType'
import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { PlanAgreement } from '../../@types/PlanAgreement'
import { NoteType } from '../../@types/NoteType'

export default class PlanService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  async getPlanByUuid(planUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient(`Getting plan with plan UUID: ${planUuid}`)
    return restClient.get<PlanType>({ path: `/plans/${planUuid}` })
  }

  async getPlanByUuidAndVersionNumber(planUuid: string, planVersionNumber: number) {
    const restClient = await this.sentencePlanApiClient.restClient(
      `Getting plan with plan UUID and version: ${planUuid}, ${planVersionNumber}`,
    )
    return restClient.get<PlanType>({ path: `/plans/${planUuid}/version/${planVersionNumber}` })
  }

  async getPlanByOasysAssessmentPk(oasysAssessmentPk: string) {
    const restClient = await this.sentencePlanApiClient.restClient(
      `Getting plan with OASys Assessment PK: ${oasysAssessmentPk}`,
    )
    return restClient.get<PlanType>({ path: `/oasys/plans/${oasysAssessmentPk}` })
  }

  async agreePlan(planUuid: string, agreement: PlanAgreement) {
    const restClient = await this.sentencePlanApiClient.restClient(`Agreeing plan with plan UUID: ${planUuid}`)
    return restClient.post<PlanType>({ path: `/plans/${planUuid}/agree`, data: agreement })
  }

  async getNotes(planUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient(`Getting notes for plan with plan UUID: ${planUuid}`)
    return restClient.get<NoteType[]>({ path: `/plans/${planUuid}/notes` })
  }
}
