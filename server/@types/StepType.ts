export enum StepStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANNOT_BE_DONE_YET = 'CANNOT_BE_DONE_YET',
}

export type NewStep = {
  description: string
  status: StepStatus
  actor: string
}

export type Step = {
  uuid: string
  creationDate: string
  description: string
  status: StepStatus
  actor: string
}
