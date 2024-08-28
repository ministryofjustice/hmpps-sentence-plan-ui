import { PlanAgreementStatus, PlanStatus, PlanType } from '../../@types/PlanType'
import { testGoal } from './goalData'

const testPlan: PlanType = {
  uuid: '51c9f87b-fdb0-4bfb-9350-032672eedca9',
  status: PlanStatus.INCOMPLETE,
  agreementStatus: PlanAgreementStatus.DRAFT,
  creationDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  updatedDate: new Date().toISOString(),
  goals: [testGoal],
}

export default testPlan
