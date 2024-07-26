import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { NewGoal } from '../../@types/NewGoalType'
import { Goal } from '../../@types/GoalType'
import { Step } from '../../@types/StepType'

export default class GoalService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  async getGoal(goalUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Getting goal')
    return restClient.get<Goal>({ path: `/goals/${goalUuid}` })
  }

  async saveGoal(goal: NewGoal, parentPlanUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Saving goal data')
    return restClient.post<Goal>({ path: `/plans/${parentPlanUuid}/goals`, data: goal })
  }

  async getGoals(parentPlanUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Getting goals list')
    return restClient.get<Goal[]>({ path: `/plans/${parentPlanUuid}/goals` })
  }

  async changeGoalOrder(goals: Array<Goal>) {
    const restClient = await this.sentencePlanApiClient.restClient('Reordering goals')
    return restClient.post<Step[]>({ path: `/goals/order`, data: goals })
  }
}
