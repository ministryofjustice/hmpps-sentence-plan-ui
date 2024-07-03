import { PlanType } from '../../@types/PlanType'

const testPlan: PlanType = {
  uuid: '51c9f87b-fdb0-4bfb-9350-032672eedca9',
  status: 'incomplete',
  createdAt: new Date(Date.now() - 1000 * 60 * 60),
  updatedAt: new Date(),
}

export default testPlan
