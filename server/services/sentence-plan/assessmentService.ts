import CoordinatorApiClient from '../../data/coordinatorApiClient'
import { AssessmentResponse } from '../../@types/Assessment'

export default class AssessmentService {
  constructor(private readonly assessmentApiClient: CoordinatorApiClient) {}

  async getAssessmentByUuid(planUuid: string) {
    const restClient = await this.assessmentApiClient.restClient(`Getting assessment with plan UUID: ${planUuid}`)
    return restClient.get<AssessmentResponse>({ path: `/entity/${planUuid}/ASSESSMENT`, handle404: true })
  }
}
