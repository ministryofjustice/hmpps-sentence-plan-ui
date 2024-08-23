import { NewStep, Step, StepStatus } from '../../@types/StepType'

export const testNewStep: NewStep = {
  description: 'A test step',
  actors: [
    {
      actor: 'Test actor',
      actorOptionId: 1,
    },
  ],
  status: 'PENDING',
}
export const testStep: Step = {
  uuid: 'a-un1qu3-t3st-Uu1d',
  creationDate: new Date().toISOString().substring(0, 10),
  ...testNewStep,
} as Step
