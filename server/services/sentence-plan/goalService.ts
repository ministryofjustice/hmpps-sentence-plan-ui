import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { NewGoal } from '../../@types/NewGoalType'
import { Goal } from '../../@types/GoalType'
import { Goals } from '../../@types/GoalsType'
import { GoalOrder } from '../../@types/GoalOrderType'
import { ReAddGoal } from '../../@types/ReAddGoal'

export default class GoalService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  async getGoal(goalUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Getting goal')
    return restClient.get<Goal>({ path: `/goals/${goalUuid}` })
  }

  async replaceGoal(goal: Partial<NewGoal>, goalUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Replace goal data')
    return restClient.put<Goal>({ path: `/goals/${goalUuid}`, data: goal })
  }

  async achieveGoal(note: string, goalUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Achieve goal')
    return restClient.post<Goal>({ path: `/goals/${goalUuid}/achieve`, data: { note } })
  }

  async removeGoal(note: string, goalUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Remove goal')
    return restClient.post<Goal>({ path: `/goals/${goalUuid}/remove`, data: { note } })
  }

  async reAddGoal(goal: ReAddGoal, goalUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Re-add goal')
    return restClient.post<Goal>({ path: `/goals/${goalUuid}/readd`, data: goal })
  }

  async saveGoal(goal: NewGoal, parentPlanUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Saving goal data')
    return restClient.post<Goal>({ path: `/plans/${parentPlanUuid}/goals`, data: goal })
  }

  async deleteGoal(goalUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Removing goal data')
    return restClient.delete({ path: `/goals/${goalUuid}`, raw: true })
  }

  async getGoals(parentPlanUuid: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Getting goals list')
    return restClient.get<Goals>({ path: `/plans/${parentPlanUuid}/goals` })
  }

  async changeGoalOrder(goalOrders: GoalOrder[]) {
    const restClient = await this.sentencePlanApiClient.restClient('Reordering goals')
    return restClient.post({ path: `/goals/order`, data: goalOrders })
  }
}
