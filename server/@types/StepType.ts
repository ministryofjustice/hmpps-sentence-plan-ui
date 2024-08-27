export type Step = {
  uuid: string
  description: string
  status?: string
  creationDate?: string
  actors: Actor[]
}

type Actor = {
  actor: string
  actorOptionId: number
}
