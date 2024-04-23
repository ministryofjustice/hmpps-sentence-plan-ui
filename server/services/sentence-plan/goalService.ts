import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { NewGoal } from '../../interfaces/NewGoalType'

export default class GoalService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  saveGoal(goal: NewGoal) {
    return this.sentencePlanApiClient.saveGoal(goal)
  }
}
