import { NewGoal } from '../../@types/NewGoalType'
import { Goal } from '../../@types/GoalType'

const oneWeekInMs = 1000 * 60 * 60 * 24 * 7

export const testNewGoal: NewGoal = {
  title: 'Test goal',
  areaOfNeed: 'Test Area Of Need',
  targetDate: new Date(Date.now() + oneWeekInMs).toISOString().substring(0, 10),
  isAgreed: true,
  agreementNote: 'An agreement note',
}
export const testGoal: Goal = {
  id: 123,
  uuid: 'a-un1qu3-t3st-Uu1d',
  creationDate: new Date().toISOString().substring(0, 10),
  ...testNewGoal,
} as Goal
