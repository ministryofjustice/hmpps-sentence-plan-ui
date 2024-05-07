import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import { ReferenceData } from '../interfaces/ReferenceDataType'
import { NewGoal } from '../interfaces/NewGoalType'
import { NewStep } from '../interfaces/NewStepType'
import { Goal } from '../interfaces/GoalType'
import { Step } from '../interfaces/StepType'
import { roSHData } from '../testutils/data/roshData'
import HmppsAuthClient from './hmppsAuthClient'

export default class SentencePlanApiClient {
  constructor(private readonly authClient: HmppsAuthClient) {}

  private static restClient(token?: string): RestClient {
    return new RestClient('Sentence Plan Api Client', config.apis.sentencePlanApi, token)
  }

  async getHelloWorld(world: string): Promise<string> {
    logger.info('Calling hello world service')
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).get<string>({ path: `/hello/${world}` })
  }

  async getAllReferenceData(): Promise<ReferenceData> {
    logger.info('Getting question reference data')
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).get<ReferenceData>({ path: `/question-reference-data` })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPopData(crn: string) {
    // TODO: Not implemented on API yet
    return {
      title: 'Miss',
      firstName: 'Joan',
      lastName: 'Scott',
      gender: 'female',
      DoB: new Date('01/01/1997'),
      CRN: '12345678',
      PRC: 'ABC123XYZ',
      courtOrderRequirements: {},
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRoSHData(crn: string) {
    // TODO: Not implemented on API yet
    return roSHData
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getNotesByAreaOfNeed(areaOfNeed: string, crn: string) {
    // TODO: Not implemented on API yet
    // TODO: Probably will return an array of notes, refactor later :)

    return {
      author: 'Joe Bloggs',
      source: 'assessment',
      creationDate: new Date(),
      content:
        'Joan may be required to seek independent accommodation and there needs ot be consideration made of the victim of her index offence, the need to protect her partner and their child and to minimise / prevent opportunities to frequent pro-offending peers.',
    }
  }

  async saveGoal(goal: NewGoal) {
    logger.info('Saving goal data')
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).post<Goal>({ path: `/goals`, data: goal })
  }

  async saveSteps(steps: NewStep[], parentGoalId: string) {
    logger.info('Saving multiple steps')
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).post<Step[]>({ path: `/goals/${parentGoalId}/steps`, data: steps })
  }
}
