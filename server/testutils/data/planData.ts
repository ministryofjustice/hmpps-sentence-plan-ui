import { PlanAgreementStatus, PlanStatus, PlanType } from '../../@types/PlanType'
import { testGoal } from './goalData'

const testPlan: PlanType = {
  uuid: 'draft-plan-uuid',
  status: PlanStatus.UNSIGNED,
  agreementStatus: PlanAgreementStatus.DRAFT,
  createdDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  updatedDate: new Date().toISOString(),
  goals: [testGoal],
}

const agreedTestPlan: PlanType = {
  uuid: 'agreed-plan-uuid',
  status: PlanStatus.UNSIGNED,
  agreementStatus: PlanAgreementStatus.AGREED,
  createdDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  updatedDate: new Date().toISOString(),
  goals: [testGoal],
}

export default testPlan
export { agreedTestPlan }
