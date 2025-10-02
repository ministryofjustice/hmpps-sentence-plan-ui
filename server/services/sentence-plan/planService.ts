import { PlanEntity, PlanType } from '../../@types/PlanType'
import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { PlanAgreement } from '../../@types/PlanAgreement'
import { NoteType } from '../../@types/NoteType'
import logger from '../../../logger'

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

  async getPlanVersionByVersionUuid(planVersionUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient(`Getting plan version with UUID: ${planVersionUuid}`)
    return restClient.get<PlanType>({ path: `/plans/version/${planVersionUuid}` })
  }

  async agreePlan(planUuid: string, agreement: PlanAgreement) {
    const restClient = await this.sentencePlanApiClient.restClient(`Agreeing plan with plan UUID: ${planUuid}`)
    return restClient.post<PlanType>({ path: `/plans/${planUuid}/agree`, data: agreement })
  }

  async getNotes(planUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient(`Getting notes for plan with plan UUID: ${planUuid}`)
    return restClient.get<NoteType[]>({ path: `/plans/${planUuid}/notes` })
  }

  async associate(planUuid: string, crn: string) {
    const restClient = await this.sentencePlanApiClient.restClient(
      `Associate plan with CRN: planUuid: ${planUuid} crn: ${crn} `,
    )
    return restClient.put<PlanType>({ path: `/plans/associate/${planUuid}/${crn}` })
  }

  async getPlanByCrn(crn: string) {
    const restClient = await this.sentencePlanApiClient.restClient(`Getting plan UUID for CRN: ${crn}`)
    // TODO: '/plans/crn/:crn/ returns PlanEntity, not PlanVersionEntity (which we map to PlanType.ts)
    //  would be good to make a type for this, but, it's pretty much only used here.
    const plans = await restClient.get<PlanEntity[]>({ path: `/plans/crn/${crn}` })

    // NOTE: Currently this endpoint responds with an array of PlanType, this is _kind of_ a safety precaution in
    //  case somehow a CRN ends up with multiple plans associated. This shouldn't happen, but until we get more clarity,
    //  just take the first plan from the array.
    if (plans.length > 1) {
      logger.warn('More than one plan was returned, choosing first')
    }

    return plans[0]
  }
}
