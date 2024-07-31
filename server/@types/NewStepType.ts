export type NewStep = {
  description?: string
  actor: Actor[]
  status?: string
}

type Actor = {
  actor: string
  actorOptionId: number
}
