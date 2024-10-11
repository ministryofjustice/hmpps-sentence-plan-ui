import { NewStep, Step, StepStatus } from '../../@types/StepType'

export const testNewStep: NewStep = {
  description: 'A test step',
  actor: 'Test actor',
  status: StepStatus.NOT_STARTED,
}
export const testStep: Step = {
  uuid: 'a-un1qu3-t3st-Uu1d',
  createdDate: new Date().toISOString().substring(0, 10),
  ...testNewStep,
} as Step
