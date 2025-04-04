import { PlanAgreementStatus, PlanStatus, PlanType } from '../../@types/PlanType'
import { testGoal } from './goalData'

const testPlan: PlanType = {
  uuid: 'draft-plan-uuid',
  status: PlanStatus.UNSIGNED,
  agreementStatus: PlanAgreementStatus.DRAFT,
  createdDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  updatedDate: new Date().toISOString(),
  updatedBy: '',
  agreementDate: null,
  mostRecentUpdateDate: new Date().toISOString(),
  goals: [testGoal],
}

const agreedTestPlan: PlanType = {
  uuid: 'agreed-plan-uuid',
  status: PlanStatus.UNSIGNED,
  agreementStatus: PlanAgreementStatus.AGREED,
  createdDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  updatedDate: new Date().toISOString(),
  updatedBy: '',
  agreementDate: new Date().toISOString(),
  mostRecentUpdateDate: new Date().toISOString(),
  goals: [testGoal],
}

const couldNotAnswerTestPlan: PlanType = {
  uuid: 'could-not-answer-plan-uuid',
  status: PlanStatus.UNSIGNED,
  agreementStatus: PlanAgreementStatus.COULD_NOT_ANSWER,
  createdDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  updatedDate: new Date().toISOString(),
  updatedBy: '',
  agreementDate: new Date().toISOString(),
  mostRecentUpdateDate: new Date().toISOString(),
  goals: [testGoal],
}

export default testPlan
export { agreedTestPlan, couldNotAnswerTestPlan }
