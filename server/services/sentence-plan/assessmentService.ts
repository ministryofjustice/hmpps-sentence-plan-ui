import CoordinatorApiClient from '../../data/coordinatorApiClient'
import { AssessmentResponse } from '../../@types/Assessment'

// Anything higher than this value is considered high scoring.
// The names of these fields match the CriminogenicNeedsData interface
export const assessmentAreaThreshold: Map<string, number> = new Map([
  ['accommodation', 1],
  ['educationTrainingEmployability', 1],
  ['drugMisuse', 0],
  ['alcoholMisuse', 1],
  ['personalRelationshipsAndCommunity', 1],
  ['thinkingBehaviourAndAttitudes', 2],
  ['lifestyleAndAssociates', 1],
])

export default class AssessmentService {
  constructor(private readonly assessmentApiClient: CoordinatorApiClient) {}

  async getAssessmentByUuid(planUuid: string) {
    const restClient = await this.assessmentApiClient.restClient(`Getting assessment with plan UUID: ${planUuid}`)
    return restClient.get<AssessmentResponse>({ path: `/entity/${planUuid}/ASSESSMENT`, handle404: true })
  }
}
