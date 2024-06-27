import { PlanType } from '../../@types/PlanType'

const testPlan: PlanType = {
  uuid: '123-xyz-abc-456',
  status: 'incomplete',
  createdAt: new Date(Date.now() - 1000 * 60 * 60),
  updatedAt: new Date(),
}

export default testPlan
