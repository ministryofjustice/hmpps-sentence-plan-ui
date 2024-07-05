export type Step = {
  uuid: string
  relatedGoalUuid: string
  description: string
  actor: string[]
  creationDate?: string
  status?: string
}
