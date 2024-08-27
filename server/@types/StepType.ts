export enum StepStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED_ = 'COMPLETED',
  CANNOT_BE_STARTED_YET = 'CANNOT_BE_STARTED_YET',
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
