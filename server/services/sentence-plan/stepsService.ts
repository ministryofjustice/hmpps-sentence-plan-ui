import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { NewStep, Step } from '../../@types/StepType'

export default class StepService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  async saveSteps(steps: NewStep[], parentGoalId: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Saving multiple steps')
    return restClient.post<Step[]>({ path: `/goals/${parentGoalId}/steps`, data: steps })
  }

  async saveAllSteps(steps: NewStep[], parentGoalId: string) {
    const restClient = await this.sentencePlanApiClient.restClient('Replacing all steps')
    return restClient.put<Step[]>({ path: `/goals/${parentGoalId}/steps`, data: steps })
  }

  async getSteps(parentGoalId: string): Promise<Step[]> {
    const restClient = await this.sentencePlanApiClient.restClient('Gets multiple steps')
    return restClient.get<Step[]>({ path: `/goals/${parentGoalId}/steps` })
  }

  async getStep(parentGoalId: string, stepId: string): Promise<Step[]> {
    const restClient = await this.sentencePlanApiClient.restClient('Gets single step')
    return restClient.get<Step[]>({ path: `/goals/${parentGoalId}/steps/${stepId}` })
  }

  async saveStep(parentGoalId: string, stepId: string, data: NewStep): Promise<Step[]> {
    const restClient = await this.sentencePlanApiClient.restClient('Saves single step')
    return restClient.post<Step[]>({ path: `/goals/${parentGoalId}/steps/${stepId}`, data })
  }

  async updateStep(parentGoalId: string, stepId: string, data: NewStep): Promise<Step[]> {
    const restClient = await this.sentencePlanApiClient.restClient('Updates single step')
    return restClient.patch<Step[]>({ path: `/goals/${parentGoalId}/steps/${stepId}`, data })
  }

  async deleteStep(parentGoalId: string, stepId: string): Promise<Step[]> {
    const restClient = await this.sentencePlanApiClient.restClient('Deletes single step')
    return restClient.delete<Step[]>({ path: `/goals/${parentGoalId}/steps/${stepId}` })
  }
}
