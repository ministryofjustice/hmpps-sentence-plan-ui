export type Step = {
  uuid: string
  description: string
  status?: string
  creationDate?: string
  actor: Actor[]
}

type Actor = {
  actor: string
  actorOptionId: number
}
