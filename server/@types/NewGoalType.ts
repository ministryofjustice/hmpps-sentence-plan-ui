import { GoalStatus } from './GoalType'

export type NewGoal = {
  title: string
  areaOfNeed: string
  targetDate?: string
  relatedAreasOfNeed?: string[]
  status?: GoalStatus
}
