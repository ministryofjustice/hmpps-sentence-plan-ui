import { PlanAgreementStatus } from './PlanType'

export type PlanAgreement = {
  practitionerName: string
  personName: string
  optionalNote?: string
  agreementStatus: PlanAgreementStatus
  agreementStatusNote?: string
}
