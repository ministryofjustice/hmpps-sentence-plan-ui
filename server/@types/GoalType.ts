import { Step } from './StepType'

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  FUTURE = 'FUTURE',
  REMOVED = 'REMOVED',
  COMPLETED = 'COMPLETED',
}

export type Goal = {
  uuid: string
  title: string
  status: GoalStatus
  areaOfNeed: AreaOfNeed
  relatedAreasOfNeed: AreaOfNeed[]
  creationDate: string
  targetDate?: string
  statusDate?: string
  goalOrder: number
  steps: Step[]
}

type AreaOfNeed = {
  uuid: string
  name: string
}
