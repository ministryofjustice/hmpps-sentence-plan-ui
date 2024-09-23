export enum StepStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANNOT_BE_DONE_YET = 'CANNOT_BE_DONE_YET',
  NO_LONGER_REQUIRED = 'NO_LONGER_REQUIRED',
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
