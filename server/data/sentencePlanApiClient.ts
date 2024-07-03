import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import { ReferenceData } from '../@types/ReferenceDataType'
import { NewGoal } from '../@types/NewGoalType'
import { NewStep } from '../@types/NewStepType'
import { Goal } from '../@types/GoalType'
import { Step } from '../@types/StepType'
import HmppsAuthClient from './hmppsAuthClient'
import { Person } from '../@types/Person'
import { RoshData } from '../@types/Rosh'
import { PlanType } from '../@types/PlanType'

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

  async getPopData(crn: string): Promise<Person> {
    logger.info('Getting roSH data')
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).post<Person>({ path: `/info/pop`, data: { crn } })
  }

  async getRoSHData(crn: string): Promise<RoshData> {
    logger.info('Getting roSH data')
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).post<RoshData>({ path: `/info/pop/scores/risk`, data: { crn } })
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

  async saveGoal(goal: NewGoal, parentPlanUuid: string) {
    logger.info('Saving goal data')
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).post<Goal>({
      path: `/plans/${parentPlanUuid}/goals`,
      data: goal,
    })
  }

  async saveSteps(steps: NewStep[], parentGoalUuid: string) {
    logger.info('Saving multiple steps')
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).post<Step[]>({
      path: `/goals/${parentGoalUuid}/steps`,
      data: steps,
    })
  }

  async getPlanByUuid(planUuid: string) {
    logger.info(`Getting plan with plan UUID: ${planUuid}`)
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).get<PlanType>({ path: `/plans/${planUuid}` })
  }

  async getPlanByOasysAssessmentPk(oasysAssessmentPk: string) {
    logger.info(`Getting plan with OASys Assessment PK: ${oasysAssessmentPk}`)
    const token = await this.authClient.getSystemClientToken()
    return SentencePlanApiClient.restClient(token).get<PlanType>({ path: `/oasys/plans/${oasysAssessmentPk}` })
  }
}
