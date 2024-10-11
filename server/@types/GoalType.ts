import { Step } from './StepType'

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  FUTURE = 'FUTURE',
  REMOVED = 'REMOVED',
  ACHIEVED = 'ACHIEVED',
}

export type Goal = {
  uuid: string
  title: string
  status: GoalStatus
  areaOfNeed: AreaOfNeed
  relatedAreasOfNeed: AreaOfNeed[]
  createdDate: string
  targetDate?: string
  statusDate?: string
  goalOrder: number
  steps: Step[]
}

type AreaOfNeed = {
  uuid: string
  name: string
}
