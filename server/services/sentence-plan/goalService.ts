import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { NewGoal } from '../../@types/NewGoalType'
import { Goal } from '../../@types/GoalType'

export default class GoalService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  async saveGoal(goal: NewGoal) {
    const restClient = await this.sentencePlanApiClient.restClient('Saving goal data')
    return restClient.post<Goal>({ path: `/goals`, data: goal })
  }
}
