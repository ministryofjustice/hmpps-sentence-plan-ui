import { NewGoal } from '../../@types/NewGoalType'
import { Goal, GoalStatus } from '../../@types/GoalType'
import { testStep } from './stepData'

const oneWeekInMs = 1000 * 60 * 60 * 24 * 7

export const testNewGoal: NewGoal = {
  title: 'Test goal',
  areaOfNeed: 'Health and wellbeing',
  targetDate: new Date(Date.now() + oneWeekInMs).toISOString().substring(0, 10),
  relatedAreasOfNeed: ['Drug use'],
}
export const testGoal: Goal = {
  ...testNewGoal,
  uuid: 'a-un1qu3-t3st-Uu1d',
  creationDate: new Date().toISOString().substring(0, 10),
  status: GoalStatus.ACTIVE,
  goalOrder: 1,
  areaOfNeed: {
    name: testNewGoal.areaOfNeed,
    uuid: 'some-random-uuid',
  },
  relatedAreasOfNeed: [
    {
      name: testNewGoal.relatedAreasOfNeed[0],
      uuid: 'some-random-related-uuid',
    },
  ],
  steps: [testStep],
}
