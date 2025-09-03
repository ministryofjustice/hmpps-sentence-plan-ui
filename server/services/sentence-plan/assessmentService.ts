import CoordinatorApiClient from '../../data/coordinatorApiClient'
import { AssessmentResponse } from '../../@types/Assessment'
import { PreviousVersionsResponse } from '../../@types/PlanAndAssessmentVersions'

export default class AssessmentService {
  constructor(private readonly assessmentApiClient: CoordinatorApiClient) {}

  async getAssessmentByUuid(planUuid: string) {
    const restClient = await this.assessmentApiClient.restClient(`Getting assessment with plan UUID: ${planUuid}`)
    return restClient.get<AssessmentResponse>({ path: `/entity/${planUuid}/ASSESSMENT`, handle404: true })
  }

  async getVersionsByUuid(entityUuid: string) {
    const restClient = await this.assessmentApiClient.restClient(
      `Getting assessment and plan versions for entity UUID: ${entityUuid}`,
    )
    const response = restClient.get<PreviousVersionsResponse>({
      path: `/entity/versions/${entityUuid}`,
      handle404: true,
    })
    return response
  }
}
