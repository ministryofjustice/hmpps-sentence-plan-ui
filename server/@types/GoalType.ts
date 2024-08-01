export type Goal = {
  uuid: string
  title: string
  areaOfNeed: AreaOfNeed
  relatedAreasOfNeed: AreaOfNeed[]
  creationDate: string
  completedDate?: string
  targetDate: string
  goalOrder: number
}

type AreaOfNeed = {
  uuid: string
  name: string
}
