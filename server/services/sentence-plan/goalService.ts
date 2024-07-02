import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { NewGoal } from '../../@types/NewGoalType'

export default class GoalService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  saveGoal(goal: NewGoal, parentPlanUuid: string) {
    return this.sentencePlanApiClient.saveGoal(goal, parentPlanUuid)
  }
}
