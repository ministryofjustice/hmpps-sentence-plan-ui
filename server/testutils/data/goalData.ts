import { NewGoal } from '../../@types/NewGoalType'
import { Goal } from '../../@types/GoalType'

const oneWeekInMs = 1000 * 60 * 60 * 24 * 7

export const testNewGoal: NewGoal = {
  title: 'Test goal',
  areaOfNeed: 'Test area of need',
  targetDate: new Date(Date.now() + oneWeekInMs).toISOString().substring(0, 10),
  relatedAreasOfNeed: ['Test related area of need'],
}
export const testGoal: Goal = {
  ...testNewGoal,
  id: 123,
  uuid: 'a-un1qu3-t3st-Uu1d',
  creationDate: new Date().toISOString().substring(0, 10),
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
} as Goal
