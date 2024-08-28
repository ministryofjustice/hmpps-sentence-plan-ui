import { Goal } from './GoalType'

export enum PlanAgreementStatus {
  DRAFT = 'DRAFT',
  AGREED = 'AGREED',
  DO_NOT_AGREE = 'DO_NOT_AGREE',
  COULD_NOT_ANSWER = 'COULD_NOT_ANSWER',
}

export enum PlanStatus {
  INCOMPLETE = 'INCOMPLETE',
  COMPLETE = 'COMPLETE',
  LOCKED = 'LOCKED',
  SIGNED = 'SIGNED',
}

export type PlanType = {
  uuid: string
  status: PlanStatus
  agreementStatus: PlanAgreementStatus
  creationDate: string
  updatedDate: string
  goals: Goal[]
}
