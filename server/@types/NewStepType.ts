export type NewStep = {
  description?: string
  actors: Actor[]
  status?: string
}

type Actor = {
  actor: string
  actorOptionId: number
}
