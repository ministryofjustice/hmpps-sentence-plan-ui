import { NewStep } from '../../@types/NewStepType'
import { Step } from '../../@types/StepType'
import { testGoal } from './goalData'

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
