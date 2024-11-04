import { GoalStatus } from './GoalType'
import { NewStep } from './StepType'

export type NewGoal = {
  title: string
  areaOfNeed: string
  targetDate?: string
  relatedAreasOfNeed?: string[]
  status?: GoalStatus
  note?: string
  steps?: NewStep[]
}
