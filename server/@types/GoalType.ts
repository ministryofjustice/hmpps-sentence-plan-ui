export type Goal = {
  uuid: string
  title: string
  areaOfNeed: AreaOfNeed
  relatedAreasOfNeed: AreaOfNeed[]
  creationDate: string
  completedDate?: string
  targetDate: string
  goalOrder?: number
  moveUpURL?: string
  moveDownURL?: string
}

type AreaOfNeed = {
  uuid: string
  name: string
}
