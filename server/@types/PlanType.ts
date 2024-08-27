export enum PlanAgreementStatus {
  DRAFT = 'DRAFT',
  AGREED = 'AGREED',
  DO_NOT_AGREE = 'DO_NOT_AGREE',
  COULD_NOT_ANSWER = 'COULD_NOT_ANSWER',
}

export type PlanType = {
  uuid: string
  status: string
  agreementStatus: PlanAgreementStatus
  creationDate: Date
  updatedDate: Date
}
