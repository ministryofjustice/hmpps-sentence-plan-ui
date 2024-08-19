import { Step } from './StepType'

export type Goal = {
  uuid: string
  title: string
  areaOfNeed: AreaOfNeed
  relatedAreasOfNeed: AreaOfNeed[]
  creationDate: string
  completedDate?: string
  targetDate: string
  goalOrder: number
  steps: Step[]
}

type AreaOfNeed = {
  uuid: string
  name: string
}
