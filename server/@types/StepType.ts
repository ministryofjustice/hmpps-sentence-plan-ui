export enum StepStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  CANNOT_BE_DONE_YET = 'CANNOT_BE_DONE_YET',
  NO_LONGER_NEEDED = 'NO_LONGER_NEEDED',
  COMPLETED = 'COMPLETED',
}

export type NewStep = {
  description: string
  status: StepStatus
  actor: string
  updated: number
}

export type Step = {
  uuid: string
  createdDate: string
  description: string
  status: StepStatus
  actor: string
}
