import { Goal } from './GoalType'

export enum PlanAgreementStatus {
  DRAFT = 'DRAFT',
  AGREED = 'AGREED',
  DO_NOT_AGREE = 'DO_NOT_AGREE',
  COULD_NOT_ANSWER = 'COULD_NOT_ANSWER',
}

export enum PlanStatus {
  AWAITING_COUNTERSIGN = 'AWAITING_COUNTERSIGN',
  AWAITING_DOUBLE_COUNTERSIGN = 'AWAITING_DOUBLE_COUNTERSIGN',
  COUNTERSIGNED = 'COUNTERSIGNED',
  DOUBLE_COUNTERSIGNED = 'DOUBLE_COUNTERSIGNED',
  LOCKED_INCOMPLETE = 'LOCKED_INCOMPLETE',
  REJECTED = 'REJECTED',
  ROLLED_BACK = 'ROLLED_BACK',
  SELF_SIGNED = 'SELF_SIGNED',
  UNSIGNED = 'UNSIGNED',
}

export type PlanType = {
  uuid: string
  status: PlanStatus
  agreementStatus: PlanAgreementStatus
  createdDate: string
  updatedDate: string
  updatedBy: string
  agreementDate: string
  mostRecentUpdateDate: string
  goals: Goal[]
}
