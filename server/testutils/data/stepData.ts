import { NewStep } from '../../@types/NewStepType'
import { Step } from '../../@types/StepType'
import { testGoal } from './goalData'

export const testNewStep: NewStep = {
  description: 'A test step',
  actor: 'The actor',
  status: 'PENDING',
}
export const testStep: Step = {
  id: 123,
  uuid: 'a-un1qu3-t3st-Uu1d',
  relatedGoalUuid: testGoal.uuid,
  creationDate: new Date().toISOString().substring(0, 10),
  ...testNewStep,
}
