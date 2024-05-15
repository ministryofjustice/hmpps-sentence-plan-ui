import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { NewStep } from '../../@types/NewStepType'

export default class StepService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  saveSteps(steps: NewStep[], parentGoalId: string) {
    return this.sentencePlanApiClient.saveSteps(steps, parentGoalId)
  }
}
