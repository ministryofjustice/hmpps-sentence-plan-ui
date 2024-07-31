export type Step = {
  uuid: string
  relatedGoalUuid: string
  description: string
  actor: {
    actor: string
    actorOptionId: number
  }[]
  creationDate?: string
  status?: string
}
