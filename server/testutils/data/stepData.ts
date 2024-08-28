import { NewStep, Step, StepStatus } from '../../@types/StepType'
import { testGoal } from './goalData'

export const testNewStep: NewStep = {
  description: 'A test step',
  actor: 'Test actor',
  status: StepStatus.NOT_STARTED,
}
export const testStep: Step = {
  id: 123,
  uuid: 'a-un1qu3-t3st-Uu1d',
  relatedGoalUuid: testGoal.uuid,
  creationDate: new Date().toISOString().substring(0, 10),
  ...testNewStep,
} as Step
