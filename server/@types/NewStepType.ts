export type NewStep = {
  description?: string
  actor: {
    actor: string
    actorOptionId: number
  }[]
  status?: string
}
