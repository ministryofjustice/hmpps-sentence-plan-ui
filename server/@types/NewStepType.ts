export type NewStep = {
  description?: string
  actor: {
    actor: string,
    actorOptionId: Number
  }[]
  status?: string
}
