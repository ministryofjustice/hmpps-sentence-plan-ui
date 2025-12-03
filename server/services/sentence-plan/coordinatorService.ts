import CoordinatorApiClient from '../../data/coordinatorApiClient'
import { AssessmentResponse } from '../../@types/Assessment'
import { PreviousVersionsResponse } from '../../@types/PlanAndAssessmentVersions'
import { AuthType } from '../../@types/SessionType'

export default class CoordinatorService {
  constructor(private readonly coordinatorApiClient: CoordinatorApiClient) {}

  async getAssessmentByUuid(planUuid: string) {
    const restClient = await this.coordinatorApiClient.restClient(`Getting assessment with plan UUID: ${planUuid}`)
    return restClient.get<AssessmentResponse>({ path: `/entity/${planUuid}/ASSESSMENT`, handle404: true })
  }

  async getVersionsByUuid(entityUuid: string, authType: AuthType) {
    const restClient = await this.coordinatorApiClient.restClient(
      `Getting assessment and plan versions for entity UUID: ${entityUuid}`,
    )
    return restClient.get<PreviousVersionsResponse>({
      path: `/entity/versions/${entityUuid}/${authType}`,
      handle404: true,
    })
  }
}
